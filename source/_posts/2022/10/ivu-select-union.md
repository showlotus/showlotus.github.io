---
title: ivu-select-union <W6>
mathjax: false
date: 2022-10-03 19:24:24
tags:
  - ViewDesign
  - ivu-0extends
  - ivu-0select
categories:
  - [日常]
  - [每周一篇]
---

{% asset_img banner.jpg %}

> 有这样一个场景，多个下拉框共用同一个下拉列表，如果有一个下拉框选中了某一项，那么该项不能被其他下拉框选中，也就是选中项不能重复。同时每个下拉框的下拉列表也是动态的，会根据已选中的值的变化而变化（看下图）。

{% asset_img result.gif %}

## 方案一（外部实现）

用一个「列表」记录当前所有下拉框已选中的值，每个下拉框的下拉列表都会根据已选中值和当前下拉框的值的变化而变化，前提是 _Option_ 是采用 `v-for` 渲染的。

```js
<template>
  <div>
    <Select v-for="(_, key) in formData" :key="key" v-model="formData[key]">
      <Option
        v-for="item in getUnselectedList(list, formData[key])"
        :key="item.value"
        :value="item.value"
        >{{ item.label }}</Option
      >
    </Select>
  </div>
</template>

<script>
export default {
  name: "ivu-select-union-outer",
  data() {
    return {
      list: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
        { label: "C", value: "c" },
      ],
      formData: {
        select1: "",
        select2: "",
      },
    };
  },
  computed: {
    // 所有已选中的值的集合，用 Set 去重
    selectedValue() {
      const values = Object.values(this.formData).filter(v => v != null && v !== "");
      return new Set(values);
    },
  },
  methods: {
    // 根据基础列表与当前选中的值，对列表进行过滤
    getUnselectedList(list, currVal) {
      return list.filter(v => !this.selectedValue.has(v.value) || v.value === currVal);
    },
  },
};
</script>
```

这种方案的局限性就是，_Option_ <font style="border-bottom: 1px solid #4a4a4a">_必须用_</font> `v-for` 的形式渲染（因为需要对 _OptionList_ 进行过滤展示），不能采用静态列举的方式（下面这种）。

> 这里的 「必须用」 不是绝对的，也可以通过对生成的 _VNode_ 节点进行过滤，不过这与对 _OptionList_ 过滤相比，就稍显麻烦了。后续的方案二用到的就是对 _VNode_ 节点进行过滤，可以自行斟酌。

```js
<Select>
  <Option value="a">A</Option>
  <Option value="b">B</Option>
  <Option value="c">C</Option>
</Select>
```

一开始的实现，也是采用这种方式，在原有的代码逻辑基础上，改动还是比较小的。不过我想把改动降到最小，于是就有了方案二。

## 方案二（内部实现）

我在想能不能让组件内部自身对下拉列表进行过滤展示，不需要追加任何外界的代码逻辑？

### 思考

最开始是想通过一个指令实现，不过，最后发现不可取。顺便谈谈我对指令的理解：<font style="border-bottom: 1px solid #4a4a4a">_仅限于在已渲染后的组件上追加新功能或新属性_</font> 。这里需要对 _VNode_ 节点进行操作，肯定是在渲染前的阶段进行，所以无法使用指令，于是就采用对组件的二次封装的形式实现。二次封装的好处，可以得到当前组件下的所有待渲染的所有节点，进行中间层处理后再渲染。

这里你可能会好奇，为什么要对 _VNode_ 进行操作，为什么不对 `v-for` 的 _OptionList_ 进行操作？如果对 _OptionList_ 进行操作，那么就和方案一相同了，这里我们就是不要对 _OptionList_ 有任何操作，如果不对 _OptionList_ 操作，那么如何对下拉列表里的选项进行过滤展示呢？所以，那就需要对 _VNode_ 进行操作了。

### 思路

在封装后的下拉框组件（`SelectUnion`）上添加一个额外的属性 `group` 。通过这个 _group_ 给每个 _Select_ 进行分组，同组的之间才会有选中值唯一的限制。与方案一类似，每个组都需要一个已选值的集合（采用 `Set` 类型），就打算把这个集合挂在父组件上。有了已选值的集合还不行，还需要在当前下拉框选中值变化时，将新值更新到已选值的集合中，同时将旧值从已选值集合中移除。当已选值集合变化时，需要通知组内的其他下拉框更新下拉列表。大体思路就是这些，看看整体代码，就 100 行左右，除去注释，不到 100 行。

### 代码

