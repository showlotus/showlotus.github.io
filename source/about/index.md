---
title: 关于﹒showlotus
layout: about
---

#### 工作经历

- <div style="display: flex; justify-content: space-between"><span>华为技术有限公司</span> <span>2023/05 - now</span></div>

  - 解决卡片资源因内存泄漏导致页面卡顿的问题，并优化了页面逻辑，缩短了交互的响应时间，提升用户体验。
  - 为内部 UI 框架 AUI 搭建了一个 Playground 在线预览网站，支持切换不同的版本，方便演示和分享代码。
  - 开发了一个 Vue 插件（vue2-sub-app），支持将所有 Vue2 组件定义成一个子根，并通过 $subRoot 属性暴露给后代组件，以及在当前子根的后代组件中使用。<< TODO
  - 开发了一个 Webpack 插件（code-inspector-plugin），扩展内部框架，可以在页面上通过快捷键+鼠标快速定位到当前组件的源代码。
  - 开发了一个 Babel 插件，扩展内部框架 LinkJS 支持 jsx 语法，提升代码可读性，并降低约一半的代码量。
  - 开发了一个 VS Code 插件（Ti18n），便携地提示国际化字段，并可以快速定位到源文件，提升开发体验。
  <p>

- <div style="display: flex; justify-content: space-between"><span>中电信数智科技有限公司</span> <span>2021/07 - 2023/04</span></div>

  - 参与公司产品比翼研发云平台的开发建设工作；
  - 负责组内低代码编程模块的开发，需求方案的设计，以及后续迭代和维护工作；
  - 使用 Prettier + ESLint 制定组内代码规范以及 Git Commit 规范，推行组内执行和遵守；
  - 基于使用的 UI 库，二次封装了多个通用组件和常用工具函数，提高了日常开发效率；
  - 开发了一个周报模板生成工具，富文本转 Word 文档，并搭配邮件服务可以直接发送周报邮件。

#### 专业技能

- 熟悉 W3C 标准与 ES6 规范，有良好的代码风格和编码习惯；
- 熟练掌握 HTML、CSS/LESS/SCSS、JavaScript 等前端技术；
- 熟悉 Vue（v2.x） 以及底层原理，熟练使用 Vue CLI 开发 Vue 项目，以及开发自定义业务组件和二次封装组件；
- 熟练使用常用的前端组件库，如 ElementUI、ViewDesign、ECharts 等；
- 了解 Prettier/ESLint 基本配置、代码规范化和 Git Commit 规范；
- 了解 Node.js，能编写提高日常开发效率的脚本；
- 了解常用设计模式及常用数据结构和算法。

#### 项目经历

- 低代码大屏

  - 通过组件拖拉拽的形式，快速构建一个数据可视化大屏，支持数据集绑定和以链接的形式分享出去；
  - 开发物料组件，对当前使用 UI 库组件进行自定义扩展，以及定制化开发各种 ECharts 图表组件；
  - 将物料组件与项目解耦，将所有项目内组件都统一归纳到组件库中，通过远程加载的方式，动态引入组件；
  - 提供了一套规范的组件开发模板，方便用户自主开发组件。将用户提供的组件，扩充到已有的组件库列表中，丰富组件库；
  - 开发了一个 Prettier 插件，用以格式化资源引入路径，解决了项目迁移后，资源路径需要手动替换的问题；
  - 基于 ViewDesign 实现主题换肤，在官方不支持动态主题的前提下，将主题色相关值统一替换成 CSS 变量的格式，以实现动态主题切换。
  <p>

- 大屏组件开发工具

  - 为了方便大屏物料组件的开发，自己开发了一个集生成组件 JSX、新增组件的代码生成测试和预览大屏下载代码的一个工具；
  - 通过表单可视化配置的方式快捷生成 JSX 文件，结合组件设计文档可以迅速生成组件配置文件；
  - 用 Node.JS 编写脚本，实现 Vue 格式文件与 FreeMarker 格式文件之间的相互转换，降低了新语言的学习成本，提升了开发效率；
  - 通过脚本实现了，从远端下载 zip 包，并解压到指定目录，有效地缩短了下载代码的测试时间。
  <p>

- 流程表单引擎

  - 通过表单设计器搭建一个表单，可以发起流程审批，多人同步当前流程进度并且可查看、审批和驳回；
  - 基于开源表单设计器组件，二次封装，以满足业务需求；
  - 获取当前用户信息，默认为流程发起人，自动填充到表单中；
  - 表单设计器添加移动端预览界面，同时支持移动端表单样式适配。

#### 教育经历

<p style="display: flex; justify-content: space-between"><span>河南大学﹒软件学院﹒软件工程﹒本科</span> <span>2017/09 - 2021/06</span></p>

#### 其他方面

- 喜欢独立钻研处理问题，专注度较高，工作效率高；
- 平时喜欢专研前端技术，关注最新的前端技术领域，看技术博客，逛开源社区，捯饬自己的开源插件；
- 写过不少类型的插件，包括但不限于：Vue、Webpack、Prettier、Babel、VS Code、Tampermonkey 等；
- 个人网站上会有日常博客分享，技术书刊阅读笔记以及平时一些有趣的想法；
- 爱好：听音乐，看书，散步，打羽毛球。
