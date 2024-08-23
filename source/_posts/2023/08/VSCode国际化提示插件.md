---
title: Turboui i18n：一个国际化提示插件
categories:
  - 日常
  - 每周一篇
tags:
  - VS-Code-插件
mathjax: false
date: 2023-08-14 23:00:00
---

> 前段时间，项目在做国际化整改，即要把之前显示中文的地方，换成根据当前用户所选语言，展示成对应的文字。项目里也有用到国际化的插件，只需要把配置文件写好（当语言为中文时，展示什么文字；当语言为英语时，展示什么文字），放在 `i18n` 目录下，然后调用插件提供的方法，剩下的就无需操心啦。

{% asset_img use-demo.png %}

> 整改的过程中，也发现了一个问题：比如，有一个提示语场景，之前代码里直接写的是：`"当前未选择数据，请选择"`，而现在变成了：`$t("noDataPleaseChoose")`。如果做个比较：哪种方式比较直观，肯定前者更加一目了然。这种还算好点，如果当前文字配置的国际化 `key` 和文字的实际内容不是很匹配，很难一眼看出这是什么意思。绝大数场景，还是需要在配置文件里搜当前的 `key` 对应的实际内容，这就导致了时间上的浪费，翻来覆去地找国际化字段，太哈人啦！（顺便吐槽一下，因为刚来没多久，接手这个项目的时候，好多表格列上的字段，连一个注释都没有，开发的时候，只能先搜国际化的字段代表啥意思，不然都不知道哪个是哪个 😓）于是乎，就有了一个想法：<font style="border-bottom: 1px dashed">给当前国际化字段加一个提示，让开发人员能快捷地知道这个字段代表什么意思，不需要再浪费精力去搜索了</font>。想法 💡 有了，开搞！！！

#### 实现思路

1. 以 _VS Code_ 当前打开的项目文件夹为根目录，然后在当前文件夹下搜索，获取 `i18n` 文件夹下的所有 `.json` 文件。这一步是为了记录所有的国际化字段，以及各自对应的语言文本，相当于是数据源；
2. 拿到数据源后，然后就是对当前打开的文件中的关键词进行检索，找到所有匹配到的代码块；
3. 给匹配到的代码块添加一个特殊样式（下划线）以及鼠标悬浮时弹出一个提示框，提示框的内容来自于数据源；

#### 项目搭建

