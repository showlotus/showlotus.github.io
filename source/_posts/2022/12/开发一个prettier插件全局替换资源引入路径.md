---
title: 开发一个 Prettier 插件：全局替换资源引入路径 <W15>
categories:
  - [日常]
  - [每周一篇]
tags:
  - AST
  - Prettier
  - Babel
mathjax: false
date: 2022-12-10 14:35:46
---

{% asset_img banner.jpg %}

> 最近在迁移项目，对于一些资源的引用路径，需要换成一个新的路径。还好之前都把资源引用的方式，改成以 `@/..` 别名引入的方式，替换起来还算简单。先把新旧路径列出来，然后用 _VSCode_ 的全局替换，因为就只有三种，_CV_ 三次就好了。这种方法，在当时我认为是比较好的了，其实也有打算整个什么脚本啥的，但不知道从何做起。直到当天晚些时候，看到了神光大佬最新发布的一篇文章：[写一个同事见了会打你的 Prettier 插件](https://mp.weixin.qq.com/s/w1ms6ltvPTU5Hes6o7AJYQ)。直接对我醍醐灌顶，这不就是我想要的工具嘛！于是就打算写一个 _prettier_ 插件，统一格式化路径，想法有了，开干！

{% asset_img result.gif %}

> 最终的效果如上，点击保存后，自动将 `path` 进行替换。

对于一段普通的 `import` 代码，转成 `AST` 后，是下面这样：

{% asset_img 1.png %}

`import` 中的 `path` 对应的就是每个 `ImportDeclaration` 节点中的 `source.value`。

只需要把每个节点中的 `source.value` 按照指定的替换规则给替换一遍，然后再用替换后的 `AST` 去生成代码，这样就大功告成了。是不是很简单？完整的 `preprocess` 如下：

```js
function myPreprocessor(code, options) {
  const ast = parser.parse(code, {
    plugins: ["jsx"],
    sourceType: "module"
  })
  const importNodes = []

  traverse(ast, {
    ImportDeclaration(path) {
      importNodes.push(clone(path.node))
      path.remove()
    }
  })

  // 写入自定义替换规则，用一个二维数组记录
  // 数组第一项为匹配规则，第二项为替换后的路径
  const rules = [
    ["^@/packages/mixins/", "@/mixins/"],
    ["^@/libs/assist", "@/utils/assist"],
    ["^@/views/editor/editor-props", "@/utils/editor-props"]
  ]

  rules.forEach(rule => {
    rule[0] = new RegExp(`${rule[0]}`)
  })

  importNodes.forEach((node, i) => {
    for (const [rule, t] of rules) {
      const value = node.source.value
      if (value.match(rule)) {
        node.source.value = value.replace(rule, t)
        break
      }
    }
  })

  const newAST = types.file({
    type: "Program",
    body: importNodes
  })

  const newCode = generate(newAST).code + "\n" + generate(ast, { retainLines: true }).code

  return newCode
}
```

看看效果如何。

{% asset_img 2.gif %}

咦~ 不对劲啊！怎么把 _17_ 行的注释，又重新生成了一次 😦。排查了一下，貌似是因为 `newAST` 中最后一个 `ImportDeclaration` 节点中有一个 `trailingComments` 节点（即 `// this is test`），而 `ast` 中第一个 `FunctionDeclaration` 节点的 `leadingComments` 中同样也有这个注释节点，导致就生成了两次，那么把最后一个 `ImportDeclaration` 节点中的 `trailingComments` 清空是不是就行了？先试一下。

```js
importNodes.forEach((node, i) => {
  for (const [rule, t] of rules) {
    const value = node.source.value
    if (value.match(rule)) {
      node.source.value = value.replace(rule, t)
      break
    }
  }

  // 清空最后一个 import 节点的 trailingComments
  if (i === importNodes.length - 1) {
    node.trailingComments = null
  }
})
```

{% asset_img 3.gif %}

看样子，没啥问题。不妨再看一个例子。

{% asset_img 4.gif %}

这次又把 `import` 代码间的注释重新生成了一份。(⊙﹏⊙) 总不能去比较每个注释节点，看看是否有相同的，然后再去重吧 🤡。转念一想，可以去看看 `prettier-plugin-sort-imports` 的源码啊，看看人家怎么处理的。_Get ~_

源码是用 _TS_ 写的，虽然没写过 _TS_ ，但是大致思路还是能看懂的，吭吭哧哧也算看明白了个大概。总体下来，处理思路大致是这样的：

1. 先从 `importNodes` 中获取所有注释节点 `allCommentsFromImports`。
2. 然后从源代码片段中，移除 `importNodes` 与 `allCommentsFromImports`，得到一份干净的源代码 `codeWithoutImportsAndInterpreter`。
3. 最后，用 `importNodes` 生成的 `AST` 重新生成的代码 + `codeWithoutImportsAndInterpreter`。

大致思路有了，又从 `prettier-plugin-sort-imports` 那里借鉴了两个方法：`getAllCommentsFromNodes`（获取 `importNodes` 中的所有注释）、`removeNodesFromOriginalCode`（从源代码片段中移除某些节点）。

完整的 `preprocess` 如下：

```js
function myPreprocessor(code, options) {
  const ast = parser.parse(code, {
    plugins: ["jsx"],
    sourceType: "module"
  })

  const importNodes = []
  traverse(ast, {
    ImportDeclaration(path) {
      importNodes.push(clone(path.node))
    }
  })

  const rules = [
    ["^@/packages/mixins/", "@/mixins/"],
    ["^@/libs/assist", "@/utils/assist"],
    ["^@/views/editor/editor-props", "@/utils/editor-props"]
  ]
  rules.forEach(rule => {
    rule[0] = new RegExp(`${rule[0]}`)
  })

  importNodes.forEach((node, i) => {
    for (const [rule, t] of rules) {
      const value = node.source.value
      if (value.match(rule)) {
        node.source.value = value.replace(rule, t)
        break
      }
    }

    if (i === importNodes.length - 1) {
      node.trailingComments = null
    }
  })

  const newAST = types.file({
    type: "Program",
    body: importNodes
  })

  const allCommentsFromImports = getAllCommentsFromNodes(importNodes)

  const nodesToRemoveFromCode = [...importNodes, ...allCommentsFromImports]
  const codeWithoutImportsAndInterpreter = removeNodesFromOriginalCode(code, nodesToRemoveFromCode)

  const newCode = generate(newAST).code + codeWithoutImportsAndInterpreter
  return newCode
}
```

再来看看效果如何。完美！

{% asset_img 5.gif %}

最后，为了让它看起来更像一个插件，我把路径替换规则挪到了 `prettier` 的配置中：

```js
// .prettierrc.js
const myPlugin = require("./plugins/index")

module.exports = {
  tabWidth: 2,
  arrowParens: "avoid",
  singleQuote: true,
  semi: true,
  trailingComma: "none",
  pathReplaceRules: ["^@/packages/mixins/", "@/mixins/", "^@/libs/assist", "@/utils/assist", "^@/views/editor/editor-props", "@/utils/editor-props"],
  plugins: [myPlugin]
}
```

同时需要在插件中，添加自定义的配置项，不然 _prettier_ 会忽略这个配置。

```js
// plugin/index.js
module.exports = {
  parsers: {
    babel: {
      ...babelParsers.babel,
      preprocess: myPreprocessor
    }
  },
  options: {
    pathReplaceRules: {
      type: "path",
      array: true,
      category: "Global",
      default: [{ value: [[]] }],
      description: "Provide an rule to replace imports."
    }
  }
}
```

在 _prettier_ 官方文档里翻了好久，也没找到如何将配置配成一个二维数组的形式，貌似只能是一维字符串数组的形式。不过，好在可以把配置数组按每两个进行分块，格式化成下面这样：

```js
const rules = [
  ["^@/packages/mixins/", "@/mixins/"],
  ["^@/libs/assist", "@/utils/assist"],
  ["^@/views/editor/editor-props", "@/utils/editor-props"]
]
```

一个简单的算法题：《数组分块》 😁

```js
function arrayChunk(arr, size) {
  return arr.reduce(
    (res, curr) => {
      if (res[res.length - 1].length < size) {
        res[res.length - 1].push(curr)
      } else {
        res.push([curr])
      }
      return res
    },
    [[]]
  )
}
```

虽然看起来很怪，但是整体还是不错的，使用后，开发效率咔咔往上升！😜
