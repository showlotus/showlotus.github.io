---
title: Vue 中如何取消 ViewDesign 中组件内部的指令 <W13>
categories:
  - [日常]
  - [每周一篇]
tags:
  - Vue
  - ViewDesign
mathjax: false
date: 2022-11-25 20:27:02
---

{% asset_img banner.jpg %}

> 最近需要做这样一个功能：当展开下拉框或者日期选择器的浮层面板后，点击某个区域，不会让浮层消失。如果有了解过组件库内部源码的话，这种浮层的点击外部后隐藏，大多数组件内部都是通过一个 `clickOutside` 的指令来实现，而目标功能就是需要实现一块 “禁区”，当点击 “禁区” 时不会触发 `clickOutside`。本文就是基于该功能的实现对这个指令进行探索，记录自己实现这个功能的全过程，望以后少踩点坑。

#### 走过的弯路

一开始，我想到的是：如何将这个 `clickOutside` 指令失效，因为点击浮层外部，然后隐藏浮层，就是因为有这个指令才导致的。于是摸索出了几种<del>方案</del>（反面教材）：

##### 1. 修改组件源码

最简单暴力的方法就是，先复制一份使用的组件到项目下，然后把组件中引入资源的 <big>相对路径</big> 都改为 <big>绝对路径</big>。

> 下方以 _ViewDesign_ 的 _Poptip_ 为例，[戳这里查看组件源码](https://github1s.com/view-design/ViewUI/blob/HEAD/src/components/poptip/poptip.vue)。

{% asset_img 1.png %}

这样保证组件可以正式使用，然后找到绑定 `clickOutside` 指令的地方，删了就行。

{% asset_img 2.png %}

是不是很简单，不过这种操作源代码的代价太大，意味着风险越高，建议谨慎使用。那么有没有不操作源码的方案呢？有的，接着往下看。

##### 2. 禁用指令绑定的回调

再想想，还可以让 `clickOutside` 绑定的回调方法不执行也能达到相同的目的，也就是 “禁用” `handleClose`。

然后写了下面这段代码：

```js
// 在组件上绑定一个 ref，通过 ref 获取组件实例
const poptip = this.$refs.poptip
poptip.handleClose = () => {}
poptip.$forceUpdate()
```

将内部的 `handleClose` 重写为一个空函数。这一步的前提是确保 `handleClose` 只有在 `clickOutside` 中有用到，事实也正是如此，那么就可以放心重写了。这样就可以吗？No No No ~ 你会发现不起任何作用。

关于这个问题，首先需要了解一下 `clickOutside` 指令的内部逻辑，源码如下：

```js
export default {
  bind(el, binding, vnode) {
    function documentHandler(e) {
      if (el.contains(e.target)) {
        return false
      }
      if (binding.expression) {
        binding.value(e)
      }
    }
    el.__vueClickOutside__ = documentHandler
    document.addEventListener("click", documentHandler)
  },
  update() {},
  unbind(el, binding) {
    document.removeEventListener("click", el.__vueClickOutside__)
    delete el.__vueClickOutside__
  }
}
```

注意看，它只有两个有效的钩子函数：`bind` 与 `unbind`。当首次绑定指令时，会往 `document` 上添加一个 `click` 事件监听，回调方法是经过处理后的 `handleClose`。也即只有当前点击元素不是指令绑定元素或者指令绑定元素的后代元素时，才会触发 `handleClose`。

而当我们重写 `handleClose` 方法后，虽然会触发指令的 `update` 钩子，但是它是空的，压根不会对 `document` 上绑定的方法有任何影响，绑定的依然是最开始的 `handleClose`，不是当前最新的 `handleClose`。那么，如果在 `update` 钩子里，先触发 `unbind`，再触发 `bind` 是不是就能绑定最新的 `handleClose` 了？其实还能再简单的，或许我们可以直接解绑这个指令，也就是下面要介绍的方法，手动触发 `unbind` 钩子。

##### 3. 手动触发 `unbind` 钩子

首先，需要得到这个指令，每个组件上配置的属性都可以在 `$options` 上找到，而注册的指令对应的就是 `$options.directives` 中。

于是，就可以写出下面的代码：

```js
const el = this.$refs.poptip.$el
const clickOutside = this.$refs.poptip.$options.directives.clickOutside
clickOutside.unbind(el)
```

如此一来，指令就被卸载了，无论怎么点击浮层外的区域都不会让浮层消失。

但是，这与最初想要的 “禁区” 有些不一样，“禁区” 是某块区域内点击时不会关闭浮层，而现在除了浮层外的所有区域都是 “禁区” 了，也不能满足最终的功能要求。

上述的三种方法，都不如以满足功能需求，都是自己在摸索过程中走的一些弯路。有些倒是挺有趣的，扩展了知识面，也算是积累经验了吧。下面的才是可靠的解决方案，就一句代码，这也印证了那句：一个功能应该实现起来越简单越好，如果很复杂，那么可能实现方式有问题。先将复杂的问题简单化，再逐个击破。

#### 就一行代码的事

先展示结果，戳一戳下面，体验一波。

<div class="iframe-codepen" src="https://codepen.io/olderk/full/QWxxWZw" width="100%" height="500"></div>

其实就是，阻止禁区元素的 `click` 事件向上冒泡就可以了。用 _Vue_ 的写法就是下面这样：

```js
<div @click.stop>禁区</div>
```

是的，就这么简单。是不是感觉上面说的一大堆方案看起来好傻，哈哈。

关于事件的冒泡，这就要聊聊 _JS_ 中 _DOM_ 元素事件的传播方式，主要有两种：<big>捕获</big> 和 <big>冒泡</big>，先看下图。

{% asset_img event.png %}

关于这两个名词，先看看官方的解释：

- 捕获阶段：事件对象通过目标的祖先从 _Window_ 传播到目标的父级。

- 冒泡阶段：事件对象以相反的顺序传播到目标的祖先，从目标的父级开始，到 _Window_ 结束。

简单点说：捕获是自上而下传播，冒泡是自下而上传播。冒泡是默认开启的，而捕获时默认关闭的。

这是捕获：

{% asset_img capture.gif %}

这是冒泡：

{% asset_img bubble.gif %}

这也就解释了，为什么 `clickOutside` 在 `document` 上绑定点击事件，点击某个元素时，也会触发这个 `click` 事件。

如果想阻止冒泡就可以通过事件对象的 `stopPropagation` 方法来实现。

```js
document.addEventListener("click", function (e) {
  // 点击时触发
  e.stopPropagation()
})
```

如果想开启捕获，可以在注册事件时，携带第三个参数 `useCapture`。

```js
document.addEventListener(
  "click",
  function (e) {
    // 点击时触发
  },
  true
)
```

> 更多详细内容，可以查阅 [_MDN_](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)。

#### 扩展小知识

_ViewDesign_ 中带浮层的组件有很多，而且并不是所有都能只通过关闭 “禁区” 元素的冒泡实现。如果想给其他携带浮层的组件添加 “禁区”，先仔细阅读组件官方文档的 _API_ ，如果 _props_ 中有下面这一项：

{% asset_img 4.png %}

也即会默认开启 `capture` 模式。因为是自上而下传递，如果仅仅只是在 “禁区” 元素上阻止冒泡是不行的，“禁区” 元素的祖先元素同样会触发事件，依然会关闭浮层，所以还需要将 `capture` 模式关闭，方才可行。