关于如何搭建一个 _VS Code_ 插件的开发项目，可以参考官网的文档：[Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)，讲的很详细。如果想要实现某个功能，不知道应该用哪个 _API_ ，可以先用 _ChatGPT_ 搜解决方案，然后它会给出用哪些 _API_ 。可以用它给的示例代码，运行试试效果。如果它给的代码示例有问题，那就找 [官方文档](https://code.visualstudio.com/api/references/vscode-api) 里对应 _API_ 的介绍，基本上就能实现功能了。

#### 获取配置文件

这里需要用到 `vscode.workspace` 提供的一些方法和属性。

- `workspaceFolders`：当前打开的工作区目录。
- `fs`：文件系统模块，用于操作文件，例如常见的读写操作。

_VS Code_ 提供的 `fs` 模块不同于 `Node JS` 中的 `fs`。这里的 `fs` 调用方法时，传入的文件路径必须使用 `vscode.Uri.file()` 对路径进行转换，否则就会报错。当然也可以用其他第三方的文件插件，例如 [fs-extra](https://www.npmjs.com/package/fs-extra)（倍受好评）。这里为了尽可能降低插件包的大小，选择了 _VS Code_ 内置的 `fs` ，如果后续有功能复杂的场景，用 `fs-extra` 准没错，用了都说好。代码如下：

```ts
// 引入属性和方法
const { workspaceFolders, fs } = vscode.workspace

// 获取当前工作区文件夹
const currentFolder = workspaceFolders[0].uri

// 文件夹路径
const folderPath = currentFolder.path

// 读取 JSON 文件，这是异步的！！！
getJSON(folderPath)

function getJSON(folder: string, isTargetDir = false) {
  // 存放 .json 文件的目录名
  const dirName = "i18n"
  // 读取当前目录下的内容
  fs.readDirectory(vscode.Uri.file(folder)).then(files => {
    // files 为当前目录下的内容，有文件夹，也有目录
    files.forEach(file => {
      const [fileName, fileType] = file
      // 如果当前是文件夹
      if (fileType === vscode.FileType.Directory) {
        // 再次读取文件夹里的内容
        getJSON(`${folder}/${fileName}`, fileName === dirName)
      } else if (isTargetDir && fileName.endsWith(".json")) {
        // 当前文件夹所在目录为 i18n 且，文件是 .json 格式的文件
        const filePath = `${folder}/${fileName}`
        // 读取文件内容
        fs.readFile(vscode.Uri.file(filePath)).then(content => {
          // 获取到对应的 JSON 文件内容
          const jsonContent = Buffer.from(content).toString()

          /* TODO 记录 JSON 文件内容 */
        })
      }
    })
  })
}
```

#### 检索关键词

上一步，已经得到了所有的 `.json` 配置文件，也即，对于任意一个文件，就能知道当前文件下，哪些字段是已配置的国际化字段了。

而这一步，需要检索当前聚焦文件下的国际化字段，并且需要在<font style="border-bottom: 1px dashed">每打开一个新文件</font>或者<font style="border-bottom: 1px dashed">修改当前文件内容时</font>，都要进行一次检索。确保内容更改后，下一步的 “注入样式” 能实时生效。

上述的两个事件可以在 _API_ 中找到，分别对应下面两个：

- `vscode.window.onDidChangeActiveTextEditor`：当活动编辑器发生更改时触发的事件。
- `vscode.workspace.onDidChangeTextDocument`：当文本文档被更改时触发的事件。

首先，需要得到当前打开文件的整个文档内容，而 `vscode.window.activeTextEditor` 即为当前打开的活动编辑器对象。可以通过这个对象获去当前文件的内容，也可以通过这个对象给当前文档注入一些样式。代码如下：

```ts
// jsonContent 为上一步获取到的 JSON 文件内容
// 先把格式转为对象类型，方便后续处理
const jsonObj = JSON.parse(jsonContent)

// 获取当前活动编辑器
const editor = vscode.window.activeTextEditor
// 获取文档对象
const document = editor.document
// 获取文档内容
const text = document.getText()

// 遍历每个字段，key 对应的就是每个国际化字段
Object.keys(jsonObj).forEach(key => {
  // 生成一个正则表达式
  // 因为使用的时候，一定是以字符串的形式，所以需要兼容三种不同的字符串格式：'（单引号）、"（双引号）、`（反引号）
  const regex = new RegExp(`(["'\`])${key}\\1`, "g")
  let match
  // 使用正则提供的 exec 方法不断去匹配文档内容
  // 只有每次匹配到后，才会进入到 while 循环，运行内部的代码逻辑
  while ((match = regex.exec(text))) {
    // 记录字段的开始位置，加 1 是为了不计入前引号
    const startPos = document.positionAt(match.index + 1)
    // 记录字段的结束位置，减 1 是为了不计入后引号
    const endPos = document.positionAt(match.index + match[0].length - 1)

    /* TODO 注入样式 */
  }
})
```

#### 注入样式

上一步，得到了所有国际化字段的开始位置和结束位置，接下来就可以对开始位置到结束位置之间的代码块注入一些特殊样式，可以通过 `vscode.TextEditor.setDecorations` 实现。这个方法有俩参数，第一个参数是自定义的样式，第二个参数是范围，可以有多个，同时可以通过 `hoverMessage` 属性设置鼠标移入时的提示内容。

首先，怎么加一个下划线？

第一步，要通过 `vscode.window.createTextEditorDecorationType` 去生成一个样式，需要传入一个配置，这个配置就是常见的 _CSS_ 属性，截个图给大伙看一眼：

{% asset_img options.png %}

如果还想要更加灵活一点的样式，可以通过 `textDecoration` 属性去实现，这里可以直接写 _CSS_ 代码。不过需要注意一点，它只会对第一个分号后的内容生效，有些诡异，不过问题不大，写的时候注意一下就行。

因为想要给代码块加个下划线，同时下划线颜色与当前代码块颜色保持一致，那么就可以通过下面的方式去创建样式：

```ts
const customDecoration = vscode.window.createTextEditorDecorationType({
  // border 如果不指定颜色，会继承当前文本颜色
  textDecoration: ";border-bottom: 1px dashed;"
})
```

然后就是通过 `hoverMessage` 添加提示框内容，这个提示可以有多个，就比如经常在代码里能看到这种提示：

{% asset_img hoverMessage.png %}

每个块都是一个单独的 `hoverMessage`，由不同的插件生成。而且提示的内容可以写成 _Markdown_ 格式，通过 `vscode.MarkdownString` 生成，这里想要实现下面这种效果：

> `zh-CN`：早上好
>
> `en-US`：Good morning

使用 `vscode.MarkdownString` 实现就是下面这个样子：

```ts
const zh = "`zh-CN`：早上好"
const en = "`en-US`：Good morning"
// 加俩换行符，显得没那么挤，好看点 ~
const str = new vscode.MarkdownString(zh + "\n\n" + en)
```

汇总后，补充到上一步的 “检索关键词” 中：

```ts
// 收集所有代码块待注入的样式
const decorations: vscode.DecorationOptions[] = []
Object.keys(jsonObj).forEach(key => {
  const regex = new RegExp(`(["'\`])${key}\\1`, "g")
  let match
  while ((match = regex.exec(text))) {
    const startPos = document.positionAt(match.index + 1)
    const endPos = document.positionAt(match.index + match[0].length - 1)

    // 生成代码块范围
    const range = new vscode.Range(startPos, endPos)
    // 生成提示内容
    const zh = "`zh-CN`：" + jsonObj[key]["zh-CN"]
    const en = "`en-US`：" + jsonObj[key]["en-US"]
    const hoverMessage = new vscode.MarkdownString(zh + "\n\n" + en)
    // 收集样式
    decorations.push({ range, hoverMessage })
  }
})

