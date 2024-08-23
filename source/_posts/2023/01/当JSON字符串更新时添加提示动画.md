---
title: 当 JSON 字符串更新时添加提示动画🦄 <W17>
categories:
  - [日常]
  - [每周一篇]
tags:
  - Vue
  - JavaScript
  - JSON
  - CSS
mathjax: false
date: 2023-01-18 12:19:53
---

{% asset_img banner.jpg %}

> 为了便于用户能直观地看到配置项的一些属性，于是把整个配置以一个 _JSON_ 串的形式展示。本来打算以一个表格或者列表的形式展示，不过配置项中某些属性是 _Object_ 类型，思来想去，还是 _JSON_ 串更直观一点。但是当某个配置改变时，_JSON_ 里的变动不是很明显（如下图所示）。当这个 _JSON_ 里的属性太多时，就不容易能注意到是哪个配置变了。于是，就想能不能做一个属性变化的提示，当某个配置改变时，显示一个高亮的动画什么的，提示用户这个配置改变了 🤔。想法有了，准备冻手！

{% asset_img problem.gif %}

#### 思路

将 _JSON_ 串分行，根据当前改变的属性去找到该属性对应的行区间，然后高亮显示这些行。整个流程如下：

{% asset_img 0.png %}

#### Step.One：更改属性

考虑到这个对象的属性太多，专门写个表单去更改，实在太麻烦了。于是，就想了一个方法：随机去更改某个属性。

这里只对最底层的子属性做修改，例如，对于下方的 _obj_ 对象：

```js
const obj = {
  name: "Tom",
  age: 20,
  address: {
    province: "A",
    city: "B",
    county: "C"
  }
}
```

可以修改的属性有：

- `obj.name`
- `obj.age`
- `obj.address.province`
- `obj.address.city`
- `obj.address.county`

没有对 `obj.address` 做更改哦！！！

按照上方罗列的属性，想必你也猜到了，需要对源对象进行「 扁平化 」处理，也即把上述的 _obj_ 对象转成下面这种格式：

```js
const flattenObj = {
  "obj.name": "Tom",
  "obj.age": 20,
  "obj.address.province": "A",
  "obj.address.city": "B",
  "obj.address.county": "C"
}
```

> 「 扁平化 」的具体实现，可以参考文末的工具函数 <a href="#flattenObj"><big>_flattenObj_</big></a>。

已知当前对象可更改的属性有 _5_ 个，随机取一个属性，那么就可以写出下面这段代码：

```js
const newObj = flattenObj(obj)
const keys = Object.keys(newObj)
const key = keys[Math.floor(Math.random() * keys.length)]
```

拿到这个 _key_ 后，就可以去做修改了。为了让这个属性更改后的值更具有差异性，可以让更改后的值类型不同于源类型。于是制定了一些更改规则，如下：

- `Array` -> `Boolean`，即 `Array` 类型更改后为 `Boolean` 类型，下面以此类推。
- `Boolean` -> `Number`
- `Number` -> `String`
- `String` -> `Array`

例如，对于下方的 _obj_ 对象：

```js
const obj = {
  name: "Tom",
  age: 20,
  student: true,
  likes: ["apple", "banana", "pear"]
}
```

按照上述规则，更改后的值可能为：

```diff
const obj = {
- name: "Tom",
+ name: [1, 2],
  age: 20,
  student: true,
  likes: ["apple", "banana", "pear"]
}
```

也可能为：

```diff
const obj = {
  name: "Tom",
- age: 20,
+ age: "asx",
  student: true,
  likes: ["apple", "banana", "pear"]
}
```

也可能为：

```diff
const obj = {
  name: "Tom",
  age: 20,
- student: true,
+ student: 239,
  likes: ["apple", "banana", "pear"]
}
```

也可能为：

```diff
const obj = {
  name: "Tom",
  age: 20,
  student: true,
- likes: ["apple", "banana", "pear"]
+ likes: true
}
```

> 具体实现可以参考文末的工具函数 <a href="#genOtherTypeValue"><big>_genOtherTypeValue_</big></a>。

已知需要更新的 _key_ 和需要更改的值了，就可以去对源对象做修改了。

