---
title: ColorPicker 扩展指令 v-modify-opacity <W1>
mathjax: false
date: 2022-09-02 12:37:37
tags:
  - ViewDesign
  - ivu-0extends
  - ivu-0color-0picker
  - Vue-指令
categories:
  - [日常]
  - [每周一篇]
---

{% asset_img banner.jpg %}

> 产品提了个意见：颜色选择器的颜色能不能不要默认为透明，选完颜色后，就立马确认了，容易忘记设置不透明度（如下图所示）。由于这个颜色是和所有组件的背景色绑定的，设为透明是为了组件更好的展示，改默认颜色固然不可行。其实每当选中颜色的时候，上方的色块会显示当前的颜色，如果用的多，看到这个颜色没变，大概也能知道缺了啥。不过对于用户而言，这确实是个不好的体验，于是，就有了一个想法：如果当前颜色的透明度为 0 ，选择颜色时，将不透明度置为 1，这样上方的色块也能显示当前的颜色，体验会很不错。大体思路有了，开搞！

{% asset_img 22-0902-1.gif %}

#### 组件内部逻辑

展开颜色面板，鼠标在上面选中颜色时，会触发内部的回调 `childChange`，传递的参数是下面这样的：

```json
{
  "h": 0,
  "s": 0.49166666666666664,
  "v": 0.8055555555555556,
  "a": 0, // 不透明度
  "source": "hsva"
}
```

这里我们只关心 `a` 的值就好，需要在一个合适的时机把这个 `a` 由 0 修改成 1。这个修改的只是当前选中颜色，而不是组件绑定的颜色，只有点击【确认】按钮时，才会更改组件绑定的颜色。

#### 功能实现

首先，需要检查当前颜色（`v-model` 绑定的值）是否透明度为 0，写了一个工具函数 `isTransparent`。

```js
function isTransparent(color) {
  if (color.charAt(0) === "#" && color.length > 7) {
    return color.substr(7) === "00"
  } else if (color.startsWith("rgba")) {
    return color.replace(/._,\s_([01]|0\.\d+)\)$/, "$1") === "0"
  }
  return color === "transparent" // fix: 点击清空，再次打开不生效
}
```

再判断触发 `childChange` 时，传入的 `data.a` 是否为 0，如果 `isTransparent(color) && data.a === 0` 就触发 `modifyOpacity`。

```js
if (isTransparent(color) && data.a === 0) {
  modifyOpacity(data)
}

function modifyOpacity(data) {
  data.a = 1
}
```

> 这里会有一个问题：如果通过拖动设置透明度的滑块，将透明度改为 0 时，同样也会修改 `data.a` 的值，就会有一个 BUG，当透明度滑到 0 时，滑块会立马跳到 1 的位置。所以只写这两个判断还不能达到要求，我们还需要一个合理的触发时机。

仔细想一想，修改 `data.a` 的值，应该在每次打开颜色面板后，只触发一次，后续的颜色选择，就不应该再触发了。那么触发的时机就和面板的 `visible` 相关联，我们需要一个标识 `canModifyOpacity` 一起约束上面的判断条件：

```js
if (isTransparent(color) && data.a === 0 && canModifyOpacity) {
  modifyOpacity(data)
}
```

> _CodeReview_ 的时候，同事提了一个意见，说上面的那个判断顺序换成下面这样，是不是好点？
>
> ```js
> if (canModifyOpacity && data.a === 0 && isTransparent(color))
> ```
>
> 首次展开面板选择颜色时，`canModifyOpacity` 一定为真，无论在前还是在后，都没有任何影响，并且第一次主要判断的是当前颜色不透明度是否为 _0_ ，所以把它摆在了第一位，这很合理。当在展开后的面板再次选择颜色时，`canModifyOpacity` 一定为假，后续的判断都是多余的，所以最优的判断顺序应该是：
>
> ```js
> if (canModifyOpacity && isTransparent(color) && data.a === 0)
> ```
>
> 首次展开面板，`isTransparent(color)` 优先级最高，所以先于 `data.a === 0`；后续再选择颜色，`canModifyOpacity` 为假，没必要再进行后面的判断了。

`canModifyOpacity` 初始值为 `true`，并且在触发 `modifyOpacity` 后，需要把 `canModifyOpacity` 置为 `false`，这里需要调整一下 `modifyOpacity`。

```js
canModifyOpacity = true
if (canModifyOpacity && isTransparent(color) && data.a === 0) {
  modifyOpacity(data)
}

function modifyOpacity(data) {
  data.a = 1
  canModifyOpacity = false
}
```

在每次打开颜色面板后，需要将 `canModifyOpacity` 置为 `true`，需要监听 **_ColorPicker_** 的 `visible`：

```js
ColorPicker.$watch("visible", val => {
  if (val) {
    canModifyOpacity = true
  }
})
```

基本逻辑都已实现，下面就是 `childChange` 的劫持：

```js
// 先存一份原函数
const originChildChange = ColorPicker.childChange
// 写自己的新函数
const newChildChange = function (data) {
  // v-model 绑定的值，传入 prop 的 name 就是 value
  if (canModifyOpacity && isTransparent(color) && data.a === 0) {
    modifyOpacity(data)
  }
  originChildChange(data)
}
// 替换实例上的方法
ColorPicker.childChange = newChildChange.bind(ColorPicker)
```

#### 整体代码

```js
let canModifyOpacity = true
const originChildChange = ColorPicker.childChange
const newChildChange = function (data) {
  if (canModifyOpacity && isTransparent(color) && data.a === 0) {
    modifyOpacity(data)
  }
  originChildChange(data)
}
ColorPicker.childChange = newChildChange.bind(ColorPicker)
ColorPicker.$watch("visible", val => {
  if (val) {
    canModifyOpacity = true
  }
})

function modifyOpacity(data) {
  data.a = 1
  canModifyOpacity = false
}

function isTransparent(color) {
  if (color.charAt(0) === "#" && color.length > 7) {
    return color.substr(7) === "00"
  } else if (color.startsWith("rgba")) {
    return color.replace(/.*,\s*([01]|0\.\d+)\)$/, "$1") === "0"
  }
  return color === "transparent"
}
```

#### 封装成指令

```js
<template>
  <div>
    <ColorPicker v-modify-opacity />
  </div>
</template>
```

```js
export default {
  directives: {
    "modify-opacity": {
      bind(el, binding, vnode) {
        const vm = vnode.componentInstance
        let canModifyOpacity = true
        const originChildChange = vm.childChange
        const newChildChange = function (data) {
          if (canModifyOpacity && isTransparent(color) && data.a === 0) {
            modifyOpacity(data)
          }
          originChildChange(data)
        }
        vm.childChange = newChildChange.bind(vm)
        vm.$watch("visible", val => {
          if (val) {
            canModifyOpacity = true
          }
        })

        function modifyOpacity(data) {
          data.a = 1
          canModifyOpacity = false
        }

        function isTransparent(color) {
          if (color.charAt(0) === "#" && color.length > 7) {
            return color.substr(7) === "00"
          } else if (color.startsWith("rgba")) {
            return color.replace(/.*,\s*([01]|0\.\d+)\)$/, "$1") === "0"
          }
          return color === "transparent"
        }
      }
    }
  }
}
```

#### 最终效果

{% asset_img 22-0902-2.gif %}
