---
title: 如何在NPM上发布一个自己的插件库
date: 2021-12-13 13:07:02
tags:
  - Vue
  - npm
categories:
  - [日常]
---

![暮色中的面包山和老城区，厄瓜多尔基多](https://cn.bing.com/th?id=OHR.ElPanecilloHill_ZH-CN0527709139_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp)

### 1. 一个 `npm` 的账号

没有的直接去官网注册即可。[快捷入口](https://www.npmjs.com/login)

{% asset_img 1.jpg %}

####

{% asset_img 2.jpg %}

####

记住填写的 `Username` 和 `Password`，后续发布的时候需要用到（不会有人记不住吧 🤡，不会吧，不会吧...）。

### 2. 一个 `package.json` 文件

新建一个文件夹，然后在终端中打开，执行 `npm init`，设置基本配置。（这些后续都可以更改，若想直接跳过，可直接执行 `npm init -y` )

> 关于这个 `package.json` 文件，你是否想到了每个 Vue 项目都有一个，是否能直接用，答案当然是：肯定的。我就是直接用一个 Vue 项目来作为插件的开发版，然后在导出的时候做些处理。我的理解是：一个 Vue 的 `npm` 插件，就是一个又一个的 <i>单文件组件</i>，只不过是通过 `npm install` 的方式，将其放在了 `node_modules` 目录下，然后通过正常的 Vue 组件引入方式来引入到项目中。

### 3. 一个用来放 `插件` 的文件夹

在 Vue 项目的 `src` 目录下新建一个 `plugins` 文件夹，这里用来存放要导出的组件。到这一步，其实就能将这个插件发布了，然后通过正常的组件引入方式，就能在项目中正常使用了。不过，这样显得不够高级，接下来来点高级的。

### 4. 一个可以批量导出组件的 `JS` 文件

- 直接在 `src` 目录下，新建一个 `index.js` 文件，用以批量导出，代码如下：

  ```js
  const plugins = require.context(
    "./plugins" /* 文件目录 */,
    true /* 是否检索子目录 */,
    /.vue$/ /* 匹配文件的正则表达式 */
  )

  let allComponents = {}
  plugins.keys().forEach(c => {
    const name = c.match(/\w+/)[0]
    const component = plugins(c)
    component.install = function (Vue, options) {
      Vue.component(name, component.default)
    }
    allComponents[name] = component
  })

  const install = function (Vue, ops = {}) {
    for (let [name, component] of Object.entries(allComponents)) {
      Vue.component(name, component.default)
    }
  }

  export default {
    install,
    ...allComponents
  }
  ```

  > **require.context**：用以批量引入一个目录下的某类型的文件（三个参数如代码中注释写的那样）。得到的 `plugins` 是一个特殊类型，它的 `.keys()` 方法返回一个目录下相匹配文件的 `相对路径`，（如，<i>plugins</i> 目录下的 `test.vue`，对应的就是 `./test.vue`），可以从相对路径中取出组件的名称。而 `plugins([相对路径])` 返回的就是对应相对路径的组件，即 `plugins('./test.vue') === test.vue`。

  > **install**：每个 `Vue` 插件，都会有的一个内置方法。当使用 `Vue.use([componentName])` 时，会自动调用内置 `install` 方法。这一步是将所有的插件都挂载一个 `install` 方法，以便通过 `Vue.use()` 的方式引入，而不是一昧地用 `import [componentName] from '...'`。这里最后导出的时候，还有一个 `install` 方法，这一步是为了将所有的组件全部引入，也即：最后仅通过 `import Plugin from 'pluginName'` + `Vue.use(Plugin)`，就能将 <i>plugins</i> 目录下的插件全部引入到 Vue 项目中。

> 注：参考了 `ElementUI 和 IviewUI` 的 `index.js`，发现他们都是通过 `import` 的方式一个一个导入和导出，只有在全部导出时，才用到 集体`install` 的形式，而且每个 `Vue` 组件的同级目录下都有一个 `.js` 用以将该 `Vue` 组件导出，猜测这些可能是为了兼容性考虑，暂时只能想到这么多 😓。

### 5. 发布

1. 发布前，最重要的一步就是：配置 `package.json` 的 `"main": "./src/index.js"`(如果不配置，在 Vue 的 main.js 中使用 `import Plugin from 'pluginName'` 会提示找不到依赖)。

   ```json
   {
     ...
     "main": "./src/index.js"
   }

   ```

2. 配置 `.npmignore`，将不需要发布的文件给忽略掉，和 `.gitignore` 同理。

3. 切换当前 `npm` 的镜像源为 `https://registry.npmjs.org/`（否则，下一步的登录会出错）。

4. 在终端中执行 `npm adduser` >> `npm login` ，输入开头牢记的 `Username` 和 `Password`（你不会忘了吧 🤡）。

5. 最后，执行 `npm publish`（如果没报错，那恭喜你，发布成功了！）。

> `taobao` 镜像源每隔一段时间会向 `npm` 进行同步，也可以自己去官网查看 [->here](https://npmmirror.com/)，同步成功后，用 `taobao` 镜像源就也能下载自己发布的插件啦。
