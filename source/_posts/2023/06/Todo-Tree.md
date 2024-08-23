---
title: 开发利器：Todo Tree
categories:
  - 日常
tags:
  - VS-Code-插件
  - Dev-Tools
mathjax: false
date: 2023-06-02 23:56:16
finishDate: 2023-06-03 01:02:30
---

> 最近换了一份新工作，也入职一段时间了，平时开发工具还是 _VS Code_ ，但是公司内网没有开放一些外网权限，也就导致不能同步自己的账号，也就意味着我要手动去把之前用的插件挨个再下载一遍，emmmmm。不过也不是所有的都能下载，插件市场提供的都是公司自己阉割过的版本，有些版本低的离谱，不过平时开发也够用了。之前我都是用 _TODO HighLight_ + _Todo Tree_ ，使用关键词标记注释行，不仅高亮关键词，还方便定位，开发体验极其友好。不过，新下载的插件又得重新搞配置，于是就打算把自己之前的配置贴出来（还设计了好几种颜色呢）。

翻了翻配置，发现只有 _Todo Tree_ （ **_v0.0.226_** ）的相关配置，好家伙，功能越来越丰富了。配置如下：

```json
{
  "todo-tree.general.tags": ["TODO", "BUG", "DONE", "FIX", "TAG", "WARN"],
  "todo-tree.highlights.defaultHighlight": {
    "foreground": "#fff",
    "background": "#ffa500",
    "icon": "checklist",
    "rulerColour": "#ffa500",
    "type": "tag",
    "iconColour": "#ffa500"
  },
  "todo-tree.highlights.customHighlight": {
    "BUG": {
      "background": "#f00",
      "icon": "bug",
      "rulerColour": "#f00",
      "iconColour": "#f00",
      "opacity": 100
    },
    "DONE": {
      "foreground": "#000",
      "background": "#add8e6",
      "icon": "verified",
      "rulerColour": "#add8e6",
      "iconColour": "#add8e6",
      "opacity": 100
    },
    "FIX": {
      "background": "#008000",
      "icon": "beaker",
      "rulerColour": "#008000",
      "iconColour": "#008000",
      "opacity": 100
    },
    "TAG": {
      "foreground": "#000",
      "background": "#ffc0cb",
      "icon": "pin",
      "rulerColour": "#ffc0cb",
      "iconColour": "#ffc0cb",
      "rulerLane": "full",
      "opacity": 100
    },
    "WARN": {
      "foreground": "#000",
      "background": "#ff0",
      "icon": "$(warning)",
      "rulerColour": "#ff0",
      // "iconColour": "#ff0",
      "opacity": 100
    }
  }
}
```

比如下面这段代码，

```js
// TODO this is todo

// BUG this is bug

// DONE this is done

// FIX this is fix

// TAG this is tag

// WARN this is warn
```

使用配置后的效果图如下：

{% asset_img 1.png %}

侧边栏，代办事项列表，点击某一个直接就能跳转到指定位置：

{% asset_img 2.png %}

赶紧试一试吧~
