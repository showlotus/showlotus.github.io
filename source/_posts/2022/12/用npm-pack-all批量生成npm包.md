---
title: 用 npm-pack-all 批量生成 .tgz 文件 <W14>
categories:
  - [日常]
  - [每周一篇]
tags:
  - npm
  - tgz
  - node
mathjax: false
date: 2022-12-03 23:41:22
---

{% asset_img banner.jpg %}

> 最近，组内的一位同学咨询我：能不能离线下载 npm 包，我的回答是：据我所知，应该不行。然后他发来一个链接，说是按照这个操作，最后一步报错。emm，又涨知识了。点开大概看了看，用到了 `npm-pack-all` 这个工具，可以将 `node_modules` 中的依赖生成一份 `.tgz` 文件，再使用 `npm install` 安装这个 `.tgz` 文件就好了。感觉挺有意思，不过如果一步一步生成，就显得太呆了，立马就想到了，可以搭配脚本批量生成，同时还可以再重新 `npm install`。想法有了，开干！

#### 功能设计

对可提供的参数配置，简单设计了一下。（有点简陋，哈哈）

{% asset_img design.png %}

为了不污染原项目，打算在原项目的基础上，复制一份新的项目出来，放在同级目录下。

用到的插件如下：

- [commander](https://www.npmjs.com/package/commander)：用来获取命令行参数。

- [fs-extra](https://www.npmjs.com/package/fs-extra)：用来对文件进行操作，比 _node_ 的原生 `fs` 更好用，兼容性也更好。

- [shelljs](https://www.npmjs.com/package/shelljs)：用于执行命令行命令，后面需要重新 `npm install`。

- [npm-pack-all](https://www.npmjs.com/package/npm-pack-all)：主要插件，没了它就没这个家了。

#### 项目搭建

新建一个文件夹，然后执行 `npm init -y` 快速生成一个 `package.json` 文件。

如果想用自定义的命令去执行，需要在 `package.json` 中配置 `bin` 字段。

```json
// package.json
{
  "bin": {
    "npa-cli": "index.js"
  }
}
```

这里配置了一个自定义的命令 `npa-cli`，后面对应的是一个要执行脚本文件的文件路径，这里的是同级目录下的 `index.js`。

{% asset_img 1.png %}

与此同时，还需要在执行文件的头部添加 `#!/usr/bin/env node`。关于这个，官方是这样解释的：

> 请确保您在 `bin` 中引用的文件以 `#!/usr/bin/env node` 开头，否则脚本将在没有 _node_ 可执行文件的情况下启动！[详细介绍，戳这里~](https://www.npmjs.cn/files/package.json/#bin)

也就是，当前脚本的执行依赖于 _node_ 环境。这一点毋庸置疑，没有 _node_ 环境，房子都要塌。

{% asset_img 2.png %}

添加完自定义命令 `npa-cli` 后，在当前目录下，能使用这个执行脚本。但是，如果想在别的文件夹下，执行这个命令，会抛出一个 _Error_ ：

{% asset_img 3.png %}

只有在当前项目下安装了这个依赖，或者全局安装后，才能使用依赖对应的命令。但是，目前只是在开发阶段，如何安装呢？

还好，`npm` 提供了一个 `npm link` 命令。关于这个命令，官方是这样介绍的：

> 包文件夹中的 `npm link` 将在全局文件夹 `{prefix}/lib/node_modules/<package>` 中创建一个符号链接，该符号链接链接到执行 `npm link` 命令的包。[详细介绍，戳这里~](https://www.npmjs.cn/cli/link/#%E8%AF%A6%E6%83%85)

{% asset_img 4.png %}

执行完后，就能正常使用 `npa-cli` 命令了。

#### 流程设计

大致分为了 5 个步骤：

{% asset_img 5.png %}

##### 1. 根据传入的参数，从 `package.json` 中获取对应的依赖列表。

```json
{
  "name": "npm-test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "dayjs": "^1.11.6",
    "figlet": "^1.5.2",
    "fs-extra": "^10.1.0",
    "npm-pack-all": "^1.12.7",
    "ora": "^5.4.1",
    "shelljs": "^0.8.5"
  },
  "devDependencies": {
    "less": "^4.1.3"
  }
}
```

比如，对于上面这个 `package.json`：

- `npa-cli -a` 获取到的依赖列表：`dayjs, figlet, fs-extra, npm-pack-all, ora, shelljs, less`，也即 `dependencies` 与 `devDependencies` 中依赖的汇总。

- `npa-cli -p` 获取到的依赖列表：`dayjs, figlet, fs-extra, npm-pack-all, ora, shelljs`，也即只有 `dependencies` 中的依赖。

- `npa-cli -d` 获取到的依赖列表： `less`，也即只有 `devDependencies` 中的依赖。

```js
/**
 * 通过 package.json 获取项目中的依赖
 * @param {string} dir 当前执行目录
 * @param {string} mode 生成模式
 * @returns {string[]} 依赖名数组
 */
module.exports.parsePackagejson = function (dir, mode = "a") {
  if (!ops[mode]) {
    mode = "a"
  }
  const dependencies = ops[mode]()
  const packageJson = require(path.join(dir, "/package.json"))
  const modules = dependencies
    .map(key => Object.keys(packageJson[key] || {}))
    .flat()
  return modules
}
```

##### 2. 创建新的文件夹

在当前项目的同级目录下，新建一个 `[当前文件夹名]-toNpa` 的文件夹。可以通过 `process.cwd()` 获取到当前脚本的执行目录。

```js
/**
 * 创建新的文件夹
 * @returns {string} 新的文件夹名称
 */
module.exports.createNewDir = function (dir) {
  const currDir = dir.match(/[\w-]+$/)[0]
  const newDir = `${currDir}-toNpa`
  const newDirPath = path.join(dir, `../${newDir}`)
  fs.ensureDirSync(newDirPath)
  console.log(`create ${newDir} successfully.`)
  return [newDir, newDirPath]
}
```

##### 3. 将依赖生成 .tgz 文件后，输出到新文件夹中

得力于 `npm-pack-all` 提供了一个 `--output` 的参数，可以指定 `.tgz` 文件的输出目录。不过需要注意，有些依赖可能在 `node_modules` 中深层目录下，比如依赖 `@babel/eslint-parser`，实际路径是 `node_modules/@babel/eslint-parser`，在指定 `--output` 时，需要再往外层目录切换一级。

```js
/**
 * 生成 .tgz 文件
 * @param {string[]} modules 依赖名数组
 * @param {string} dir 输出的目录名
 */
module.exports.genTGZ = function (modules, dir, deps = false) {
  const baseDepth = 2
  for (let i = 0; i < modules.length; i++) {
    const depth = modules[i].split("/").length
    shell.cd(`./node_modules/${modules[i]}`)
    shell.exec(
      `npm-pack-all ${deps ? "--dev-deps" : ""} --output ${"../".repeat(
        baseDepth + depth
      )}${dir}`,
      {
        silent: true,
        async: false
      }
    )
    console.log(`[${i + 1} / ${modules.length}] ${modules[i]} has packaged.`)
    shell.cd("../".repeat(baseDepth + depth - 1))
  }
  const files = fs.readdirSync(`../${dir}`)
  const tgzFiles = files.filter(file => file.match(/\.tgz$/))
  return tgzFiles
}
```

##### 4. 复制项目中的文件到新文件夹中

这一步，除了 `node_modules` 目录外，其他都需要复制一份。

```js
/**
 * 将当前文件夹下的文件都复制到目标目录中，除了 node_modules
 * @param {string} src 源目录
 * @param {string} dest 目标目录
 */
module.exports.copyFile2NewDir = function (src, dest) {
  fs.copySync(src, dest, {
    filter(src, dest) {
      if (src.indexOf("node_modules") > -1) {
        return false
      }
      return true
    }
  })
  console.log(`The project file was successfully copied.`)
}
```

##### 5. 在新文件夹下，执行 `npm install`

对于项目中的 `.tgz` 文件，需要执行 `npm install [依赖-版本号].tgz` 重新安装项目中的依赖。

```js
/**
 * 重新执行 npm install，更新 package.json
 * @param {string[]} modules 依赖名数组
 * @param {string} dir 目录
 */
module.exports.updatePackage = function (modules, dir) {
  shell.cd(`../${dir}`)
  console.log("Re-execute npm install...")
  shell.exec(`npm install ${modules.join(" ")}`, { silent: false })
}
```

执行完后，会更新 `package.json` 与 `package-lock.json`，将依赖的资源路径改为本地的 `.tgz` 文件。

```json
{
  "name": "npm-test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "dayjs": "file:dayjs-1.11.6.tgz",
    "figlet": "file:figlet-1.5.2.tgz",
    "fs-extra": "file:fs-extra-10.1.0.tgz",
    "nanoid": "file:nanoid-4.0.0.tgz",
    "npm-pack-all": "file:npm-pack-all-1.12.7.tgz",
    "ora": "file:ora-5.4.1.tgz",
    "shelljs": "file:shelljs-0.8.5.tgz"
  },
  "devDependencies": {
    "less": "file:less-4.1.3.tgz"
  }
}
```

#### 最后

这个插件已发布到 `npm` 社区，名为 [npa-cli](https://www.npmjs.com/package/npa-cli) ，欢迎使用 🤭。
