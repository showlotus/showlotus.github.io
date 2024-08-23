---
title: VueMixinsLoader：类似 Mixin 功能的 Loader🦉
categories:
  - [探索]
tags:
  - AST
  - Vue
  - Webpack
  - Babel
mathjax: false
date: 2023-03-31 19:37:38
---

{% asset_img banner.jpg %}

> 最近要给项目用到的组件库里的所有组件都要加一个 _prop_ ，总共 _126_ 个组件，如果是手动加，emm，也不是不可以，但就是有点呆，更何况如果后续有变动的话，又得重新来一遍。于是就想，如何用一种全局的配置，去统一给所有组件加 _prop_ （这里没有使用 `Vue.mixin` 去全局混入，下文会作解释）。最后打算开发一个 _Webpack Loader_ 去实现这个功能，刚好之前也没写过 _Loader_ ，借这个机会试一试，顺便了解一下 _Loader_ 的运行机制，如果能实现出来，想想就很酷 😉。（文末有仓库地址）

#### 为什么没有用 Vue.mixin？

首先，先来讲一下 `Vue.mixin` 全局混入的机制。一个使用 _Vue2_ 搭建的项目，我们可以通过 `Vue.prototype.someProp = 'hello'` 的方式，在 _Vue_ 的原型上挂载一个全局属性 _someProp_ ，这样项目下所有的 _Vue_ 实例都可以通过 `this.someProp` 的方式访问到。简单点说，就是每个 _Vue_ 实例都能访问到原型上的属性。

也可以通过 `Vue.mixin` 混入一个全局配置，例如像下面这样：

```js
Vue.mixin({
  data() {
    return {
      someProp: "hello"
    }
  }
})
```

不过会有一个问题，它影响每一个之后创建的 _Vue_ 实例，就是当前项目下所有的 _Vue_ 实例都会被混入。而我们只需要对组件库中的所有组件混入就行，这种做法的影响范围有些广，有点不可取。同时，组件库和原项目之间耦合性又增加了，不建议。

#### 为什么要用 _Loader_ 去实现？

