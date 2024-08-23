---
title: VueMixinsLoader v1.0.2 release !
categories:
  - 日常
  - 每周一篇
  - 笔记
tags:
  - Vue
  - Webpack
  - Loader
mathjax: false
date: 2023-07-02 17:23:32
---

> 昨天闲来无事，逛逛 GitHub，突然发现有人 star 了我的项目 [vue-mixins-loader](https://github.com/showlotus/vue-mixins-loader)，可给我激动坏了。本着有一个人用，就要维护到底的原则，我准备给这个 _Loader_ 做一次优化。在实际用的过程中发现一个问题：使用时，会把项目中所有 _.vue_ 文件都给注入 _mixins_ 。比如有些外部引入的 _.vue_ 组件，这就完全没有必要去注入 _mixins_ 。所以，计划再新增一个 _options_ 属性 `exclude`，由用户自己去定义哪些文件可以排除掉，不注入 _Loader_ 提供的 _mixins_ 。想法有了，这就开搞！（其实这个问题在第一版发布的时候，就发现了，当时手头有点忙就给搁置了，刚好这次给完善一下）

{% asset_img 1.png %}

#### 属性设计

这次需要在 _Loader_ 的 _options_ 中新增一个属性 _exclude_ ，由于 _Loader_ 的 _options_ 的特殊性（会进行 JSON 的序列化和反序列化处理），所以，属性的数据类型就设计成 `string` 或者 `string[]`，这两种类型分别对应单个或者多个。值为一个正则表达式字符串，用这个去判断当前 _.vue_ 文件是否在 _Loader_ 的处理之外。

也就是现在的 _options_ 可以写成下面这样：

```js
options: {
  exclude: 'element-ui',
  // 或者
  exclude: ['components/', 'view-design'],

  // 之前的配置
  tools3: '@/utils/tools3.js',
  custom: stringify({
    mounted() {
      console.log("this is custom mixins's mounted")
    }
  })
}
```

> 把 `exclude` 与之前的混入属性放在一起，总感觉怪怪的。最好还是把混入的属性归纳在一个字段里比较合适，比如 _mixin_ 什么的。OK，下一个版本的功能迭代有啦！嘿嘿！

#### 功能实现

获取配置中提供的 `exclude` 参数，借助 `loader-utils` 提供的 _getOptions_ 方法。

```js
const { getOptions } = require("loader-utils")

function callback(source, sourceMaps) {
  const originOptions = getOptions(this)
  const { exclude } = originOptions
}
```

获取当前文件路径，同样借助 `loader-utils` 提供的 _getCurrentRequest_ 方法。

```js
const { getCurrentRequest } = require("loader-utils")

function callback(source, sourceMaps) {
  const currentRequest = getCurrentRequest(this)
}
```

校验当前文件是否需要排除，写一个方法 `validateExclude` 专门去判断这个。如果返回值是 `true`，那么直接返回源文件内容即可。不需要再走下面注入 _mixins_ 的逻辑。

```js
const { getOptions, getCurrentRequest } = require("loader-utils")

function callback(source, sourceMaps) {
  const originOptions = getOptions(this)
  const { exclude } = originOptions
  const currentRequest = getCurrentRequest(this)
  // 校验是否排除当前文件
  if (validateExclude(exclude, currentRequest)) {
    return source
  }
}
```

`validateExclude` 的具体内容如下：

```js
const validate = (rule, targetStr) => {
  const pattern = new RegExp(rule, "g")
  return pattern.test(targetStr)
}

// 获取 vue 文件的路径，并将反斜杠转为斜杠
const getFilePath = str => {
  const start = str.indexOf("!")
  const end = str.indexOf(".vue", start)
  const path = str.slice(start + 1, end + 4)
  return path.replace(/\\/g, "/")
}

/**
 * 校验当前文件是否排除
 * @param {string|string[]} rules 排除的规则
 * @param {string} currentRequest 当前文件路径
 * @returns {boolean}
 */
function validateExclude(rules, currentRequest) {
  if (!rules) {
    return false
  }

  // 统一转为 Array 类型，方便处理
  if (typeof rules === "string") {
    rules = [rules]
  }

  const filePath = getFilePath(currentRequest)
  for (const rule of rules) {
    if (validate(rule, filePath)) {
      return true
    }
  }

  return false
}
```

这里有一个路径转换的操作，这是因为不同操作系统文件路径不一致：

{% asset_img 3.png %}

所以，统一将反斜杠 `\` 转为了斜杠 `/`，也比较符合操作习惯。

#### 如何使用

`exclude` 同样是配置在 _options_ 对象下，提供一个字符串，或者字符串数组。

```js
const path = require("path")
const { stringify } = require("vue-mixins-loader")

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          "vue-loader",
          {
            loader: "vue-mixins-loader",
            options: {
              exclude: ["components/", "view-design"], // v1.0.2 new add
              tools: path.resolve("./src/utils/tools.js"),
              tools2: path.resolve("./src/utils/tools2.js"),
              tools3: "@/utils/tools3.js",
              custom: stringify({
                props: {
                  block: {
                    type: Object,
                    default: () => ({})
                  }
                },
                mounted() {
                  console.log("this is custom mixins's mounted")
                }
              })
            }
          }
        ]
      }
    ]
  }
}
```

从昨天下午 4 点半开始准备写这个功能，到凌晨 1 点完成。写功能其实也就用了 2 小时左右，其余的时间都在优化测试的代码，之前的测试用例是 _rollup_ 写的，测试 _Loader_ 需要用 _loader-runner_ 去实现。当时是为了偷懒，_Loader_ 打包用的 _rollup_ ，所以测试也顺带用 _rollup_ 了，测试过程极其繁琐。于是就想着整改一下，直接改用 _webpack_ + _webpack-dev-server_ 去测试。整改完后，果然，测试轻松多啦，美滋滋~~~

整完之后，顺带发布 _v1.0.2_ ！赶紧来试试吧！

{% asset_img 4.png %}
