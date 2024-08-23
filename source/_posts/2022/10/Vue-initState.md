---
title: Vue：beforeCreate -> created <W8>
tags:
  - Vue
  - 源码
  - 深入浅出-Vue-js
categories:
  - [笔记]
  - [日常]
  - [每周一篇]
mathjax: false
date: 2022-10-22 15:21:59
---

{% asset_img banner.png %}

> 如上图所示，Vue 在 `beforeCreate -> created` 阶段，按这个步骤进行初始化操作。按照这个顺序，也就意味着后者初始化的时候，可以使用前者已经初始化的变量。例如：在 `data` 中可以使用 `methods` 里定义的方法，也可以用 `props` 引入的属性进行初始化。

## initInjections

_`inject` 的使用请参考[官方文档](https://v2.cn.vuejs.org/v2/api/#provide-inject)。_

- 先获取当前实例上注册的 `inject`，读取每一个 `key`；

- 然后自底向上不断循环获取父组件的 `provide` 中是否有提供该 `key`：

  ```js
  // 自底向上循环，获取父组件的 provide
  let curr = this
  while (curr) {
    if (curr.provide && key in curr.provide) {
      // ...
      break
    }
    curr = curr.$parent
  }
  ```

  - 若找到了，则跳出循环，并返回结果；
  - 若未找到，则使用配置的默认值 `default`；
  - 特殊的，对于 `default` 为 `function` 类型（非原始值的默认值），则会将该方法通过 `call` 修改 `this` 为当前实例后，再将执行结果返回；
  - 如果既没找到，也没设置 `default`，则抛出一个 `非生产警告`。

  <b>

- 然后对于收集到的结果，会遍历每一个 `key`，然后通过 `defineReactive` 注册到当前实例上，而在 `defineReactive` 前会有一个 "取消响应式" 的操作：

  ```js
  observerState.shouldConvert = false
  ```

  这一步就是通知 `defineReactive` 不要将接下来挂载的数据转换成响应式数据，这也就印证了官方说的 `inject` 注入的内容不是响应式数据。其实就是把提供的 `provide` 的内容在引入 `inject` 的实例上，重新复制了一份。如果是基本数据类型，只是值复制，那么自然而然不是响应式数据，但是如果是引用类型，还是引用的同一个地址，如果源数据是响应式的，那么 `inject` 引入的也是响应式数据。

  如果想实现基础数据类型的响应式呢？换个角度，如果我们把 `provide` 提供的属性的 `this` 绑定在原实例上，那么是否就能通过原实例的 `this` 访问到原实例上的一些响应式的数据？那么 `inject` 注入的内容是不是就是响应式的呢？

  看一个例子：

  <b>

  - 父组件

    ```js
    // parent
    <template>
      <div>
        <input v-model="msg"></input>
      </div>
    </template>

    <script>
    export default {
      provide() {
        return {
          getMsg: () => this.msg,
          getMsg2() { return this.msg },
          getMsg3: this.getMsg3,
        };
      },
      data() {
        return {
          msg: "parent msg",
        };
      },
    };
    </script>
    ```

    <b>

  - 子组件

    ```js
    // child
    <template>
      <div>
        <p>getMsg: {{ msg1 }}</p>
        <p>getMsg2: {{ msg2 }}</p>
        <p>getMsg3: {{ msg3 }}</p>
      </div>
    </template>

    <script>
    export default {
      inject: ["getMsg", "getMsg2", "getMsg3"],
      computed: {
        msg1() {
          return this.getMsg()
        },
        msg2() {
          return this.getMsg2()
        },
        msg3() {
          return this.getMsg3()
        }
      }
    }
    </script>
    ```

子组件中的 `msg1` 和 `msg3` 是响应式的，而 `msg2` 为空（`""`）。这其实就是 `this` 指向的问题：

- `msg1`：箭头函数的 `this` 是由创建时的环境决定的，也即 `this == ParentVm(父组件实例)`，所以 `getMsg() == "parent msg"`。
- `msg2`：正常的函数调用的 `this` 由当前的执行环境决定，也即 `this == ChildVm(子组件实例)`，因为子组件上没有定义 `msg`，所以 `getMsg2() == undefined`，通过 `{{}}` 渲染到页面上就是 `""(空字符串)`。
- `msg3`：根据结果论，`getMsg` 和 `getMsg3` 的 `this` 都指向 `ParentVm`，这里就涉及到 `methods` 的初始化了，在下面 `initMethods` 章节里会有详细说明。

## initState

### initProps

_`props` 的使用请参考[官方文档](https://cn.vuejs.org/v2/guide/components-props.html)。_

- 在解析模板生成 render 函数的阶段，会将解析到的 `props` 数据传递给子组件，在子组件中使用 `props` 中的参数，会触发对应参数的 `getter`，然后将子组件中对应的 `Watcher` 放入当前参数的依赖中，从而实现在父组件更新值后，子组件也会同步更新。
- 在父组件模板中给子组件传递属性，既可以以短杠的形式 `user-name`，也可以用小驼峰的形式 `userName`，不过在子组件中注册到 `props` 中，只能以 `userName` 的形式接收。
- 只有在当前是根组件时，才会将 `props` 中的数据转换为响应式数据。因为从父组件传入的 `props` 都已经在父组件中定义成响应式了，子组件只是引入，并在使用的时候，再往 `props` 里添加对应的依赖，所以不需要转为响应式。特殊的，对于父组件没有提供，且定义了 `default` 的 `prop`，需要将默认值转为响应式。
- `Boolean` 类型 `prop` 的处理：以下四种情况都会将子组件的 `prop` 设置为 `true`：

  ```js
  <child name />
  <child name="name" />
  <child userName="user-name" />
  <child user-name="user-name" />
  ```

  比对时，会将 `key` 进行驼峰转化，即 `userName -> user-name`，如果与提供的值相等，那么也设置为 `true`。

- 最后，遍历 `props` 中的每一项，然后将不在当前 `vm` 实例上的，设置一层代理，然后挂载在 `vm` 实例上。

### initMethods

- 遍历 `$options.methods`，先检验是否有与 `props` 中的有重复的，如果有，则抛出一个 `非生产警告`。注意这只是一个警告，如果没有修正，那么依然还会将当前 `methods` 挂载在当前实例上（也即，如果某一个 `key` 同时存在于 `props` 和 `methods` 上，那么最后使用时，使用的是 `methods` 上的）。
- 挂载时会通过 `bind` 修改 `methods` 的 `this` 为当前实例。

### initData

- 特殊的，`data` 必须是一个对象，或者是一个返回对象的函数。
- 遍历 `data` 的校验阶段：

  - 先判断，如果属性已存在于 `methods` 中，则抛出一个 `非生产警告`；
  - 再判断，如果属性已存在于 `props` 中，抛出一个 `非生产警告`，但是不会挂载，只有当前属性不以 `$` 或 `_` 开头时，才会代理到实例上。

{% blockquote %}

Vue 内部使用的代理方法

```js
const noop = _ => _
const sharePropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function proxy(target, sourceKey, key) {
  sharePropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }

  sharePropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val
  }

  Object.defineProperty(target, key, sharePropertyDefinition)
}
```

{% endblockquote %}

### initComputed

_`computed` 的使用请参考[官方文档](https://cn.vuejs.org/v2/guide/computed.html#%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7)。_

- 先检验，如果当前的属性名已存在 `vm` 上，则不会处理这个属性。
- 收集当前 `getter` 中所有用到的属性的依赖，当这些属性变化时，通知 `computed Watcher` 去更新。

{% blockquote %}

在 18 年有人提了一个 _Issue_ ：`computed` 依赖的值发生了变化，但 `computed` 的值没有改变，仍然会触发 `render`。官方虽然在后续也重新解决了，不过我最近用最新版的 _Vue2.7_ 试了试，貌似还存在这个问题（[戳这里](https://codepen.io/olderk/pen/XWqvyKV)）。

{% endblockquote %}

粗略地看了看，尝试解释一下。比如下面这个：_sum_ 依赖于 _a_ 和 _b_ ，其中 _sum_ 的 _Watcher_ 有一个：`render Watcher`，按理说 _a_ 和 _b_ 的 _Watcher_ 应该只有一个 `computed Watcher`，那就是当 _a_ 或 _b_ 发生变化后，通知计算属性 _sum_ 重新计算，但是这样无法通知 _sum_ 的 _Watcher_ 去更新。所以 _sum_ 的每个依赖里都会把 _sum_ 的 _Watcher_ 存一份，也即 _a_ 和 _b_ 的 _Watcher_ 里还有一份 `render Watcher`。然后就导致，就算 _a_ 和 _b_ 的值同时改变了，但是 _sum_ 的结果没变，还是会触发 `render Watcher`，重新执行一次 _render_ 。虽然在 _diff_ 阶段，最新的一次 _render_ 没有任何变化，但还是会造成性能的浪费。（个人愚见哈 😂）

```js
<template>
  <div>{{ sum }}</div>
</template>
<script>
export default {
  computed: {
    sum() {
      return this.a + this.b
    }
  }
}
</script>
```

### initWatch

_`watch` 的使用请参考[官方文档](https://cn.vuejs.org/v2/guide/computed.html#%E4%BE%A6%E5%90%AC%E5%99%A8)。_

初始化时，创建 `Watcher` 与 `$watch` 使用的是同一个方法。参数类型可以为 `String`、`Function`、`Object` 和 `Array` 这四种类型。

```js
watch: {
  a: function(newVal, oldVal) {},
  b: 'handlerWatchB',
  c: {
    handler(newVal, oldVal) {},
    deep: false,
    immediate: false
  },
  d: [
    function handlerWatchD1(newVal, oldVal){},
    function handlerWatchD2(newVal, oldVal){},
  ]
}
```

鉴于参数的特殊性，需要对类型为 `Array` 的特殊处理，批量创建 `Watcher`。

```js
// 创建 Watcher
function createWatcher(vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === "string") {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}
```

## initProvide

_`provide` 的使用请参考[官方文档](https://v2.cn.vuejs.org/v2/api/#provide-inject)。_

- 如果是 `object` 类型，则直接挂载在当前实例上；
- 如果是 `function` 类型，则通过 `call` 修改 `this` 为当前实例后，再将执行结果返回。