```js
<script>
/**
 * 查找兄弟组件
 * @param {VNode} context 当前组件上下文
 * @param {string} componentName 组件名称
 * @param {string} group 组名
 * @param {boolean} exceptMe 是否包含当前组件自己
 * @returns {VNode[]}
 */
function findBrothersComponents(context, componentName, group, exceptMe = true) {
  let res = context.$parent.$children.filter(item => {
    return item.$options.name === componentName && item.group === group;
  });
  let index = res.findIndex(item => item._uid === context._uid);
  if (exceptMe) res.splice(index, 1);
  return res;
}

/**
 * 获取 Option 上绑定的 value 值
 */
function getOptionVal(vnode) {
  return vnode.componentOptions.propsData.value;
}

/**
 * 判断当前输入框的值是否为空
 * @param {*} val 需要判断的值
 * @return {boolean}
 */
function isEmptyVal(val) {
  return val === "" || val == null;
}

const name = "ivu-select-union";

export default {
  name,
  props: {
    group: {
      type: [String, Number],
      default: "default",
    },
  },
  computed: {
    groupName() {
      return `_${name}-group-${this.group}`;
    },
    groupValueList() {
      return this.$parent[this.groupName];
    },
    currVal() {
      return this.$attrs.value;
    },
  },
  watch: {
    currVal(newVal, oldVal) {
      if (!isEmptyVal(newVal)) {
        this.groupValueList.add(newVal);
      }
      this.groupValueList.delete(oldVal);
      this.updateSiblings();
    },
  },
  created() {
    this.initGroup();
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    initGroup() {
      this.$parent[this.groupName] = this.$parent[this.groupName] || new Set();
    },
    updateSiblings() {
      const siblings = findBrothersComponents(this, name, this.group, true);
      siblings.forEach(vc => {
        vc.$forceUpdate();
      });
    },
    clear() {
      this.groupValueList.delete(this.currVal);
      this.updateSiblings();
    },
  },
  render(h) {
    const filterSelectedValue = vnode => {
      const val = getOptionVal(vnode);
      return !this.groupValueList.has(val) || val === this.currVal;
    };
    const children = this.$slots.default.filter(filterSelectedValue);
    return h(
      "Select",
      {
        props: this.$attrs,
        on: this.$listeners,
      },
      children,
    );
  },
};
</script>
```

### 细节

- 因为是基于 _Select_ 进行封装，所以要保留原组件上的一些属性和事件，确保它们依然可用，那就需要用到 `v-bind="$attrs"`（<font style="border-bottom: 1px solid #3273dc">[_$attrs_](https://v2.cn.vuejs.org/v2/api/#vm-attrs)</font>） 和 `v-on="$listeners"`（<font style="border-bottom: 1px solid #3273dc">[_$listeners_](https://v2.cn.vuejs.org/v2/api/#vm-listeners)</font>），在二次封装组件中，这两个方法很常见。

- 关于如何得到同组的其他下拉框，借鉴了 `ViewDesign` 内部的一个方法 `findBrothersComponents`，这个方法是在父组件下找同类型的兄弟组件，在它的基础上加了个组名的判断。

- 因为 `Set` 类型在 `Vue2` 是无法监听到数据变化的，所以换了一个思路：当前下拉框选中值变化时，就去更新一次同组的其他下拉框。更新其他下拉框，通过 `$forceUpdate`（<font style="border-bottom: 1px solid #3273dc">[_$forceUpdate()_](https://v2.cn.vuejs.org/v2/api/#vm-forceUpdate)</font>） 实现。

- 在组件销毁时，也要将当前下拉框的值从已选中值集合移除，同时更新兄弟组件。

### 使用

与 _Select_ 的用法一致，如果需要指定 _group_ ，传一个 _group_ 就行，默认为 `default`（下面的按索引分组）。因为是对 _VNode_ 进行操作，所以无论 _Option_ 使用 `v-for` 渲染的还是静态列举的，都是可行的。

```js
<SelectUnion
  v-for="(_, key) in data"
  :key="key"
  v-model="data[key]"
  clearable
  :group="key % 2"
>
  <Option value="a">A</Option>
  <Option value="b">B</Option>
  <Option value="c">C</Option>
</SelectUnion>
```

### 效果

看下分组后的效果（蓝色阴影为一组，红色阴影为一组）。

{% asset_img result2.gif %}

## 总结

- 方案一

  - 优点：列表的过滤方式完全可控。

  - 缺点：需要额外添加一个变量与一个方法。

- 方案二

  - 优点：不用在乎内部的逻辑，只管按照 _Select_ 的使用方式使用；如果后续不需要这个功能，给 _group_ 传递一个唯一的值，使用起来与正常的 _Select_ 并不两样，或者直接替换组件名，绑定的属性与事件完全不用动。

  - 缺点：会往父组件上添加新属性（使用时未知），可能会造成一些副效应（与已有的属性名冲突，不过大概率不会）。

具体使用，还是看项目里用哪种方案实现起来更方便。
