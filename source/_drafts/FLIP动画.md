---
title: FLIP 动画
categories:
  - []
tags:
  - 草稿
  - FLIP
  - 动画
mathjax: false
date: 2023-09-03 22:07:28
---

- 先讲解 FLIP 概念，以及实现原理
- 再通过几种不同的方式去实现：手动触发动画、animate 触发、借助 popmotion
- 最后在借助 popmotion 下，去实现一些常见的动画效果（如果能实现 Mac 上窗口最小化的 “神奇效果”，那最好不过）

什么是 FLIP 动画？

> 参考文档
> https://uxplanet.org/functional-animation-in-ux-design-what-makes-a-good-transition-d6e7b4344e5e
>
> https://flip-keynote.surge.sh/#/4
>
> https://juejin.cn/post/6844903772968206350
>
> https://segmentfault.com/a/1190000025179962
>
> https://juejin.cn/post/7016912165789515783
>
> https://www.nan.fyi/magic-motion
>
> https://www.framer.com/motion/introduction/
>
> https://popmotion.io/#quick-start-animation
>
> https://www.bootcdn.cn/popmotion/
>
> https://github1s.com/vuejs/vue/blob/HEAD/src/platforms/web/runtime/components/transition.ts#L14
