---
title: CSS学习
mathjax: false
date: 2022-09-25 13:18:25
tags:
  - CSS
  - CSS-权威指南
categories: 笔记
---

<img alt="" src=""  />

## 属性选择符

- `[foo|="bar"]`：选择元素有 `foo` 属性，且其值等于 `bar` ，或者以 `bar-` 开头。

  ```diff
  + <div foo="bar"></div>
  + <div foo="bar-1"></div>
  - <div foo="bar1"></div>
  - <div foo="a bar"></div>
  ```

- `[foo~="bar"]`：选择元素有 `foo` 属性，且其值包含 `bar` 这个词的一组词。

  ```diff
  + <div foo="bar"></div>
  + <div foo="a bar"></div>
  - <div foo="bar-1"></div>
  - <div foo="bar1"></div>
  ```

- `[foo*="bar"]`：选择元素有 `foo` 属性，且其值包含字串 `bar`。

  ```diff
  + <div foo="bar"></div>
  + <div foo="a bar"></div>
  + <div foo="bar-1"></div>
  + <div foo="bar1"></div>
  + <div foo="top-bar1"></div>
  ```

- `[foo^="bar"]`：选择元素有 `foo` 属性，且其值以 `bar` 开头。

  ```diff
  + <div foo="bar"></div>
  + <div foo="bar-1"></div>
  + <div foo="bar1"></div>
  - <div foo="a bar"></div>
  ```

- `[foo$="bar"]`：选择元素有 `foo` 属性，且其值以 `bar` 结尾。

  ```diff
  + <div foo="bar"></div>
  + <div foo="a bar"></div>
  - <div foo="bar-1"></div>
  - <div foo="bar1"></div>
  ```

- `[foo$="bar" i]`：不区分大小写的标识符，只针对属性值，不涉及属性名称。

  ```diff
  + <div foo="topbar"></div>
  + <div foo="topBar"></div>
  + <div foo="topbAr"></div>
  + <div foo="topbaR"></div>
  - <div Foo="topbaR"></div>
  ```

## 特指度

选择符的特指度由选择符本身的组成部分绝对。一个特指度值由四部分构成，例如 `0, 0, 0, 0`。选择符的特指度规则如下：

- 内联样式 `1, 0, 0, 0`；
- 选择符中的每个 ID 属性值加 `0, 1, 0, 0`；
- 选择符中的每个类属性值、属性选择或伪类加 `0, 0, 1, 0`；
- 选择符中的每个元素和伪元素加 `0, 0, 0, 1`；
- 连结符和通用选择符都不增加特指度；
- `!important` 特指度最高。

看几个特指度的例子：

```css
/* 0, 0, 0, 1 */
h1 {
  color: red;
}

/* 0, 0, 0, 2 */
p em {
  color: orange;
}

/* 0, 0, 1, 0 */
.box {
  color: yellow;
}

/* 0, 0, 3, 0 */
.box[foo="bar"]:hover {
  color: red;
}
```
