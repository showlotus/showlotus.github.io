---
title: InputNumberUnit <W2·中秋节不打烊>
mathjax: false
date: 2022-09-10 19:51:58
tags:
  - ViewDesign
  - ivu-0extends
  - ivu-0input-0number
categories:
  - [日常]
  - [每周一篇]
---

{% asset_img banner.jpg %}

> 需求说，要把设置字体大小的数字输入框，添加一个字体的单位，`px` 或者是 `em`。这其实也没啥，`ViewDesign` 的 `InputNumber` 提供的有单位这个设置，不过：这个单位是通过格式化当前输入框中的内容得到的，也就是它和整个输入框的内容是一体的，也能删除，不过删除后，组件内部会给它重新加上。总感觉这个交互很诡异，不知道官方当时设计的时候，出于哪种考虑没把单位专门分离出来。既然他们的用起来不舒服，那就自己造一个！

{% asset_img problem.gif %}

#### 实现方案

##### 方案一 🙁

基于 `ViewDesign` 的 `Input` 进行扩展，`Input` 可以设置文本框前后的插槽，可以通过这个来放置单位，然后设置 `type="number"`，这样就能实现了。不过，这样就丢失了原来 `InputNumber` 的一些属性，比如 `min`，`max`，`step` 等等。况且 `Input` 自带的插槽样式，有点丑...，所以这个方案就毙掉了。

##### 方案二 🙂

基于 `ViewDesign` 的 `InputNumber` 进行扩展，将配置的单位，放置在输入框两边（前面或者后面）。如果只是这样，最终的效果图应该能想象的到，一定会很丑。所以，还要调整样式，做到和原生添加单位时，同样的展示效果（先贴一个最终的效果图，卖个关子）。

{% asset_img 1.png %}

#### 组件设计

##### 属性（props）

确保原生 `InputNumber` 的属性依然能在这个组件上使用，在这个基础上，又扩展了两个新属性：

- `unit`：单位，`String` 类型；
- `unitPlacement`：单位的位置，`String` 类型，`start`（在数字前） 或者 `end`（在数字后），默认为 `start`。

##### 插槽（slots）

如果只能传一个单位的字符串，那么单位的样式太单一了，所以又加了一个 `unit` 的插槽，可以自定义单位的样式。

```js
<InputNumberUnit
  :max="100"
  :min="-10"
  :step="2"
  unit="￥"
  unit-placement="end"
  size="large"
  v-model="value"
>
  <span slot="unit" style="color: red; font-weight: bold">AAA</span>
</InputNumberUnit>
```

上面代码的实现效果，对应下图中下面的那个。细心一点，可能会发现，上面的代码同时提供了 `unit="￥"` 和 `slot="unit"`，最后展示的是 `slot` 的内容。也即 `slot` 的优先级高于 `prop`。

{% asset_img 2.png %}

#### 代码实现

```js
<template>
  <div :class="wrapClasses">
    <div :class="unitClasses">
      <slot v-if="$slots.unit" name="unit" />
      <span v-else>{{ unit }}</span>
    </div>
    <InputNumber
      :size="size"
      v-bind="$attrs"
      v-model="currValue"
      @on-focus="handleFocus"
      @on-blur="handleBlur"
    ></InputNumber>
  </div>
</template>

<script>
const prefixCls = "ivu-input-number-unit";

export default {
  name: "InputNumberUnit",
  props: {
    value: {
      type: Number,
    },
    size: {
      type: String,
      default: "default",
    },
    unit: {
      type: String,
      default: "",
    },
    unitPlacement: {
      type: String,
      default: "start",
      validator: val => ["start", "end"].includes(val),
    },
  },
  data() {
    return {
      isFocused: false,
    };
  },
  computed: {
    currValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    hasUnit() {
      return this.$slots.unit || this.unit;
    },
    wrapClasses() {
      return [
        `${prefixCls}-wrap`,
        `ivu-input-number-${this.size}`,
        {
          [`${prefixCls}-start`]: this.unitInStart,
          [`${prefixCls}-end`]: this.unitInEnd,
          [`${prefixCls}-focus`]: this.isFocused,
          [`${prefixCls}-none-unit`]: !this.hasUnit,
        },
      ];
    },
    unitClasses() {
      return {
        "unit-in-end": this.unitInEnd,
      };
    },
    unitInStart() {
      return this.unit && this.unitPlacement === "start";
    },
    unitInEnd() {
      return this.unit && this.unitPlacement === "end";
    },
  },
  methods: {
    handleFocus() {
      this.isFocused = true;
    },
    handleBlur() {
      this.isFocused = false;
    },
  },
};
</script>

<style scoped lang="less">
.ivu-input-number-unit {
  &-wrap {
    display: flex;
    align-items: center;
    border-radius: 4px;
    border: 1px solid #dcdee2;
    transition: all 0.2s linear;

    &:hover {
      border-color: #57a3f3;
    }

    /deep/ .ivu-input-number {
      flex: 1;
      border: none;

      &-small {
        height: 22px;
      }

      &-large {
        height: 38px;
      }

      &-focused {
        box-shadow: none;
      }

      .ivu-input-number-handler-wrap {
        display: none;
      }
    }

    .unit-in-end {
      order: 2;
    }
  }

  &-start {
    padding-left: 7px;
  }

  &-end {
    padding-right: 7px;
  }

  &-focus {
    border-color: #57a3f3;
    outline: 0;
    box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2);
  }

  &-none-unit {
    padding-right: 0;

    /deep/ .ivu-input-number .ivu-input-number-handler-wrap {
      display: block;
    }
  }
}
</style>

```

#### 实现细节

- 鼠标交互时的样式：首先需要把原生 `InputNumber` 鼠标聚焦时的样式都给取消掉，然后给 `InputNumber` 添加 `on-focus` 和 `on-blur` 事件，监听当前输入框的状态，根据状态，给整个父容器添加 _hover_ 、聚焦和失焦时的样式。
- 不同尺寸的控件，让单位的字体大小也跟随变化：在接收的 `props` 中，特别把 `size` 属性单拎了出来。因为对于不同尺寸的控件，`InputNumber` 会通过一个 CSS 类 `ivu-input-number-[size]` 来设置字体的大小。这里很巧妙，直接把这个根据 `size` 动态变化的类设置在了父容器上，这样单位的字体大小就直接继承自父容器了，不需要根据 `size` 单独设置字体大小了。
- 单位的位置：你是不是以为分别在头部和尾部都设置了一个单位的容器，然后根据 `unitPlacement` 再只单独展示某一个。如果对 `flex` 布局熟悉的话，子元素可以通过 `order` 来设置当前排列的位置。也即，只需要在头部放置一个单位，然后通过 `order` 来调整它的位置就可以了。
- 没有设置 `unit` 时，展示原生 `InputNumber` 的样式：原生 `InputNumber` 在鼠标滑入时，会在右侧显示一个向上和向下调整的按钮，由于设置了单位后，这个按钮无论居左还是居右，在哪都不好看，索性就给去掉了。如果当前没有设置 `unit`，并且也没设置 `unit` 的插槽，那么就把按钮再显示出来就好了。

#### 最终效果

最后看一下，各个尺寸的整体效果吧。

{% asset_img result.gif %}
