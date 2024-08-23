---
title: CSS实现曲线导航菜单 <W11>
categories:
  - [日常]
  - [每周一篇]
tags:
  - CSS
  - JavaScript
mathjax: false
date: 2022-11-12 16:32:58
---

{% asset_img banner.jpg %}

> 最近看到一个这样的效果，挺有意思的，打算自己动手试一试。

{% asset_img problem.gif %}

## 拆解

首先，看到这个缺口，心里想，这玩意要怎么弄，一头雾水。不过，对于这种形状怪异的，大多数都可以通过多个图形组合做出来，对于这个，可以拆成由下面三部分组成。

{% asset_img 1.png %}

<center style="margin-bottom: 1em; font-size: 16px; font-weight: bold; color: #000">↓ ↓ ↓</center>

{% asset_img 2.png %}

对于左右两边的，可以通过圆角半径实现，重点是中间部分：缺口是个半圆的图形。在脑海里迅速头脑风暴一下，_CSS_ 中可以实现一个圆形缺口有关的方案。

**1**. 用伪元素画一个圆，然后背景色与当前整体背景色相同。

{% asset_img 3.gif %}

这种方法，应该是最容易想到的。不过，有一点不足之处就是，依赖当前整体背景色，如果背景色变化了，或者不是纯色，就很容易暴露问题。较好的办法就是，让这个圆形缺口是透明的，不依赖任何背景色，这样无论背景怎么变，都不会影响到这个缺口。那么就可以采用第二种方案：径向渐变 [_radial-gradient_](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/radial-gradient)。

**2**. 径向渐变

使用下面的样式，很容易就能实现一个缺口为圆形的矩形。

```css
div {
  width: 200px;
  height: 200px;
  background-image: radial-gradient(circle at top, transparent 50px, #000 51px);
  /* transparent 50px, #000 51px */
}
```

{% asset_img 4.png %}

颜色过渡时，适当地添加一点偏移，否则会有很明显的锯齿感。

```css
div {
  width: 200px;
  height: 200px;
  background-image: radial-gradient(circle at top, transparent 50px, #000 50px);
  /* transparent 50px, #000 50px */
}
```

{% asset_img 5.png %}

就差了 `1px` 而已，最后的呈现效果天壤之别。

## 组合

缺口实现了，把三部分组合在一起看看效果。

{% asset_img 6.png %}

emm，不是那么地严丝合缝。可以通过负 `margin-left` 和负 `margin-right` 让左右两边向中间靠拢。不过这可能会导致后续位置的计算有偏差，于是就没采用。只是想往两者中间填充一点东西，也可以通过 `box-shadow` 实现。

```css
.left {
  /* ... */
  box-shadow: 1.5px 0 #fefdfe;
}

.right {
  /* ... */
  box-shadow: -1.5px 0 #fefdfe;
}
```

{% asset_img 7.png %}

完美！多么优美的线条！😁

## 动起来

因为这个缺口是可以动的，就想着它和图标区域是分离开的，还有悬浮的小球也是，最后也是分成了三部分来实现：背景缺口，悬浮球，导航栏。

**1**. 背景缺口

缺口的移动，类似于轮播图，主体区域宽度固定，超出范围的都隐藏。

{% asset_img 8.gif %}

**2**. 悬浮球

悬浮球要和缺口的移动保持一致，保证每次都在缺口的正中间。

**3**. 导航栏

将每一小块导航的宽度与缺口的宽度保持一致，这样移动起来也方便计算。触发 `active` 时，图标上移，显示文字，一个简单的小动画。

戳一戳下面，体验一波。

<div class="iframe-codepen" src="https://codepen.io/olderk/full/OJEmqrd" width="100%" height="500"></div>

## 总结

1. 那个曲线，也是折腾了好久，才弄得那么完美，因为对这种曲线也不是特别熟，只能一点点微调，不过最后的结果还是不错的。
2. 移动位置的偏移量计算那块，因为是三部分，要保证每部分的移动要一致，还是有点麻烦，感觉不是很好。