因为拿到这个 _key_ 是「 扁平化 」后的，也即是链式的。如果想用这个 _key_ 去更改源对象 _obj_ 中对应的属性，需要做一些处理。用一个工具函数 <a href="#updateValByChainKey"><big>_updateValByChainKey_</big></a> 根据链式的 _key_ 去更新对象中的值，以及 <a href="#getType"><big>_getType_</big></a> 去获取当前的值类型。

完善上面的代码后，如下：

```js
const newObj = flattenObj(obj)
const keys = Object.keys(newObj)
const key = keys[Math.floor(Math.random() * keys.length)]
// 新增
const type = getType(newObj[key])
const newVal = genOtherTypeValue(type)
updateValByChainKey(obj, key, newVal)
```

源对象已经更新了，接下来就是生成新的 _JSON_ 串，然后分行。

#### Step.Two：生成 JSON 串，并分行

通过 `JSON.stringify(obj, null, 2)` 生成 _JSON_ 串。因为要根据行号来添加高亮效果，直接操作整个 _JSON_ 串肯定不行，所以需要对整个 _JSON_ 串进行分行，直接调用 `String.split("\n")` 就行，展示时，起始行号设为 _1_ （如下图所示）。

{% asset_img 1.png %}

#### Step.Three：计算行区间

举个例子，`colorMultiType` 的行区间就是 `[3, 13]`、`colorMultiType.start` 的行区间就是 `[4, 7]`、`colorMultiType.start.color` 的行区间就是 `[5, 5]` 或者 `[5]`。

{% asset_img 2.png %}

同样，为了方便记录行区间，也需要进行「 扁平化 」处理，用这个「 扁平化 」后的对象去记录每个属性对应的行区间，获取到各个属性的行区间后的对象 _rowObj_ 如下：

```js
const rowObj = {
  colorCommon: [2],
  colorMultiType: [3, 13],
  "colorMultiType.start": [4, 7],
  "colorMultiType.start.color": [5],
  "colorMultiType.start.offset": [6, 6],
  "colorMultiType.end": [8, 11],
  "colorMultiType.end.color": [9],
  "colorMultiType.end.offset": [10, 10],
  "colorMultiType.direction": [12, 12],
  colorGradient: [14, 19],
  "colorGradient.show": [15],
  "colorGradient.fromColor": [16],
  "colorGradient.toColor": [17],
  "colorGradient.angle": [18, 18],
  colorTextShadow: [20, 24],
  "colorTextShadow.size": [21],
  "colorTextShadow.color": [22],
  "colorTextShadow.show": [23, 23],
  colorGroup: [25, 29]
}
```

> 获取行区间的具体实现，可以参考文末的工具函数 <a href="#getPropRowsFromJSON"><big>_getPropRowsFromJSON_</big></a>。

#### Step.Four：高亮显示行区间

在 _Step.One_ 中，拿到了更改的属性 _key_ ，在 _Step.Three_ 中拿到了每个属性对应的行区间对象 _rowObj_ ，那么需要高亮的行区间 `highLightRows = rowObj[key]`。区间行的高亮通过 _CSS_ 添加一个高亮 _Class_ 来实现。

```js
<template>
  <div>
    <div v-for="(item, i) in strList" :key="i">
      <div class="line-wrap">
        <span class="line-num">{{ i + 1 }}</span>
        <pre :class="isHighLight(i + 1)">{{ item.text }}</pre>
      </div>
    </div>
  </div>
</template>
```

```js
<script>
export default {
  data() {
    return {
      strList: [], // 按 "\n" 分割后的 JSON 串数组
      highLightRows: [], // 高亮行区间
    }
  },
  methods: {
    isHighLight(idx) {
      if (!this.highLightRows.length) return '';
      // 因为有些行区间，可能为一个元素或者两个元素
      // 这里判断索引大于等于第一个元素
      // 并且小于等于最后一个元素
      // 这样就都能满足啦
      if (
        idx >= this.highLightRows[0] &&
        idx <= this.highLightRows[this.highLightRows.length - 1]
      ) {
        return 'tip';
      }
      return ''
    }
  }
}
</script>
```

```css
/* 动画函数 */
@keyframes blingbling {
  0%,
  50%,
  100% {
    background-color: transparent;
  }

  25%,
  75% {
    background-color: orange;
  }
}

.tip {
  animation: blingbling ease 1s;
}
```

#### 最终效果

<div class="iframe-codepen" src="https://codepen.io/showlotus/full/vYaeQLW" width="100%" height="850"></div>

