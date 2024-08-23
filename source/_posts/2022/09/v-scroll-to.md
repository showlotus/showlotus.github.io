---
title: v-scroll-to <W3>
mathjax: false
date: 2022-09-16 15:55:54
tags:
  - Vue-指令
categories:
  - [日常]
  - [每周一篇]
---

{% asset_img banner.jpg %}

> 实现的功能：将当前容器或子容器的滚动条移动到底部或顶部。主要源于，某个弹窗里有一个按钮可以将当前表格新增一行，如果弹窗内容过长，就会出现滚动条，然后测试说，点了新增后，是不是滚动条需要滚动到底部。这个效果，之前在另一个弹窗里实现过，怕不是他看到了，感觉这样更合理，然后给我提需求，算是自己埋了个坑。不过，也还好，想着如果用之前的代码，直接 _CV_ 过来，太 _low_ 了，打算写个指令，高端大气上档次！

{% asset_img problem.gif %}

#### 实现原理

主要依靠 _DOM_ 元素的两个属性和一个方法：_clientHeight_ 、 _scrollHeight_ 和 _scrollTo_ ，先看看 MDN 上的解释：

- [_clientHeight_](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/clientHeight)：元素内容区高度 + 内边距；

- [_scrollHeight_](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollHeight)：该元素在不使用滚动条的情况下为了适应视口中所用内容所需的最小高度；

- [_scrollTo_](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollTo)：使用时如果传两个参数 (x, y)，那么 x 是期望滚动到位置水平轴上距元素左上角的像素，y 是期望滚动到位置竖直轴上距元素左上角的像素。

简单翻译一下：

- _clientHeight_ ：和当前容器的盒模型有关。

  - 对于 _content-box_ : 在页面上的实际高度 `offsetHeight = borderTopWidth + paddinTop + height + paddingBottom + borderBottomWidth = 10px + 30px + 100px + 30px + 10px = 180px`，而 `contentHeight（内容区高度） == height == 100px`，那么 `clientHeight = contentHeight（内容区高度）+ paddingTop + paddingBottom = 100px + 30px + 30px = 160px`；

    ```css
    .content-box {
      box-sizing: content-box;
      width: 200px;
      height: 100px;
      padding: 30px;
      border: 10px solid #000;
    }
    ```

  - 对于 _border-box_ : 在页面上的实际高度 `offsetHeight = height = 100px`，而 `contentHeight（内容区高度）= height - borerTopWidth - paddingTop - paddingBottom - borderBottomWidth = 100px - 10px - 30px - 30px - 10px = 20px`，那么 `clientHeight = contentHeight（内容区高度）+ paddingTop + paddingBottom = 20px + 30px + 30px = 80px`。

    ```css
    .border-box {
      box-sizing: border-box;
      width: 200px;
      height: 100px;
      padding: 30px;
      border: 10px solid #000;
    }
    ```

- _scrollHeight_ ：为了能容下子元素所有内容的最小高度。如果 _child_ 的高度小于 _parent_ 的高度，那么 _parent_ 的 `scrollHeight == 200px`，如果 _child_ 的高度（假设为 `400px`）大于 _parent_ 的高度，那么 _parent_ 的 `scrollHeight = 400px`。

  ```js
  <div class="parent">
    <div class="child"></div>
  </div>

  <style>
  .parent {
    width: 200px;
    height: 300px;
  }

  .child {
    width: 100%;
    height: 200px;
  }
  </style>
  ```

- _scrollTo_ ：主要使用的是携带两个参数的用法，第一个参数是水平方向的滚动到的距离，第二个参数是垂直方向的滚动到的距离。比如：

  - `scroll(0, 0)`：滚动到左上角；
  - `scroll(scrollWidth - clientWidth, 0)`：滚动到右上角；
  - `scroll(0, scrollHeight - clientHeight)`：滚动到左下角；
  - `scroll(scrollWidth - clientWidth, scrollHeight - clientHeight)`：滚动到右下角。

这里我们只需要置顶和置底，置顶不需要高度的计算，直接 `scrollTo(0, 0)` 就行；而置底需要计算一下，当 _scrollHeight_ > _clientHeight_ 时，当前容器才会出现滚动条，而超出的距离就是需要滚动到底部的距离，即 `scrollHeight - clientHeight`，也就是 `scrollTo(0, scrollHeight - clientHeight)`，如果没有滚动条 _scrollHeight_ 恒等于 _clientHeight_ ，就算执行 `scrollTo(0, 0)` 也不会有任何影响。

#### 指令设计

指令的表达式需要传一个对象，有三个属性：

- `top`：一个方法名，当该方法执行后，并在下一轮事件循环中将滚动条滚动到顶部；
- `bottom`：一个方法名，当该方法执行后，并在下一轮事件循环中将滚动条滚动到底部；
- `selector`：选择器，如果想滚动的容器不是当前元素，而是它的子元素，可以提供一个子元素的选择器。

方法执行后，在下一轮事件循环中移动滚动条，实现的主要思路就是，劫持当前方法，然后在 `$nextTick` 中移动滚动条，确保视图更新后，再移动滚动条。

