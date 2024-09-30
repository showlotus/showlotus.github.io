---
title: 监听 DOM resize
tags:
  - 草稿
  - 工具函数
  - JavaScript
mathjax: false
date: 2024-09-29 10:46:52
categories:
---

监听 DOM 尺寸变化

TODO 在博客系统中嵌入一个在线运行 JS 的编辑器

```js
/**
 *
 */
function createDOMResizeWatcher(el, callback, options) {
  options.delay = Number(options.delay) || 0
  options.immediate = Boolean(options.immediate) || false

  const throttle = (fn, wait) => {
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

  const handler = throttle(function (entries) {
    // 是否立即触发
    if (!immediate) {
      immediate = true
      return
    }
    const rect = entries[0].contentRect
    // 将当前 DOM 的信息返回
    callback(rect)
  }, options.delay)
  const observer = new ResizeObserver(handler)
  observer.observe(el)

  return () => {
    observer.unobserve(el)
  }
}
```