#### 总结

- 这里没有考虑数组元素中有对象的情况，默认数组里都是基础数据类型。
- <a href="#getPropRowsFromJSON"><big>_getPropRowsFromJSON_</big></a> 这个方法，感觉写的不是很好（虽然写的时候快自闭了），应该有更好的方法 🤔。
- 已知当前更改的属性了，没有必要把整个对象的所有属性都生成行区间，算是一个可以优化的点。

#### 工具函数

##### getType

```js
// 获取类型
function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}
```

##### isObject

```js
// 判断是否是 Object 类型
function isObject(obj) {
  return getType(obj) === "Object"
}
```

##### flattenObj

```js
// 扁平化对象
function flattenObj(obj) {
  const res = {}
  const handler = (obj, prefix = "") => {
    if (prefix) {
      prefix += "."
    }
    for (const key in obj) {
      const newKey = `${prefix}${key}`
      if (isObject(obj[key])) {
        handler(obj[key], newKey)
      } else {
        res[newKey] = obj[key]
      }
    }
  }
  handler(obj)
  return res
}
```

##### updateValByChainKey

```js
// 根据链式的 key，更新对象中对应属性的值
function updateValByChainKey(obj, keys, val) {
  const seqs = keys.split(".")
  if (seqs.length === 1) {
    obj[keys] = val
  } else {
    for (let i = 0; i < seqs.length; i++) {
      const key = seqs[i]
      if (i !== seqs.length - 1) {
        obj = obj[key]
      } else {
        obj[key] = val
      }
    }
  }
}
```

##### genOtherTypeValue

```js
// 根据当前类型生成其他类型的值
function genOtherTypeValue(type) {
  const genRandomInteger = (max, min = 0) => Math.floor(Math.random() * max) + min
  const ops = {
    Array() {
      return Math.random() < 0.5 ? true : false
    },
    Boolean() {
      return genRandomInteger(1000)
    },
    Number() {
      const len = genRandomInteger(10)
      const res = new Array(len).fill(0).map(() => String.fromCharCode(genRandomInteger(26) + 97))
      return res.join("")
    },
    String() {
      const len = genRandomInteger(5)
      return new Array(len).fill(0).map(() => genRandomInteger(10))
    }
  }
  return ops[type]()
}
```

##### getPropRowsFromJSON

```js
// 获取对象转成 JSON 串后，各个属性对应的行区间
function getPropRowsFromJSON(obj, stringify = v => JSON.stringify(v, null, 2)) {
  const flattenedObj = flattenObj(obj)
  const objJson = stringify(obj)
  const objJsonArr = objJson.split("\n")
  const propStack = []
  const spaceStack = [0]
  const rowObj = {}

  for (let i = 1; i < objJsonArr.length - 1; i++) {
    const text = objJsonArr[i]
    const propName = getPropName(text)
    const countSpace = countOfStartSpace(text)
    // 下钻层级
    if (countSpace > spaceStack[spaceStack.length - 1]) {
      spaceStack.push(countSpace)
    } else if (propName) {
      // 上一层级结束
      while (spaceStack.length && spaceStack[spaceStack.length - 1] >= countSpace) {
        spaceStack.pop()
        propStack.pop()
      }
      spaceStack.push(countSpace)
    } else {
      rowObj[propStack.join(".")][1] = i
      const key = propStack.slice(0, -1).join(".")
      if (key) {
        rowObj[key].push(i + 1)
      } else {
        rowObj[propStack.join("")][1] = i + 1
      }
    }
    if (propName) {
      propStack.push(propName)
      const key = propStack.join(".")
      if (Array.isArray(flattenedObj[key])) {
        if (flattenedObj[key].length) {
          rowObj[key] = [i + 1, i + 1 + flattenedObj[key].length + 1]
          i += flattenedObj[key].length + 1
        } else {
          rowObj[key] = [i + 1]
        }
      } else {
        rowObj[key] = rowObj[key] || [i + 1]
      }
    }
  }

  return rowObj

  // 字符串开头空格的数量
  function countOfStartSpace(str) {
    return str.length - str.trimStart().length
  }

  // 获取属性名
  function getPropName(str) {
    const res = str.match(/^\s+\"([^"]+)":/)
    return res ? res[1] : ""
  }
}
```

{% asset_img result.gif %}
