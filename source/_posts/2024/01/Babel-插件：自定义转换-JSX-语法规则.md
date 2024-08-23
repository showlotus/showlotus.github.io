---
title: Babel 插件：自定义转换 JSX 语法规则
tags:
  - Babel
  - AST
  - Webpack
mathjax: false
date: 2024-01-13 19:00:50
categories:
---

去年九月份的时候，由于平台框架升级，要求各个产品都要升级，相当于要把之前的代码全部用新框架的语法重构一遍，于是就开启了 2.0 框架升级的工作。升级后的语法如下：

```js
export default function useForm() {
  return {
    props: {},
    slots: {
      default: [
        {
          props: {},
          slots: {
            label: {
              props: {
                label: "xxx"
              }
            },
            default: {
              component: "Input",
              props: {
                clearable: true
              },
              events: {
                focus() {},
                blur() {}
              }
            }
          }
        }
      ]
    }
  }
}
```

如果你有过 _Vue_ 开发经验的话，可能感觉到很熟悉，这怎么和 `render` 函数的写法有些许相似，令人熟悉的 `props` 和`slots`。不过，当时看到这种结构的第一眼就在想，平台这样搞的目的：为了能在平台侧更加方便地处理各种数据。这样看，平台确实是方便了，但对于实际开发者来说，冗余的对象结构导致一个组件文件的代码过长，代码结构难以阅读，而且后面还要面临代码重复率过高的问题。

同样地，_Vue_ 中的 `render` 函数也有类似的问题，虽然足够灵活，但开发者的代码阅读负担直线上升。于是 _Vue_ 就提供了 _JSX_ 语法，作为 `render` 函数的第二种选择。毫无疑问，这种类似 _XML_ 的扩展语法对于前端开发人员来说，能快速地了解到整个代码结构，降低阅读难度。于是，在当时就有了一个想法，能不能写一个插件把 _JSX_ 语法转为目标的对象数据结构？想法有了，那就开干！

由于需要的对象结构和 _Vue_ 中的组件属性有些相似，于是就参考了 [babel-plugin-jsx](https://github.com/vuejs/babel-plugin-jsx)，以它为模版，fork 了一个代码仓后，就开始进行改造。改造还算顺利，一个周末其实就已经完成了整体功能了，实际编码时间大约有二十个小时左右，后续的几天修修 BUG。最后的效果如下（[在线体验地址](https://showlotus.github.io/babel-plugin-jsx/website)）：

![website](website.png)

最初的打算是开发一个 _Webpack Loader_ 出来，因为我们用的打包工具也支持 _Webpack_ 的配置，后来发现使用 _Babel Loader_ + _Options_ 就可以了，完全不需要开发一个 _Loader_ 出来。为了支持 `TSX` ，还需要使用插件 `@babel/plugin-transform-typescript` 对 `TSX` 语法进行转换，去除类型代码。最后的 _Webpack_ 配置如下：

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jsx|tsx)$/i,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: [
                [
                  "@showlotus/babel-plugin-jsx",
                  {
                    isReactiveRoot: true,
                    librarySource: "vue"
                  }
                ],
                // 解析 tsx 时，需要额外引入插件 @babel/plugin-transform-typescript
                ["@babel/plugin-transform-typescript", { isTSX: true, allExtensions: true }]
              ]
            }
          }
        ]
      }
    ]
  }
}
```

开发完毕，发布到 npm 社区，插件名：[@showlotus/babel-plugin-jsx](https://www.npmjs.com/package/@showlotus/babel-plugin-jsx)，源码：[babel-plugin-jsx](https://github.com/showlotus/babel-plugin-jsx)。

最后，就是经典的推广环节。首先是，发给我们领域的架构师，然后果然不出所料，他没搭理我。然后，发给平台一位我经常提 BUG 单的老哥，他也没搭理我。最后，发给我们领域的前端组长，他搭理我了，然后说：想法不错，但是出现的时机太晚了，现在大家的代码都几乎定型了，如果想要别人去改，那是需要风险和成本的。这个我也能理解，只是我是想让平台能不能接纳这个插件，为开发人员提供另一个种选择，可以选择用原先的方式去开发，或者采用这种 `JSX` 的风格进行开发。随后，他又拉来一位老哥，说他之前做的什么什么，怎么怎么样，有多厉害，但是平台就是给否定了，有多可惜怎么着。

顺便提一嘴，这位老哥之前干了啥。升级新模版后，为了降低代码重复率，他和另外几个同事，研究出一种面向对象的结构写法，对组件做了各种封装。大致代码风格如下：

```js
export default function useForm() {
  return {
    props: {},
    slots: {
      default: [
        FormItem.generateInput("xxx")
          .setProps({ clearable: true })
          .setEvents({
            focus() {},
            blur() {}
          })
      ]
    }
  }
}
```

讲实话，我真没觉得这种方式能降低多少代码重复率（于是，在升级模版的时候，我就没用这种方法），相比之前那种复杂但清晰的代码逻辑，这种倒是提高阅读难度了。我的不满：最初的那种结构，导致重复率过高的主要原因是，一个对象类型的结构，模版已经固定死了，也就说明每个对象必然都是那些属性，而这种写法通过某个 _api_ 实现，相较于之前的某个属性，没啥本质区别（而且，每个属性的设置，都新增了一个 _api_ ，比如有个 `label` 属性，就新增一个 `setLabel` 方法，啊这...），这是首要；其次，原先的结构是有层级结构的，虽然代码可能过长，但是能让人一目了然。但是，这种封装后的结构，把组件的结构给破环了，特别是在面临不同的代码风格，不同的缩进和换行规则时，这个问题就被放大了，总让人感觉代码不整洁。

随后，这两人就开始对我的这个插件进行 “混合双打”，首先，说这个插件大概率不被架构师那边接受，这个倒还好，不接受就不接受呗。然后张口就来：可能会有性能问题。我当时就不自在了，心想：你都没问这个插件怎么用的，咋就有性能问题了，张口闭口就来呀？我现在严重怀疑他的能力！！！突然感觉到了人与人之间的差距 😓。

自从在去年五月换了新工作后，虽然说工资涨了点。但是总感觉工作不是很快乐，有点不尽人意，感觉和周围的人相处不到一块去。虽说大家都是搞技术的，但是没看到那种对技术有追求的，平时聊天的话题也几乎和技术无关，感觉缺一个和自己臭味相投的人。之前的工作就很好，和周围同事有说有笑，遇到技术问题就一起探讨交流，自己做的东西也能被大家采纳，并且还给出大量时间让我去做，然后他们兜底，十分怀念那段时光。不知道目前这份工作我能坚持多久，再给自己一年时间叭，如果一年内在这里找不到自己想要的，或者工作还是这样丝毫让自己提不起任何兴趣，那就下一家叭。

身为一名程序员，技术是立人之本，在一个行业深耕十年，成为专家 💪。

身为一位青年人，在而立之年之前，做些自己喜欢做的事，不负韶华 🎉。
