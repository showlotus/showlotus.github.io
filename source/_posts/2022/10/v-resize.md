---
title: v-resize：监听 DOM 尺寸变化
mathjax: false
date: 2022-10-17 20:55:26
tags:
  - Vue-指令
categories:
  - [日常]
---

{% asset_img banner.jpg %}

> 前两天一个同事遇到一个问题：从当前子应用再切换到另一个子应用，然后再切回来，当前子应用里 _echarts_ 图表的宽度发生了变化，整体都变宽了一些，而且这个问题只有在测试环境下才有，线下开发环境一切正常。试了试，只要触发一次 _echarts_ 自带的 `resize` 方法，就能将图表样式调整为正常样式了。于是就想到了，之前看过一个 UI 库出的指令 `v-resize`：当前 DOM 宽高发生变化时，触发对应的方法。本来打算看看它的实现源码，但是这个 UI 库只提供了打包后的版本（花了钱，连源码都看不到 😂），于是打算实现一个【平替版】😁。

<div class="iframe-codepen" src="https://codepen.io/olderk/full/ZEoZpoB" width="100%" height="500"></div>

## ResizeObserver

采用 _ResizeObserver_ 去监听 DOM 元素的尺寸变化，浏览器兼容性还可以（除了 IE）。如何使用，MDN 上有案例（[戳这里](https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver)），这里就不多说了。

{% asset_img compatibility.png %}

## 实现

在 `new ResizeObserver(handler)` 时传入的回调 `handler` 同 `window.resize` 一样，只要窗口稍稍改变一点就会频繁触发多次，所以需要给它外面包裹一层节流。试了试节流时间为 _200ms_ 时效果就很好，当然为了扩展性，这个节流时间可由用户自定义，以 `v-resize:300="handler"` 的形式传入，就是设置节流时间为 _300ms_ 。如果需要立即触发，添加修饰符 `immediate`，即 `v-resize.immediate="handler"`。其中 `handler` 为触发的回调方法，必须是个函数。

## 整体代码

```js
// directives/resize.js
function throttle(fn, wait = 200) {
  let timer = null
  let isFirstTime = true
  return function () {
    const args = arguments
    const that = this
    if (isFirstTime) {
      fn.apply(that, args)
      isFirstTime = false
      return
    }

    if (timer) return

    timer = setTimeout(() => {
      clearTimeout(timer)
      timer = null
      fn.apply(that, args)
    }, wait)
  }
}
const noop = v => v

export default {
  bind(el, binding, vnode) {
    let wait = Number(binding.arg)
    let immediate = binding.modifiers.immediate || false
    wait = Number.isNaN(wait) ? undefined : wait
    const callback = binding.value || noop
    const handler = throttle(function (entries) {
      // 是否立即触发
      if (!immediate) {
        immediate = true
        return
      }
      const rect = entries[0].contentRect
      // 将当前 DOM 的信息返回
      callback(rect)
    }, wait)
    el._observe = new ResizeObserver(handler)
    el._observe.observe(el)
  },
  unbind(el, binding, vnode) {
    el._observe.unobserve(el)
    delete el._observe
  }
}
```

## 在 Vue 中使用

```js
<template>
  <div class="wrap">
    <div v-resize="handleResizeLeft">{{ leftWidth }}</div>
    </div>
  </div>
</template>
<script>
import resize from './directives/resize'

export default {
  directives: { resize },
  data() {
    return {
      leftWidth: null,
    };
  },
  methods: {
    handleResizeLeft({ width }) {
      this.leftWidth = width
    },
  },
};
</script>
```