```js
export default {
  bind(el, binding, vnode) {
    const { top, selector } = binding.value
    let container = el
    // 如果提供了选择器，在当前元素下查找元素
    if (selector && selector.trim()) {
      container = el.querySelector(selector)
    }
    // 未找到元素，直接结束，不再执行下面的代码
    if (!container) return

    const _this = vnode.context
    if (top) {
      const originTop = _this[top]
      _this[top] = function () {
        originTop(...arguments)
        _this.$nextTick(() => {
          container.scrollTo(0, 0)
        })
      }
    }

    // 劫持当前实例下的方法，相当于给该方法重新赋值了，若想立即生效，需要调用一次 $forceUpdate()
    _this.$forceUpdate()
  }
}
```

> 方法目前只支持同步执行，暂不支持异步，后续有遇到再优化。

如果当前绑定指令的元素被卸载了，当前实例下的方法依然是被劫持后的方法，可能会产生一些副效应（ _SideEffect_ )。所以，我们还要在指令的卸载阶段，将被劫持的方法重置为原方法。重置为原方法，肯定需要记录一下原方法，然后再取出来重新赋值。

这里的实现思路参考了 _Vue_ 底层 _$watch_ 的实现原理：使用 _$watch_ 后会返回一个函数，执行这个函数就会将当前监听从目标的依赖中移除。而我们这里执行拦截器返回的函数就是将方法重置。考虑到，可能需要拦截两次方法，而且这个拦截的代码主体结构都相同，只有拦截后的回调不同，那就需要一个拦截器函数，专门用来拦截方法。

```js
function intercept(obj, key, callback) {
  const originFn = obj[key]
  obj[key] = function () {
    originFn(...arguments)
    callback()
  }
  return function () {
    obj[key] = originFn
  }
}
```

试试效果：

```js
const obj = {
  sayHi() {
    console.log("Hi~")
  }
}

obj.sayHi() // "Hi~"
const teardownSayHi = intercept(obj, "sayHi", () => {
  console.log("intercept")
})

obj.sayHi()
// "Hi~"
// "intercept"

teardownSayHi()
obj.sayHi() // "Hi~"
```

很 Nice！没毛病！

#### 整体代码

```js
export default {
  bind(el, binding, vnode) {
    const { top, bottom, selector } = binding.value
    let container = el
    if (selector && selector.trim()) {
      container = el.querySelector(selector)
    }
    if (!container) return
    const _this = vnode.context
    if (top) {
      el.teardownTop = intercept(_this, top, () => {
        _this.$nextTick(() => {
          container.scrollTo(0, 0)
        })
      })
    }
    if (bottom) {
      el.teardownBottom = intercept(_this, bottom, () => {
        _this.$nextTick(() => {
          const containerHeight = container.clientHeight
          const contentHeight = container.scrollHeight
          container.scrollTo(0, contentHeight - containerHeight)
        })
      })
    }
    if (top || bottom) {
      _this.$forceUpdate()
    }

    function intercept(obj, key, callback) {
      const originFn = obj[key]
      obj[key] = function () {
        originFn(...arguments)
        callback()
      }
      return function () {
        obj[key] = originFn
      }
    }
  },
  unbind(el, binding, vnode) {
    // 解绑后，取消拦截
    const _this = vnode.context
    el.teardownTop && el.teardownTop()
    el.teardownBottom && el.teardownBottom()
    if (el.teardownTop || el.teardownBottom) {
      _this.$forceUpdate()
    }
  }
}
```

> 这里有个巧妙的点，因为需要在 _bind_ 阶段设置方法，在 _unbind_ 阶段卸载方法，为了让 _unbind_ 阶段能取到方法名，可以直接将方法挂载到当前 DOM 对象上。卸载阶段执行后，直接将当前 DOM 删除了，所以也不需要删除挂载的方法，岂不美哉！

#### 最终效果

点击 _push_ 添加，然后置底，点击 _shift_ 移除第一项，然后置顶。除了原生的 HTML 元素，还试了 _el-table_ 、_ivu-table_ 以及 _ivu-modal_ ，效果都不错。在组件上使用，主要是找到那个出现滚动条的元素，然后查看它的 CSS 选择器，最后传给 `selector` 就可以了。

```js
<template>
  <div>
    <!-- ivu-table 只展示了指令的配置，省略了其他属性 -->
    <Table
      v-scroll-to="{
        top: 'handleShift',
        bottom: 'handlePush',
        selector: '.ivu-table-body',
      }">
    </Table>

    <!-- el-table 只展示了指令的配置，省略了其他属性 -->
    <el-table
      v-scroll-to="{
        top: 'handleShift',
        bottom: 'handlePush',
        selector: '.el-table__body-wrapper',
      }">
    </el-table>

    <!-- ivu-modal 只展示了指令的配置，省略了其他属性 -->
    <Modal
      v-scroll-to="{
        top: 'handleModalShift',
        bottom: 'handleModalPush',
        selector: '.ivu-modal-body',
      }">
    </Modal>
  </div>
</template>
```

{% asset_img result.gif %}
