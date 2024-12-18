---
title: Turboui i18n 的心路历程
tags:
mathjax: false
date: 2023-09-01 23:44:44
categories:
---

![Alt text](image.png)

历经一个月，从无到有，第一次尝试开发一个 _VS Code_ 插件，迭代了 9 个版本，是时候完结撒花啦 🎉🎉。

萌生这个想法是在一次新任务的开发中：要对代码中的某些提示类的字段进行整改，加上国际化配置。当时就敏锐地发现了一个问题：改成国际化配置后，对后期的开发以及维护很不友好。于是就开始想，有什么手段可以缓解这一痛点？

最开始的想法是，通过对原有的国际化调用方法 `$t` 写一个类型扩展去实现。对第三方库写一个类型扩展其实是可行的，不过这里卡在了 `$t` 的原始类型有些复杂，导致扩展起来很麻烦。很难实现既想保留原类型，又想扩展，结果就给 _PASS_ 掉了。我的理想效果是，基于整个项目下的 `.json` 配置文件，去生成一个 `type.d.ts` 类型文件，基于 _VS Code_ 提供的类型提示功能，在每个调用的地方，当鼠标悬浮时，就能看到对应国际化文本了。类型文件的生成肯定是需要脚步的，而且每当 `.json` 文件变化时，就要重新去生成类型文件，可能就是这一点不好。而且，项目开发者又太多，不太好保持一致性。多一个文件，就是多一个负担。

接下来，重新思考。要做的这个工具，尽可能不需要开发人员有太多操作，给了就能直接用，而且简单上手。于是，那就开发一个 _VS Code_ 插件吧。在不久之前，我就一直有一个计划，开发一个 _VS Code_ 插件（自定义代码行背景色），一直不知道从何搞起，这次刚好可以拿这个试试水。

首先，插件的展示形式，借鉴了 _UnoCSS_ ：在内置的类名下显示一个下划虚线。鼠标滑入时的提示内容，就以键值对的形式展示，而且配置文件的内容是啥就展示啥。大致目标有了，然后就开始初代版本的开发。

每天下班回去写一点，日常在公司摸鱼的时候再写点，遇见不会的知识点，就问 _ChatGPT_ 和查官方文档，就这样捯饬了 5 天，初代版本问世了。还记得那天是周五，下午我还臭美地往群里扔了一张截图，然后同事说，好东西，拿来用用。我说，下周一发布。先吊波胃口，嘿嘿 😁。

等到周一，如愿发布。同事用了用后，提了一个建议，想要一个点击跳转的功能，想了想确实不错，安排！然后又是潜心开发的一周，同样又是周一发布，同事都好奇，我哪来的时间。另一个同事说我，既没女朋友，也没猫，可不就这样。我就笑笑不说话 🫢。

接下来，就是在工作群里推广。推广的那天，会时不时点到插件首页看，当前下载量是多少。看了几回，来来回回就 20 人不到，也就没咋关注了。直到，有一天领域的前端组组长找我，问我可不可以做一次分享，给大家讲一下这个插件是如何开发出来的，还给我说，这个插件很不错，到时候可以推到平台上，写在他们的官方文档里。我听完，还挺高兴滴，就答应了。分享那天，讲完了之后，果然下载量多了一点。事后，一个同事找我，给我提了一个问题，自己试了试，果然复现了，是个 _BUG_ ，然后就立马修复。后面一段时间，就一直在加点小优化，有时间就做一点。然后有一天，群里一个老哥，开始推广我的插件，那天下载量突增，破百啦 🎉🎉🎉。事后又迭代了一个版本，加上了自己心心念的快捷提示功能。

看到自己做的东西，能被好多人用，还是很开心滴，这就是身为程序员的快乐吧。一个月的更新迭代，从无到有，也蛮快的。这一路下来，感想最深的就是：眼界很重要。首先你得知道这东西能不能做，然后才能去做。而软件，互联网上开源知识一大堆，只要想学，没有学不会的。如果热爱，那就坚持吧，做你所想，不负热爱！
