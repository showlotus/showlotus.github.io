---
title: ivu-input-number-union <W7>
date: 2022-10-15 19:51:58
mathjax: false
tags:
  - ViewDesign
  - ivu-0extends
  - ivu-0input-0number
categories:
  - [日常]
  - [每周一篇]
---

{% asset_img banner.jpg %}

> 最近朋友问我，多个数字输入框联动怎么做？他遇到一个需求，表格里的某一列是输入数字输入框，有多行，而最后一行是这些数字的总和。要达到的效果是，当输入框中的数字和超出总和时，清空所有输入框；如果未超出最大值，且还剩一个输入框未输入时，自动对最后一个输入框赋值。刚好前一段时间，做了一个下拉框联动的，两者的大体思路是相同的。首先是采用指令去实现，过程稍稍有点复杂，于是最后又实现了一个二次封装组件的版本。（下面直接通过 iframe 引用了 codepen 上写好的一个案例，可以试一试）

<div class="iframe-codepen" src="https://codepen.io/olderk/full/eYrQBVm" width="100%" height="500"></div>

## 指令版本

### 思路

多个组件联动，首先想到的就是需要有一个【组】的概念，用来记录这些组件的信息。而要把多个绑定相同指令的组件联系起来，就需要通过它们的组件上下文实例进行联系，也即，要把【组】的信息挂在当前 Vue 实例上，这样绑定在同一个组下的每个组件都能访问到这个【组】里的信息了。为了方便分组，需要在指令里传入一个组名，这里通过指令的 `arg` 参数传入组名。

```js
<InputNumber v-input-number-union:group1></InputNumber>
```

在指令的 `bind` 阶段，进行初始化操作：

```js
export default {
  bind(el, binding, vnode) {
    const { arg } = binding
    const groupName = `_ivu-input-number-union-group-${arg}`
    const that = vnode.context
    const group = (that[groupName] = that[groupName] || {})
  }
}
```

光挂载还不行，还要把当前组件的实时信息同步到【组】中，也即，需要监听每个输入框的值变化，将变化同步到【组】中。只监听也不行，如果当前组件被卸载了，那么监听还存在，可能会产生一些 _SideEffect_ 。所以，还要在指令的解绑阶段，移除监听。在指令中监听属性，采用的是 _Vue_ 的 `$watch` 方法。这个方法执行完后会返回一个卸载的方法，执行这个方法就会将监听从监听对象的依赖中移除。因此，还需要保存这些监听返回的方法。与 `group` 类似，也要挂在当前组件上下文中。

```js
export default {
  bind(el, binding, vnode) {
    /* ... */
    const watcherName = `${groupName}-watch`
    const that = vnode.context
    const watcher = (that[watcherName] = that[watcherName] || {})
  }
}
```

这个监听对象，可能是一个普通属性，也可能是某个对象下的属性。例如，它可以是 `value`，也可以是 `obj.value`。这两种形式，`$watch` 都可以监听得到，前提是需要在指令中提供这个属性的链式字符串。

```js
<InputNumber v-input-number-union:group1="{ value: 'value' }"></InputNumber>
// 或者
<InputNumber v-input-number-union:group1="{ value: 'obj.value' }"></InputNumber>
```

知道这个需要监听的属性后，就可以收集监听了。同样在 `unbind` 阶段，卸载对应的监听。

```js
export default {
  bind(el, binding, vnode) {
    /* ... */
    const { value: key } = binding.value
    // 收集监听
    watcher[key] = that.$watch(key, (newVal, oldVal) => {
      group[key] = newVal
      /* ... */
    })
  },
  unbind(el, binding, vnode) {
    const { value: key } = binding.value
    const that = vnode.context
    // 解绑指令时，卸载监听，移除 watcher 中的属性
    if (watcher[key]) {
      watcher[key]()
      delete watcher[key]
    }
  }
}
```

接下来就是监听函数内部的逻辑（重中之重），列一下整体步骤：

- 将最新的值更新到【组】中；
- 特殊情况处理：
  - 如果新值为 `null`，说明是赋空操作，直接 `return`；
  - 如果组中只有一个元素，直接提前 `return`；
  - 如果组中有两个元素，当前值变化时，直接更新另一个值；
  - 如果旧值为 `null`，并且未填写的输入框数量为 0，说明是对最后一个输入框自动赋值，直接 `return`；
- 如果当前已填写值的和大于最大值，则全部赋空，然后 `return`；
- 如果当前未填写值的输入框个数为 1，则对最后一个输入框自动赋值（最大值 - 当前和）。

### 整体代码

