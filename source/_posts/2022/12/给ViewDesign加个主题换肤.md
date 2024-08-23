---
title: 给 ViewDesign 加个主题换肤💖 <W16>
categories:
  - [日常]
  - [每周一篇]
tags:
  - ViewDesign
  - JavaScript
  - CSS
mathjax: false
date: 2022-12-21 10:55:12
---

{% asset_img banner.jpg %}

> 最近要做主题换肤的功能，项目用的 UI 框架是 _ViewDesign_ ，只支持定制主题，不支持动态主题。查了好多资料，比如：用 _less_ 变量更换、预设几种主题的 _CSS_ 的文件，再动态切换 _link_ 标签的引入资源路径等等。这些方案的应用场景是，对项目中完全自主开发的模块的颜色进行切换。也即，你自己开发了一个导航栏（Menu）和顶部（Header），这俩你是完全控制的，用上述提到的方案是完全可行的。而 UI 框架是第三方的，用 _less_ 变量替换，也仅限于在编译前，编译后它就是 _CSS_ 格式了，再想用 _less_ 变量是不可行的。而预设几种主题 _CSS_ 文件，对于已经编译后的组件库，外部引入组件库的 _CSS_ 不会对内部有任何影响（也有可能是优先级不够 🤔）。_ViewDesign_ 官方提供了定制主题的方式，可以对一些 _less_ 变量进行重新覆盖，这些变量，在编译后，肯定就转成 _CSS_ 格式了。比如 `@color1` 编译后就是 `red`，`@color2` 编译后就是 `blue`。它们也是有映射关系的，而且这种关系是一对一的。那么，如果把编译后的 _CSS_ 中的颜色值，都改为 _CSS var()_ 的格式，然后再外部动态设置这些 _CSS_ 变量，是不是就能实现动态主题了？好，开干！

#### 1. 安装主题生成工具

```shell
npm install iview-theme -g
```

这个工具官方有介绍，版本有点老，不过只需要用它打包一下，够用了。

#### 2. 获取对应版本的样式文件

{% asset_img 1.png %}

官方虽然说这样可以下载对应版本的，但是我试了，并不可行，可能不支持高版本。如果想要下载指定版本的，可以先下载指定版本的 _ViewDesign_ （我用的是 _v4.7.0_ ）：

```shell
npm install view-design@4.7.0
```

然后找到 `node_modules/view-design/src/styles` 目录，这个文件夹下的，就是对应版本的样式文件，复制出来一份就行。

#### 3. 主题色相关颜色转换

下载后的样式文件里，有一个 `custom.less` 文件，这里罗列了所有可配置的颜色，我们只需要在意所有与主题色有关的就行。如下（后面的注释编号，代表当前的颜色种类，也即共有 10 种颜色与主题色有关）：

```less
// Color
@primary-color: #2d8cf0; // 1
@processing-color: @primary-color; // 1
@link-color: #2d8cf0; // 1
@link-hover-color: tint(@link-color, 20%); // 2
@link-active-color: shade(@link-color, 5%); // 3
@selected-color: fade(@primary-color, 90%); // 4

// Button
@btn-group-border: shade(@primary-color, 5%); // 3
@btn-primary-bg: @primary-color; // 1

// Input
@input-hover-border-color: @primary-color; // 1
@input-focus-border-color: @primary-color; // 1

// Slider
@slider-color: tint(@primary-color, 20%); // 2

// 特殊的，有些需要额外替换
// 表单的聚焦外阴影
.ivu-input:focus {
  box-shadow: 0 0 0 2px fade(@primary-color, 20%); // 5
}

// 树形组件悬浮和选中时的背景色
.ivu-tree-title:hover {
  background-color: tint(@primary-color, 90%); // 6
}
.ivu-tree-title-selected,
.ivu-tree-title-selected:hover {
  background-color: tint(@primary-color, 80%); // 7
}

// 导航菜单激活时的背景颜色
.ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) {
  background: #f0faff; // 8 => tint(@primary-color, 95%)
}

// 不是从主题色中延申而来的颜色，用主题色延申色替换
@table-td-hover-bg: #ebf7ff; // 9 => tint(@primary-color, 90%)
@table-td-highlight-bg: #ebf7ff; // 9 => tint(@primary-color, 90%)
@date-picker-cell-hover-bg: #e1f0fe; // 10 => tint(@primary-color, 85%)
```

> 你可能注意到了，有些完全和主题色八竿子打不着，确实如此。把所有组件都测试了一遍后，发现有些组件使用的颜色是固定的颜色值，要想和主题色相关联，只能把这个颜色替换成由主题色延申的方式，颜色 8、9 和 10 就是如此，用主题色生成了一个差不多类似的颜色，差别微乎其微，还可以接受。

接着把其中由 _less_ 函数生成的，都转为最后的实际颜色，这一步是为了方便后续的全局替换。

> 在线编译 _less_ ：https://www.dute.org/less-to-css

转换后如下：