// 生成下划线样式
const customDecoration = vscode.window.createTextEditorDecorationType({
  // border 如果不指定颜色，会继承当前文本颜色
  textDecoration: ";border-bottom: 1px dashed;"
})

// 注入样式
editor.setDecorations(customDecoration, decorations)
```

> 这里可能会有一个美中不足的小问题，就是会将代码里一些与国际化字段相同的字符串也注入样式，可能会有一点点影响，不过还在可接受范围内。如果后续有空，可以研究研究怎么判断当前是目标方法的调用，感觉有搞头。

#### 点击文本跳转

实际使用过程中，同事提了一个优化意见。他想要对某个国际化字段的文本进行更改，还是需要全局搜索才能定位到配置文件的位置。问我，能不能加个点击跳转的功能。想了想，确实不错，可以搞！

实现的目标效果就是：点击提示框中的某个国际化文本，打开当前国际化字段对应的配置文件，同时跳转到字段所在的行，并把光标移动到对应文本的位置。有点类似 _VS Code_ 中，按下 `Ctrl + 鼠标左键`，点击某一个方法或者变量时，会跳转到对应的位置，现在要手动实现这个功能。

在第一步读取 `.json` 配置文件时，已经拿到了所有的数据源，需要在这一步里记录一下，每个字段对应的文件路径，以便于后续使用。记录信息倒是很简单，难点就在于如何实现跳转？

跳转，很容易想到用一个超链接，这当然是可以的。不过，需要在打开文件后，再移动光标位置。大致思路就是：在打开文件后，延时获取当前活动编辑器，然后再查找字段的位置，移动光标就可以了。emm，感觉有点不优雅，延时执行不知道延时多少毫秒才算合适，万一有时候卡顿了，多多少少有点隐患。

好在，_VS Code_ 提供了一种链接命令 [Command URIs](https://code.visualstudio.com/api/extension-guides/command#command-uris)，可以在一个 _Markdown_ 文本内添加一个链接命令，点击链接会触发命令，而且还能传参数，完美契合需求，Nice！代码如下：

```ts
// 注册命令
const commandName = "openTokenRange"
vscode.commands.registerCommand(commandName, (params: any) => {
  // TODO 打开文件，移动光标
})

/* 生成链接命令 */
// 先将参数对象转为 JSON 串类型
const params = JSON.stringify({ a: 1, b: 2 })
// 再使用 encodeURIComponent 转义
const query = encodeURIComponent(params)
// 写法类似 Markdown 中的超链接，只不过圆括号中的内容改了改
// 命令都要加 command: 的前缀
// 如果有参数，需要用一个 ? 将命令和参数分隔开
const str = `[link](command:${commandName}?${query})`
const content = new vscode.MarkdownString(str)
// 这一步很重要，不然链接不会生效，不可点击
content.isTrusted = true
```

现在已经能得到待打开的文件路径和对应的文本内容，接下来就是将光标跳转到文本开始位置处。代码如下：

```ts
/* 移动光标 */
// 文件路径
const filePath = "./xx/xx/x.json"
// 文本内容
const key = "xxx"

const { window, workspace } = vscode
// 路径转为 VS Code 能识别的格式，然后打开对应的文件
const document = await workspace.openTextDocument(vscode.Uri.file(filePath))
// 获取文件内容
const text = document.getText()
// 在文件内搜索 key 的位置
// 因为是 JSON 格式的文件，一定是用双引号包裹
// 加 1 是为了获取 key 前的位置
const position = text.indexOf(`"${key}"`) + 1
// 生成索引对应的位置信息
const documentPosition = document.positionAt(position)
// 生成一个范围，起始位置和结束位置相同，就只有光标，不需要选中内容
const range = new vscode.Range(documentPosition, documentPosition)
// 当文档被打开后，设置光标位置
await window.showTextDocument(document, {
  selection: range
})
// 将选中的内容滚动到编辑器可视区域
// 因为未选中任何内容，也就是将光标挪到可视区域
window.activeTextEditor?.revealRange(range)
```

#### 其他

主要功能逻辑代码就上面那些，而真正实现的时候，远不止这些。比如：

- 什么时候激活插件；
- 在哪些文件里可以使用；
- 需要提供哪些配置项，便于用户自定义；
- 绑定的事件，要合理取消绑定等。

如果对源码感兴趣，可以看这里 👉 [Turboui-i18n](https://github.com/showlotus/Turboui-i18n)。如果你也想开发一个插件，希望对你有些启发 😊。