> 在 [codepen.io](https://codepen.io/olderk/pen/eYrQBVm) 中运行。

```js
// input-number-union.js
const noop = v => v

export default {
  bind(el, binding, vnode) {
    const { arg, value } = binding
    const groupName = `_ivu-input-number-union-group-${arg}`
    const watcherName = `${groupName}-watch`
    el._group = groupName
    el._watcher = watcherName
    const { max, value: key } = value
    el._key = key
    const that = vnode.context
    const group = (that[groupName] = that[groupName] || {})
    const watcher = (that[watcherName] = that[watcherName] || {})
    group[key] = getVal(that, key)

    // 收集监听
    watcher[key] = that.$watch(key, (newVal, oldVal) => {
      group[key] = newVal
      // 如果新值为 null 说明是清空操作，不需要走下面的逻辑
      if (newVal == null) return

      const groupLen = getGroupLen()
      if (groupLen === 1) {
        return
      } else if (groupLen === 2) {
        // 如果只有两个输入框时，特别处理
        // 一个输入框改变，直接更新另一个框的值
        updateOtherKey(key, newVal)
        return
      }

      const currSum = getCurrSum()
      // 求和后，大于最大值时，赋空所有值
      if (currSum > max) {
        clearAll()
        return
      }

      const noEditKeys = hasNoEditKeys()
      const noEditKeysLen = noEditKeys.length
      // 对最后一个输入框自动赋值
      if (noEditKeysLen === 1) {
        setVal(that, noEditKeys[0], max - currSum)
      }
    })

    function getGroupLen() {
      return Object.keys(group).length
    }

    function hasNoEditKeys() {
      return Object.keys(group).filter(key => group[key] === null)
    }

    function getCurrSum() {
      return Object.values(group).reduce((sum, curr) => sum + curr, 0)
    }

    function clearAll() {
      Object.keys(group).forEach(key => {
        setVal(that, key, null)
      })
    }

    function updateOtherKey(currKey, currVal) {
      if (currVal > max) {
        return
      }
      const otherKey = Object.keys(group).find(v => v !== currKey)
      setVal(that, otherKey, max - currVal)
    }

    function getVal(obj, keys) {
      const seqs = keys.split(".")
      return seqs.reduce((o, key) => o[key], obj)
    }

    function setVal(obj, keys, val) {
      const seqs = keys.split(".")
      if (seqs.length === 1) {
        obj[keys] = val
      } else {
        for (let i = 0; i < seqs.length; i++) {
          const key = seqs[i]
          if (i !== seqs.length - 1) {
            obj = obj[key]
          } else {
            obj[key] = val
          }
        }
      }
    }
  },
  unbind(el, binding, vnode) {
    const [watcher, groupName, key] = [el._watcher, el._group, el._key]
    const that = vnode.context

    // 组件卸载时，卸载监听，移除 group 中的属性
    if (that[watcher][key]) {
      that[watcher][key]()
      delete that[watcher][key]
      delete that[groupName][key]
    }

    delete el._watcher
    delete el._group
    delete el._key

    // 当该组下的输入框都清空后，移除挂载的属性
    tryRemoveKey(watcher)
    tryRemoveKey(groupName)

    function tryRemoveKey(key) {
      if (that[key] && !Object.keys(that[key]).length) {
        delete that[key]
      }
    }
  }
}
```

### 细节方面

- 比如一些在 `unbind` 和 `bind` 阶段都用到的变量，可以直接在 `bind` 阶段挂载在当前的 `Element` 对象上。这样的好处是，不需要在 `unbind` 阶段再写一遍获取值的逻辑，注意在指令解绑时，把注册的属性删除，以防内存泄漏；
- 在当前组件上下文添加一个新属性，为了防止变量名重复，这里没有采用 `Symbol` 类型。因为要在确保同组下的组件都能访问到同一个组，而每个组件都是独立的，所以就没有使用 `Symbol` 类型。一般就是以一个几乎不会重复的名称当作前缀，确保唯一即可；
- 为了确保用户操作时不会有一些额外的影响，开启了输入框失焦时才去更新当前值。

## 组件版本

### 与指令版本的差异

- 关于 `group` 和 `key` 的传参都通过 `props` 传入。由于 _Vue_ 内部不允许使用 `key` 关键字作为属性名，就换成了 `iKey`；
- 不需要考虑依赖的卸载。因为是在组件内部监听，卸载会随着组件生命周期的结束而自行移除监听。

### 额外遇到的问题

在对所有值赋空时，出现了一点小问题。当总和超出最大值时，不会对当前编辑的最后一个输入框赋空？

{% asset_img problem.gif %}

监听的内部逻辑和指令版本的内部逻辑一模一样，怎么到组件这里就不行了？试了在各种组件实例上使用 `$forceUpdate` 都不行，最后误打误撞试出来的解决办法是，用 `$nextTick` 把 `clearAll` 方法包起来。

```js
/* ... */
const currSum = getCurrSum()
// 求和后，大于最大值时，赋空所有值
if (currSum > max) {
  this.$nextTick(() => {
    clearAll()
  })
  return
}
/* ... */
```

仔细思考了一下，新增的输入框初始值为 `null`，然后当它输入了一个值（它的值由 `null -> newVal`），导致当前和大于最大值，然后就会执行 `clearAll` 方法，将所有输入框赋空，它的值又从 `newVal -> null`，也即 `null -> newVal -> null`。这一系列操作都是在一轮事件循环里，而 _Vue_ 内部会对同一轮事件循环中多次触发的回调，进行优化，只会执行一次。也即虽然输入框的值改变了两次，最后也只会调用一次回调。

在 `watch` 里打印了一下，然而结果是它执行了两次回调：

1. `null -> newVal`；
2. `newVal -> null`。

理解错了吗？其实也不完全错，思路是对的，因为值变化了两次，`watch` 里的打印也很合理。不过这个【只执行一次的回调】在这里就不是 `watch` 中的监听函数，而是触发 `render` 的回调。在 `updated` 里打印日志，发现只会打印一次。_Vue_ 会将同一轮事件循环中的回调全部执行完之后，才会调用 `render` 去更新视图，防止频繁更新视图，造成一些没必要的效率问题。然而在使用 `$nextTick` 后，`updated` 里的日志就会打印两次，也即 `render` 函数触发了两次。为什么添加了 `$nextTick` 后就能更新视图了呢？

未使用 `$nextTick` 前，由于它的值在这一系列操作下来，还是和初始值相同，在 _diff_ 时，就认为这两个节点是相同的，也就没有更新节点，直接复用，从而导致视图没有更新。而在使用 `$nextTick` 后，对于触发的两次 `render` 先命名一下：这里将 `null -> newVal` 阶段的渲染命名为 `renderA`，`newVal -> null` 阶段的渲染命名为 `renderB`。

- 在 `renderA` 阶段，值由 `null -> newVal`，在 _diff_ 时，由于绑定的值不同，于是就用新值去更新节点，然后重新渲染。
- 在 `renderB` 阶段，值由 `newVal -> null`，同样在 _diff_ 时，新老节点还是不同的，依然用新值去更新节点，然后重新渲染。

这也就解释得通：为什么使用 `$nextTick` 后就能更新视图了（又对 _Vue_ 底层加深了理解）。

那么为什么在指令里就能直接更新呢？😑

怀疑是因为给 _InputNumber_ 包裹了一层导致的，而且是以 `{ props: $attrs }` 的形式传递的参数，`$attrs` 还不是响应式的，当内部的 `$attrs.value` 发生变换时不会触发 `render`。二次封装第三方的组件，感觉坑还很多，以后估计有得踩。。。

### 整体代码

> 在 [codepen.io](https://codepen.io/olderk/pen/Baxbdpg) 中运行。

```js
// input-number-union.vue
<script>
const name = 'input-number-union'
function setVal(obj, keys, val) {
  const seqs = keys.split('.')
  if (seqs.length === 1) {
    obj[keys] = val
  } else {
    for (let i = 0; i < seqs.length; i++) {
      const key = seqs[i]
      if (i !== seqs.length - 1) {
        obj = obj[key]
      } else {
        obj[key] = val
      }
    }
  }
}

export default {
  name,
  props: {
    group: {
      type: String,
      default: 'default',
    },
    iKey: {
      type: String,
      required: true,
    },
  },
  computed: {
    currVal() {
      return this.$attrs.value
    },
    currMax() {
      return this.$attrs.max
    },
    inputNumber() {
      return this.$children[0]
    },
    groupName() {
      return `_${name}-group-${this.group}`
    },
    watcherName() {
      return `${this.groupName}-watch`
    },
    groupList() {
      return this.$parent[this.groupName] || {}
    },
  },
  watch: {
    currVal(newVal, oldVal) {
      this.groupList[this.iKey] = newVal
      const groupListLen = this.getGroupListLen()
      if (groupListLen <= 1) {
        return
      } else if (groupListLen === 2) {
        this.updateOtherKey(this.iKey, newVal)
        return
      }

      const noEditKeys = this.getNoEditKeys()
      const noEditKeysLen = noEditKeys.length
      // 如果新值为 null 说明是清空操作，不需要走下面的逻辑
      if (newVal == null) return
      const currSum = this.getCurrSum()

      // 求和后，大于最大值时，赋空所有值
      if (currSum > this.currMax) {
        this.clearOther()
        return
      }

      // 对最后一个输入框自动赋值
      if (noEditKeysLen === 1) {
        setVal(this.$parent, noEditKeys[0], this.currMax - currSum)
      }
    },
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    delete this.$parent[this.groupName][this.iKey]
  },
  methods: {
    init() {
      this.$parent[this.groupName] = this.$parent[this.groupName] || Object.create(null)
      this.$parent[this.groupName][this.iKey] = this.currVal
    },
    getCurrSum() {
      return Object.values(this.groupList).reduce((sum, curr) => sum + curr, 0)
    },
    getGroupListLen() {
      return Object.keys(this.groupList).length
    },
    getNoEditKeys() {
      return Object.keys(this.groupList).filter((key) => this.groupList[key] === null)
    },
    updateOtherKey(key, val) {
      if (val > this.currMax) {
        return
      }
      const otherKey = Object.keys(this.groupList).find((v) => v !== key)
      setVal(this.$parent, otherKey, this.currMax - val)
    },
    clearOther(currKey) {
      Object.keys(this.groupList).forEach((key) => {
        if (key !== currKey) {
          setVal(this.$parent, key, null)
        }
      })
    },
  },
  render(h) {
    return h('InputNumber', {
      props: {
        ...this.$attrs,
        activeChange: false,
      },
      on: this.$listeners,
    })
  },
};
</script>
```