```less
// Color
@primary-color: #2d8cf0; // 1
@processing-color: #2d8cf0; // 1
@link-color: #2d8cf0; // 1
@link-hover-color: #57a3f3; // 2
@link-active-color: #2b85e4; // 3
@selected-color: rgba(45, 140, 240, 0.9); // 4

// Button
@btn-group-border: #2b85e4; // 3
@btn-primary-bg: #2d8cf0; // 1

// Input
@input-hover-border-color: #2d8cf0; // 1
@input-focus-border-color: #2d8cf0; // 1

// Slider
@slider-color: #57a3f3; // 2

// 特殊的，有些需要额外替换
// 表单的聚焦外阴影
.ivu-input:focus {
  box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2); // 5
}

// 树形组件悬浮和选中时的背景色
.ivu-tree-title:hover {
  background-color: #eaf4fe; // 6 tint(@primary-color, 90%)
}
.ivu-tree-title-selected,
.ivu-tree-title-selected:hover {
  background-color: #d5e8fc; // 7 tint(@primary-color, 80%)
}

// 导航菜单激活时的背景颜色
.ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) {
  background: #f0faff; // 8 => tint(@primary-color, 95%)
}

// 不是从主题色中延申而来的颜色，用主题色延申色替换
@table-td-hover-bg: #ebf7ff; // 9 => tint(@primary-color, 90%)
@table-td-highlight-bg: #ebf7ff; // 9 => tint(@primary-color, 90%)
@date-picker-cell-hover-bg: #e1f0fe; // 10 => tint(@primary-color, 85%)
```

#### 4. 修改编译后的 _CSS_ 文件

执行打包命令：

```shell
iview-theme build -o dist/
```

如果打包报如下错误，把当前 _Node_ 版本换成 _<big>v11</big>_ 版本即可，亲测有效（PS：我用的 _<u>v11.15.0</u>_ ）。

{% asset_img 2.png %}

打开 `dist/iview.css` 文件，将上述的 <big>**10**</big> 种颜色，都转为以 _CSS_ 变量的方式，同时将预留值设为原颜色值。转换规则如下：

1. `#2d8cf0`：替换为 `var(--ivu-primary-color, #2d8cf0)`，总计 <big>**113**</big> 个；
2. `#57a3f3`：替换为 `var(--ivu-link-hover-color, #57a3f3)`，总计 <big>**46**</big> 个；
3. `#2b85e4`：替换为 `var(--ivu-link-active-color-color, #2b85e4)`，总计 <big>**22**</big> 个；
4. `rgba(45,140,240,.9)`：替换为 `var(--ivu-selected-color, rgba(45,140,240,.9))`，总计 <big>**2**</big> 个。
5. `rgba(45,140,240,.2)`：替换为 `var(--ivu-input-shadow-color, rgba(45,140,240,.2))`，总计 <big>**25**</big> 个。
6. `#eaf4fe`：替换为 `var(--ivu-tree-title-hover-color, #eaf4fe)`，总计 <big>**1**</big> 个。
7. `#d5e8fc`：替换为 `var(--ivu-tree-title-selected-color, #d5e8fc)`，总计 <big>**4**</big> 个。
8. `#f0faff`：替换为 `var(--ivu-menu-active-color, #f0faff)`，总计 <big>**5**</big> 个。
9. `#ebf7ff`：替换为 `var(--ivu-table-hover-bg-color, #ebf7ff)`，总计 <big>**3**</big> 个。
10. `#e1f0fe`：替换为 `var(--ivu-date-picker-hover-bg-color, #e1f0fe)`，总计 <big>**2**</big> 个。

#### 5. 通过主题色生成各种延申色

延申色都是由 _less_ 内置函数生成的，最好的办法也就是还用 _less_ 提供的函数去生成，经历一番探索，终于找到了 _less_ 中函数的位置（藏的可太深了/(ㄒ o ㄒ)/~~）。最终的转换方法如下：

```js
import less from "less"

const Color = less.color
const { fade, shade, tint } = less.functions.functionRegistry._data

function toRgb(color) {
  const { alpha, rgb } = color
  const [r, g, b] = rgb.map(v => parseInt(v, 10))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 生成主题色
 * @param {string} themeColor 十六进制的颜色值
 * @returns
 */
export default function genThemeColor(themeColor) {
  const color = new Color(themeColor.slice(1))

  const linkHoverColor = tint(color, { value: 20 })
  const linkActiveColor = shade(color, { value: 5 })
  const selectedColor = fade(color, { value: 90 })
  const inputShadowColor = fade(color, { value: 20 })
  const treeTitleHoverColor = tint(color, { value: 90 })
  const treeTitleSelectedColor = tint(color, { value: 80 })
  const menuActiveColor = tint(color, { value: 95 })
  const tableHoverBgColor = tint(color, { value: 90 })
  const datePickerHoverBgColor = tint(color, { value: 85 })

  const colors = {
    "--ivu-primary-color": themeColor,
    "--ivu-link-hover-color": toRgb(linkHoverColor),
    "--ivu-link-active-color-color": toRgb(linkActiveColor),
    "--ivu-selected-color": toRgb(selectedColor),
    "--ivu-input-shadow-color": toRgb(inputShadowColor),
    "--ivu-tree-title-hover-color": toRgb(treeTitleHoverColor),
    "--ivu-tree-title-selected-color": toRgb(treeTitleSelectedColor),
    "--ivu-menu-active-color": toRgb(menuActiveColor),
    "--ivu-table-hover-bg-color": toRgb(tableHoverBgColor),
    "--ivu-date-picker-hover-bg-color": toRgb(datePickerHoverBgColor)
  }

  // 设置主题色 CSS 变量
  Object.keys(colors).forEach(key => {
    document.body.style.setProperty(key, colors[key])
  })
}
```

也即，只需要提供一个主题色，其他延申色全由函数内部自动生成，并且把 _CSS_ 变量设置在 _body_ 上。看下效果如何：

{% asset_img result.gif %}

😁，效果不错吧。最后，如果你也用的 _v4.7.0_ ，我把对应的样式文件和主题色生成 _JS_ 都放在了 [这里](https://github.com/showlotus/view-design-theme) ，可以直接下载使用。如果你用的其他版本，可以参考前文流程，去下载对应版本的样式文件，然后将各个颜色统一替换为 _CSS_ 变量的格式。不同版本，基础主题的颜色值可能有差异，建议使用前确认一下。