因为之前写一个 [Prettier Plugin](https://showlotus.github.io/70ab28ff8c6d.html) ，最开始也打算故技重施，再用 _Prettier_ 写一个插件，对组件库中的所有 _Vue_ 文件，添加一个 _Mixin_ 。这种方案其实就是代替人工去给每一个 _Vue_ 组件手动添加 _Mixin_ 了。如果后续有更改，或者要把这个 _Mixin_ 丢掉，有得重新写一个 _Plugin_ ，emm，已经感到有点麻烦了。如果能通过外部插入的方式，添加 _Mixin_ ，可随时注入或撤销，同时不对原文件做更改，那最好不过了。

_Webpack Loader 了 ~ 解 ~ 一 ~ 下 ~~~（画外音）_

关于 _Loader_ ，_Webpack_ 官网是这样介绍的：

> Webpack enables use of loaders to preprocess files. This allows you to bundle any static resource way beyond JavaScript. You can easily write your own loaders using Node.js.
>
> 机翻：_Webpack_ 允许使用加载器对文件进行预处理。这允许您以 JavaScript 之外的方式捆绑任何静态资源。你可以很容易地使用 Node.js 编写自己的加载器。

因为 _Webpack_ 只能解析 _JS_ 和 _JSON_ 类型的文件，对于其他类型的文件都需要安装一些 _Loader_ 去处理，比如，`vue-loader`、`style-loader`、`less-loader` 等等。

组件库在进行打包时，也需要使用 `vue-loader` 去处理 _Vue_ 文件，就像下面这样：

```js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.less$/,
        use: ["vue-style-loader", "css-loader", "less-loader"]
      }
    ]
  }
}
```

可以使用多个 _Loader_ 去处理，例如，上面的配置中，对于 `.less` 文件，使用了三个 Loader，并且按照从右到左的顺序依次执行。也就是，先由 `less-loader` 处理，将处理后的结果，传给 `css-loader`，`css-loader` 处理完后，再交给 `vue-style-loader` 处理。

大致的实现思路就是：在 `vue-loader` 处理前，把 _Mixin_ 注入到 _Vue_ 文件里，然后再交给 `vue-loader` 处理，只需要保证在注入 _Mixin_ 后的 _Vue_ 文件的合法性即可。

最后使用 _Loader_ 后的 _Webpack_ 配置大致如下：

```js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          "vue-loader",
          {
            loader: VueMixinsLoader,
            options: {
              // TODO
            }
          }
        ]
      }
    ]
  }
}
```

通过 _Loader_ 去注入，在不改变原文件的前提下，可操作性更强了！

#### Loader's options 配置

身为一个 _Loader_ ，那就少不了 _options_ 配置，这里的 _options_ 以一个对象的形式提供。为了更接近 _Mixin_ 的写法，并且方便从外部引入，提供了有两种可选方式的配置：

##### 1. 引入外部资源

对于比较复杂的 _Mixin_ 可能需要单独封装在一个公共模块里，然后通过 `import` 的方式引入。比如，需要引入 `src/utils/tools.js` 这个模块。可以写成下面这样：

**配置**

```js
{
  loader: VueMixinsLoader,
  options: {
    tools: "src/utils/tools.js"
  }
}
```

**原文件**

```txt
import A from "a.js"

export default {
  // ...
}
```

**处理后**

```diff
+ import toolsMixin from "src/utils/tools.js"
import A from "a.js"

export default {
  // ...
+ mixins: [toolsMixin]
}
```

提供的资源路径会原封不动地注入到 _Vue_ 文件里，也就是需要保证 **在不同的 _Vue_ 文件中使用这个路径引入时，都能引入到这个资源**。为了保证每个 _Vue_ 文件都能正常地引入这个资源，建议使用绝对路径，或者使用 `alias` 别名。

```js
{
  loader: VueMixinsLoader,
  options: {
    tools: path.resolve("src/utils/tools.js"), // 使用 path.resolve 将路径转为绝对路径
    tools2: "@/utils/tools.js", // 使用 @ 别名，@ 为 src 目录的别名
  }
}
```

> 你可能会有疑问：加一句 _import_ 和 _mixins_ 就能注入了？其实 `vue-loader` 在解析时，也是拿到整个 _Vue_ 文件代码的字符串，然后再去做解析的。单文件组件只是 _Vue_ 提供的一种近似于原生 _HTML_ 的写法，便于开发者开发。底层处理的时候，还是把整个文件当作一个字符串，然后去解析，没有那么玄乎（狗头保命）。

##### 2. custom 属性

对于一些简单的 _Mixin_ ，不需要以外部资源的形式引入，那么就可以直接提供一个对象，都写在 _custom_ 这个属性下。

> 后续测试时，发现了一个问题：_webpack_ 在处理 _options_ 时，会将其转为 _JSON_ 格式，也就意味着，对于一些属性为函数的，就会丢失。研究了一种解决方案，_vue-mixins-loader_ 提供了一个 `stringify` 方法，需要对这个 `custom` 对象进行包裹，将其转为一个字符串，保证 _JSON_ 序列化时不会丢失属性。

**配置**

```js
{
  loader: VueMixinsLoader,
  options: {
    custom: VueMixinsLoader.stringify({
      props: {
        message: {
          type: String,
          default: 'Hello World'
        }
      },
      created() {
        console.log('this is created hook')
      },
      mounted() {
        console.log('this is mounted hook')
      }
    })
  }
}
```

写法和 _Mixin_ 完全一样。最后处理的时候，会把整个对象赋值给 `customMixin` 这个变量，然后注入到 _mixins_ 里。

**原文件**

```txt
import A from "a.js"

export default {
  // ...
}
```

**处理后**

```diff
import A from "a.js"

+ const customMixin = {
+   props: {
+     message: {
+       type: String,
+       default: "Hello World"
+     }
+   },
+   created() {
+     console.log("this is created hook")
+   },
+   mounted() {
+     console.log("this is mounted hook")
+   }
+ }

export default {
  // ...
+ mixins: [customMixin]
}
```

##### 混合使用

两种方式可以混合使用，并且如果原 _Vue_ 文件中也有引入自己的 _Mixin_ ，则会把它们合并。

**配置**

```js
{
  loader: VueMixinsLoader,
  options: {
    tools: "@/utils/tools.js",
    custom: VueMixinsLoader.stringify({
      props: {
        message: {
          type: String,
          default: "Hello World"
        }
      }
    })
  }
}
```

**原文件**

```txt
import A from "a.js"
import BMixin from "b.js"

export default {
  // ...
  mixins: [BMixin]
}
```

**处理后**

```diff
+ import toolsMixin from "@/utils/tools.js"
import A from "a.js"
import BMixin from "b.js"

+ const customMixin = {
+   props: {
+     message: {
+       type: String,
+       default: "Hello World"
+     }
+   }
+ }

export default {
  // ...
- mixins: [BMixin]
+ mixins: [BMixin, toolsMixin, customMixin]
}
```

#### 实现原理

看到这里，你是不是很好奇，上面的操作是如何实现的。细心的你想必也发现了，文章的标签里有 _AST_ 和 _Babel_ ，到现在还没有提及，是时候登场啦！

得益于 _Babel_ 的强大，可以将任意一段 _JS_ 代码，解析成 _AST_ 。这也就使得我们可以对生成的 _AST_ 做一些操作，比如，格式化代码、删除注释等等，这次的 <big>_VueMixinLoader_</big> 也是如此。

> _AST_ 在线生成网站：https://astexplorer.net

##### 1. 解析 options 配置

关于 _options_ 中的配置项，只对值为 _String_ 类型的属性和 _custom_ 属性做处理，其他的忽略就好，不做任何处理。

值为 _String_ 类型的，都将该值作为一个资源路径，属性名作为变量名前缀，后缀为 `Mixin` ，然后生成 `ImportMixin` 语句：`import [属性名]Mixin from [值]`。

例如，对于下面这种 _options_ 配置：

```js
const options = {
  utils: "@/utils",
  libs: "@/libs"
}
```

生成的 `ImportMixin` 语句为：

```txt
import utilsMixin from "@/utils"
import libsMixin from "@/libs"
```

还需要记录一下名称 `importMixinNames = ["utilsMixin", "libsMixin"]`，后面还需要用到。

而 _custom_ 属性，要把它的值对象转成一个字符串，注意这一步不是调用 `JSON.stringify` 就可以了的。比如，对于下面这个：

```js
const custom = {
  props: {
    message: {
      type: String,
      default: "Hello World"
    }
  }
}

JSON.stringify(custom) // { "props": { "message": { "default" : "Hello World" } } }
```

> `JSON.stringify` 不能处理函数、`undefined`、`Symbol` 和 `RegExp`。

还好有第三方工具专门实现了这个功能：[serialize-javascript](https://www.npmjs.com/package/serialize-javascript)。不过它不支持值为原生构造函数类型的，像是，_Number_ ，_String_ ，_Array_ ，_Object_ 等等。并且还有 BUG，对于普通函数内部使用了箭头函数的，序列化后的结果就会有问题。

```js
const serialize = require("serialize-javascript")

const custom = {
  methods: {
    fn() {
      const f = () => {}
    }
  }
}

serialize(custom)
/** 序列化的结果
{
   "methods": {
       "fn": fn() {
           const f = () => {}
       }
   }
}
 */
```

翻了翻源码，关于是否是箭头函数的判断写得有点问题，源码是这样写的（省去了一些代码）：

```js
var IS_ARROW_FUNCTION = /.*?=>.*?/

function serializeFunc(fn) {
  var serializedFn = fn.toString()

  // arrow functions, example: arg1 => arg1+5
  if (IS_ARROW_FUNCTION.test(serializedFn)) {
    return serializedFn
  }
}
```

emm，这个正则，着实有点粗糙了哈。问了问 ChatGPT，这个正则该怎么写，它给的答案是下面这样：

```js
var IS_ARROW_FUNCTION = /^(\([\w\s,]*\)|[\w\s]*)\s*=>/
```

测了测，确实没啥问题，先把 node_modules 里的改成这样，等有空了提个 PR，看看会不会被合并 🤭。

> 仔细想想，_custom_ 里也不会写一些比较复杂的逻辑，如果很复杂，建议还是通过外部资源引入的方式。这样的话，原箭头函数的判断就已经满足了，不需要额外修改源代码。但是，写都写了，岂有不用的道理（拽）。

下面接着解决原生构造函数序列化的问题，原生构造函数调用 `toString()` 方法后，得到的都是下面这些值：

```js
const PropTypeStr = [
  "function String() { [native code] }",
  "function Number() { [native code] }",
  "function Boolean() { [native code] }",
  "function Array() { [native code] }",
  "function Object() { [native code] }",
  "function Date() { [native code] }",
  "function Function() { [native code] }",
  "function Symbol() { [native code] }"
]
```

也就意味着，如果当前值类型为 `Function`，并且调用 `toString()` 方法后的结果在上述的列表中，则说明当前函数为原生构造函数，需要特殊处理。如果是数组，并且数组里的每一项也满足这两个条件，则也需要特殊处理。主要针对的就是 _props_ 里的某个属性，可以设置多个 _type_ 的场景。

```js
const custom = {
  props: {
    prop1: {
      type: [String, Number],
      default: "Hello World"
    },
    prop2: {
      type: Object,
      default: () => ({})
    }
  }
}
```

下一步，如何特殊处理？

首先，特殊处理的这一步操作，要在序列化之前，从而保证整体能正常序列化。也即需要把原生构造函数转换成可被序列化的格式，简单点转成字符串就行。不过，这不是简简单单的字符串，需要做个标记，保证能由字符串还能转为原来构造函数的形式。

先用一些特殊标记把原生构造函数包裹起来。以上述的 _custom_ 为例，先转成下面这种格式：

```js
custom = {
  props: {
    prop1: {
      type: "__ConstructorFn([String, Number])",
      default: "Hello World"
    },
    prop2: {
      type: "__ConstructorFn(Object)",
      default: () => ({})
    }
  }
}
```

序列化后的结果如下：

```js
customStr = `{
  "props": {
    "prop1": {
      "type": "__ConstructorFn([String, Number])",
      "default": "Hello World"
    },
    "prop2": {
      "type": "__ConstructorFn(Object)",
      "default": () => ({})
    }
  }
}`
```

移除特殊标记，一个正则搞定：

```js
const removeConstructorFnTag = str => {
  return str.replace(/['"]__ConstructorFn\(([^)]+)\)['"]/g, "$1")
}

customStr = removeConstructorFnTag(customStr)
/**
{
  "props": {
    "prop1": {
      "type": [String, Number],
      "default": "Hello World"
    },
    "prop2": {
      "type": Object,
      "default": () => ({})
    }
  }
}
 */
```

生成 `customMixin` 语句：

```txt
const customMixin = {
  "props": {
    "prop1": {
      "type": [String, Number],
      "default": "Hello World"
    },
    "prop2": {
      "type": Object,
      "default": () => ({})
    }
  }
}
```

至此，得到了 `importMixin` 语句和 `customMixin` 语句，后续需要插入到 _Vue_ 的 `script` 标签内。

```txt
import utilsMixin from "@/utils"
import libsMixin from "@/libs"

const customMixin = {
  "props": {
    "prop1": {
      "type": [String, Number],
      "default": "Hello World"
    },
    "prop2": {
      "type": Object,
      "default": () => ({})
    }
  }
}
```

##### 2. 解析 script 标签

这里使用 `vue-template-compiler` 去解析 _Vue_ 文件。

```js
const compiler = require("vue-template-compiler")

const source = `<template>
  <p>{{ greeting }} World!</p>
</template>

<script>
export default {
  data () {
    return {
      greeting: "Hello"
    };
  }
};
</script>

<style scoped>
p {
  font-size: 2em;
  text-align: center;
}
</style>
`
const { script } = compiler.parseComponent(source)
// script 内容的开始和结束位置
const { start, end } = script
// script 标签里的内容
const scriptContent = script.content
```

其中，`source.slice(start, end) == scriptContent == script.content`。

##### 3. 生成新的代码

首先介绍一下 _Babel_ 三步走：`parse`、`traverse`、`generate`。

- `parse`：对应功能模块 `@babel/parser`，解析 _JavaScript_ 代码，并将其转换为 _AST_ （Abstract Syntax Tree）抽象语法树。

- `traverse`：对应功能模块 `@babel/traverse`，遍历 _AST_ 抽象语法树，并对其进行修改或分析。

- `generate`：对应功能模块 `@babel/generator`，将 _AST_ 抽象语法树转换为 _JavaScript_ 代码的字符串形式。

> 通俗点讲，假如说你有一个玩偶，电池没电了，需要更换电池。但是更换电池，需要用螺丝刀把它拆开，才能更换。而 `parse` 就相当于能把整个玩偶拆成各种零部件，你只需要把旧电池换成新电池（这一步就是 `traverse`），最后再交给 `generate` 重新组装成玩偶。不需要用螺丝刀拆开，然后再给合上了，简单了好多。如果你还想把玩偶的眼睛，由小黄灯换成小红灯，也是只需要把黄灯部件换成红灯部件即可，完全不需要自己动手拆。

先来看一段 _JS_ 代码生成 _AST_ 后的结果：

{% asset_img 1.png %}

`program.body` 是个数组，有两个 `ImportDeclaration` 类型的节点和一个 `ExportDefaultDeclaration` 类型的节点，分别对应两个 `import` 语句和一个 `export default` 语句。

比如，要清空所有 `import` 节点，就可以用下面的方式实现。

```js
const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default
const generate = require("@babel/generator").default

// scriptContent 来源于第二步生成的
// 因为是对 Vue 文件解析，需要配置 { sourceType: "module" }
// 如果代码里有用到 JSX 语法，需要配置 { plugins: ["jsx"] }
const scriptAst = parser.parse(scriptContent, { plugins: ["jsx"], sourceType: "module" })

traverse(scriptAst, {
  // 遍历 import 节点
  ImportDeclaration(path) {
    // path.node 是当前节点
    scriptAst.program.body = scriptAst.program.body.filter(node => node !== path.node)
  }
})

// 生成代码字符串
const newScript = generate(scriptAst).code
```

如果，再需要向 `mixins` 中注入新的内容呢。

先看一下 `mixins` 对应的 _AST_ 长啥样。

{% asset_img 2.png %}

`value.elements` 是个数组，数组的每个元素都是一个对象，里面存了关于 `mixins` 的值信息。照葫芦画瓢，如果需要新增一个 `customMixin`，就可以把这个 `elements` 数组改成：

```diff
elements = [
  {
    type: "Identifier",
    name: "TestMixin"
  },
+ {
+   type: "Identifier",
+   name: "customMixin"
+ }
]
```

具体实现代码如下：

```js
traverse(scriptAst, {
  // 遍历 export default 节点
  ExportDefaultDeclaration(path) {
    const properties = path.node.declaration.properties
    // 先找到 mixins 节点
    const mixins = properties.find(property => property.key.name === "mixins")
    const customMixin = {
      type: "Identifier",
      name: "customMixin"
    }
    // 插入 customMixin
    mixins.push(customMixin)
  }
})
```

回顾一下，在第一步中，我们拿到了 `importMixin` 和 `customMixin`，这两个需要添加到 `script` 标签里，`importMixinNames` 是需要注入的名称列表。第二步里，我们解析得到了 `script` 中的内容。刚才，我们又向 `mixins` 中插入了新的 `mixin`。有了这些后，我们就可以生成一份新的 _Vue_ 文件字符串。

```js
const compiler = require("vue-template-compiler")
const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default
const generate = require("@babel/generator").default

// source 来源于第二步提供的 Vue 文件字符串
const { script } = compiler.parseComponent(source)
const { start, end } = script
// 在原 script 的头部添加 importMixin 和 customMixin
const scriptContent = importMixin + "\n" + customMixin + "\n" + script.content
const scriptAst = parser.parse(scriptContent, { plugins: ["jsx"], sourceType: "module" })

traverse(scriptAst, {
  ImportDeclaration(path) {
    scriptAst.program.body = scriptAst.program.body.filter(node => node !== path.node)
  },
  ExportDefaultDeclaration(path) {
    const properties = path.node.declaration.properties
    const mixins = properties.find(property => property.key.name === "mixins")
    const newMixins = [...importMixinNames, "customMixin"].map(name => ({
      type: "Identifier",
      name
    }))
    mixins.push(...newMixins)
  }
})

const newScript = generate(scriptAst).code
// 使用新的 script 内容
const newContent = source.slice(0, start) + `\n${newScript}\n` + source.slice(end)
```

##### 4. 封装成 _Loader_

> _Loader_ 开发参考：
>
> - https://www.webpackjs.com/api/loaders
> - https://www.webpackjs.com/contribute/writing-a-loader

_Loader_ 其实就是一个函数，只不过大部分都写在一个单独的 _JS_ 文件里，然后默认导出。

```js
module.exports = function (source) {
  return source + "Hello World"
}
```

上面就是一个简单的 _Loader_ ，往文件内容里追加一个 `"Hello World"` 字符串。

除了在上一步中，生成新代码的逻辑之外，还需要 `loader-utils` 用来获取 _Loader_ 的 _options_ 。

```js
const { getOptions } = require("loader-utils")

module.exports = function (source) {
  const options = getOptions(this)
  // ... 解析 options，生产新代码 newSource
  return newSource
}
```

在配置文件中使用本地 _Loader_ 。

```js
// webpack.config.js
const path = require("path")
const VueMixinsLoader = path.resolve("plugins/VueMixinsLoader/index.js")

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          "vue-loader",
          {
            loader: VueMixinsLoader,
            options: {
              tools: resolve("./test/VueMixinsLoader/src/mixins/mixin.js"),
              tools2: resolve("./test/VueMixinsLoader/src/mixins/mixin2.js"),
              tools3: "@test/VueMixinsLoader/src/mixins/mixin3.js",
              custom: VueMixinsLoader.stringify({
                props: {
                  block: {
                    type: Object,
                    default: () => ({})
                  }
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

#### 细节部分

大致的实现思路就是上述内容，其实还有一些细节问题没有谈到，这里简单说一下：

- `importMixin` 和 `customMixin` 并没有直接插入在 `script` 的头部，而是都先转成 AST（`importMixinAST` 和 `customMixinAST`）。`importMixinAST` 插入在了源 _Vue_ 文件 `import` 语句的前面，`customMixinAST` 插入在了 `import` 语句的下面（为了保证代码风格，这是我最后的倔强）。
- 源 _Vue_ 组件里，可能会没有 `mixins` 这个配置项，需要生成一个 `mixins` 的 AST，然后插入到 `ExportDefaultDeclaration` 中。
- 使用 _webpack_ 打包时，如果使用了 `cache-loader` 会导致，修改 _options_ 后，重新打包，配置不会生效。需要关闭 `cache-loader`，并开启 `cache: false`，确保每次打包配置都能生效。

从确定要开发这个 _Loader_ 到功能完善，差不多弄了两天半的时间，写这篇文章写了两天，emm。

{% asset_img 4.png %}

当我兴致勃勃准备发布到 npm 社区的时候，发现 `vue-mixin-loader` 这个名字被人占用了，emm。于是就改成了 `vue-mixins-loader`，突然发现这个名字更符合，好巧不巧，嘻嘻嘻。

总体来看，结果还蛮不错的，又可以往简历里写新花样了 🤭！

> GitHub 仓库：https://github.com/showlotus/vue-mixins-loader
