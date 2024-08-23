---
title: v-set-title-attr <W5>
mathjax: false
date: 2022-10-02 19:22:29
tags:
  - Vue-指令
categories:
  - [日常]
  - [每周一篇]
---

{% asset_img banner.jpg %}

> 有个需求，下拉框里的选项分组后，因为组名可能会很长，于是就想添加一个文本超出时显示省略号的样式，这个用 CSS 就能做到，小意思。不过，如果文本超出后，我还想有一个能展示当前文字所有信息的提示。因为本身就是一个浮层了，再添加一个浮层就感觉很怪（说实话也不好加 😂），于是就想用原生的 title 实现（先看效果，如下图所示）。

{% asset_img result.gif %}

## 思路

首先可能会想到，把 _OptionGroup_ 上加一个 _title_ 属性，不过这会导致一个问题（以下面的代码为例）：

```js
<Select style="width:200px">
  <OptionGroup
    label="AAAAAAAAAAAAAAAAAAAAAAAA"
    title="AAAAAAAAAAAAAAAAAAAAAAAA"
  >
    <Option v-for="item in cityList1" :value="item.value" :key="item.value">
      {{ item.label }}
    </Option>
  </OptionGroup>
  <OptionGroup
    label="BBBBBBBBBBBBBBBBBBBBBBBB"
    title="BBBBBBBBBBBBBBBBBBBBBBBB"
  >
    <Option v-for="item in cityList2" :value="item.value" :key="item.value">
      {{ item.label }}
    </Option>
  </OptionGroup>
</Select>
```

{% asset_img problem.gif %}

首先要清楚 _title_ 生效的范围，给元素加上这个属性后，只要是在这个元素的区域内，鼠标移入都会有这个 _title_ 的提示。所以，鼠标在移入每个 _Option_ 上时，出现这个提示，也没毛病。不过，这给用户就会有误导，明明 _Option_ 中的文本是这个，提示出来的却是另一个。所以，这个方法有瑕疵，不可取 🙁。

先想一想上面的问题，归根结底是没有把 _title_ 加到真正的组名上。翻了翻 _OptionGroup_ 的内部实现，也没有关于 _label_ 的插槽什么的，就是单纯的一个 `div`。显然，通过组件自身提供的一些属性已经不能达到我们的目的了。我们需要找到那个组名对应的 _DOM_ 节点，然后给这个节点添加一个 _title_ 的属性。给 _DOM_ 节点设置属性，那就需要用到一个方法： _[Element.setAttribute()](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/setAttribute)_ 。

## 实现

通过上面的分析，我们需要得到组名对应的那个 _DOM_ 节点，在 _Vue_ 中操作原生 _DOM_ ，你是不是想到了指令。指令的生命周期方法中的第一个参数（`el`）就是当前的 _DOM_ 节点。当然，这个 _el_ 不一定就是组名的 _DOM_ 节点（在控制台打印一下就能知道了），如果不是，那组名的 _DOM_ 一定是 _el_ 的子元素，所以我们需要在 _el_ 中查找组名的 _DOM_ 节点，在当前节点下查找后代节点，就需要用到另一个方法： _[Element.querySelector()](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/querySelector)_ 。

打开控制台，查看一下组名的 _DOM_ 节点的 _class_ （`ivu-select-group-title`），然后我们只需要按照下面的代码，就能给组名的 _DOM_ 添加一个 _title_ 属性了。

```js
el.querySelector(".ivu-select-group-title").setAttribute("title", "AAA")
```

归纳一下，把这个指令做得更通用一点，把那些容易变化的部分做成变量，在使用指令时传入。这里只有 _class_ 与 _title_ 需要外部传入。_title_ 可以写在指令绑定的值中，而 _class_ 可以用指令的 _arg_ 传入。也即：`v-set-title-attr:ivu-select-group-title="title"`。

## 代码

最后的整体代码，很简短。

```js
export default {
  directives: {
    setTitleAttr: {
      bind(el, binding, vnode) {
        const { value, arg } = binding
        // 判断是否传入了 arg
        if (arg) {
          el = el.querySelector(`.${arg}`)
        }
        el.setAttribute("title", value)
      }
    }
  }
}
```

使用：

```js
<Select style="width:200px">
  <OptionGroup
    label="AAAAAAAAAAAAAAAAAAAAAAAA"
    v-set-title-attr:ivu-select-group-title="'AAAAAAAAAAAAAAAAAAAAAAAA'"
  >
    <Option v-for="item in cityList1" :value="item.value" :key="item.value">
      {{ item.label }}
    </Option>
  </OptionGroup>
  <OptionGroup
    label="BBBBBBBBBBBBBBBBBBBBBBBB"
    v-set-title-attr:ivu-select-group-title="'BBBBBBBBBBBBBBBBBBBBBBBB'"
  >
    <Option v-for="item in cityList2" :value="item.value" :key="item.value">
      {{ item.label }}
    </Option>
  </OptionGroup>
</Select>
```
