---
title: Windows 终端美化 + 使用 Code 命令用 VSCode 打开文件夹
date: 2022-07-18 12:38:23
tags:
  - Dev-Tools
categories:
  - [日常]
---

<img alt="布满奇石的青海岛，日本北长门海岸国定公园" src="https://bing.com/th?id=OHR.OmijimaIsland_ZH-CN3328515301_UHD.jpg" loading="lazy" />

#### 在终端使用 `Code` 命令

垂涎 Mac 的终端，能直接用 `Code .` 然后在 VSCode 中打开当前文件夹，作为一个 Windows 的开发者羡慕不已。直到前几天，在网上冲浪，发现了某个视频博主在 Windows 下，居然能也能用 `Code .` 命令，于是顺藤摸瓜，找到了下面这个（[链接指路](https://code.visualstudio.com/docs/setup/windows)）：

{% asset_img 1.png %}

点击标注的那个下载链接，然后傻瓜式安装即可。安装完毕后，就能在终端中使用 `Code .` 命令，用 VSCode 打开文件夹了。

#### 美化 PowerShell

为了方便后续的操作，先去 Windows 商店下载一个 Windows Terminal。

{% asset_img 2.png %}

接下来开始操作：

##### 安装 [on-my-posh](https://ohmyposh.dev/docs/installation/windows)

在终端中执行安装命令。

```shell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

然后在终端中，执行下面的命令，如果有彩色的字体出现，则证明安装成功了。

```shell
oh-my-posh init pwsh | Invoke-Expression
```

##### 安装字体

`on-my-posh` 有提供一些字体，如果不使用这些特定的字体，终端就会出现乱码的情况（[字体指路](https://github.com/ryanoasis/nerd-fonts#patched-fonts)）。

{% asset_img 5.png %}

选一款下载完压缩包，解压后，全选，右键，安装。

##### 设置终端字体

打开终端设置面板。

> 小知识：在命令行一栏，在命令的最后添加 `-nologo` 后缀，这样每次打开终端就没有 “可恶” 的凭证信息了。

{% asset_img 6.png %}

言归正传，点开外观一栏。

{% asset_img 7.png %}

设置刚才下载的字体，如果没加载出来，记得重启终端。设置完之后，记得保存。

{% asset_img 8.png %}

##### 查看所有主题

```shell
Get-PoshThemes
```

最后，会有个提示，告诉我们怎么设置其他主题。

{% asset_img 3.png %}

<font color="red">红下划线</font>标注的路径：设置终端主题的配置文件，如果没有，按照这个路径创建就行。
<font color="blue">蓝下划线</font>标注的命令：设置当前终端的主题，不过只是临时的，重新打开新的终端就会失效。永久设置主题就需要把这段命令粘贴在刚刚新建的配置文件里。

{% asset_img 4.png %}

<font color="red">红下划线</font>标注的，也即当前的主题，可根据自己喜好切换即可。（[官网主题大全](https://ohmyposh.dev/docs/themes)）。

##### VSCode 配置

在 VSCode 里还需设置终端的配置（下面是我的配置）：

{% asset_img 9.png %}

然后，在 VSCode 里打开一个终端就能看到炫酷的主题啦！
