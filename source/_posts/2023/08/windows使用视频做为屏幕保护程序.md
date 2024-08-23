---
title: Windows 使用视频做为屏幕保护程序
tags:
  - Windows
  - screensaver
mathjax: false
date: 2023-08-25 00:37:29
categories:
---

最近在搭建 Mac 环境，然后翻到一个屏幕保护程序：[Brooklyn](https://github.com/pedrommcarrasco/Brooklyn/tree/master)，用 18 年苹果征集的各种 logo 做为屏幕保护程序，看起来十分好看，于是乎就整了一个。

{% asset_img mac-logo.gif %}

平时在家用 Mac，公司电脑是 Windows，最近打算把公司电脑加点 Mac 的特色。比如：字体。字体比较好改，可以用一个工具：[noMeiryoUI](https://github.com/Tatsu-syo/noMeiryoUI)，直接把系统字体都统一改了，贼方便。

而最近新入坑的屏幕保护程序，就想着能不能把这个也搬到 Windows 上。然后，就开始网上搜解决方案，甚至一度打算自己手搓一个。好在经过一番搜索后，发现了一个工具：[Aerial](https://github.com/OrangeJedi/Aerial/)。这个工具会将 AppleTV 拍的一些高清视频用作屏幕保护程序，当然也支持自定义视频，重点是 “自定义” 这个很关键！

在 [Releases](https://github.com/OrangeJedi/Aerial/releases) 页面找到这个，点击就能下载。

{% asset_img aerial-releases.png %}

下载完后，把下载后的文件挪到 `C:\Windows\SysWOW64` 目录下，然后右键点击【安装】。

{% asset_img aerial-install.png %}

安装完后，会打开一个配置面板。配置还挺多的，可以自己摸索摸索。

{% asset_img aerial-multi-screen.png %}

默认会去加载内部提供的视频，这里把它们都取消勾选。不然，自定义的视频可能显示不出来。

{% asset_img aerial-deselect.png %}

[点击这里](https://github.com/pedrommcarrasco/Brooklyn/blob/master/Brooklyn/Resources/Animations/original.mp4) 下载 logo 动画视频（翻人家仓库代码，突然翻出来一个视频，哈哈～），下载完成后，建议把这个视频单独放在一个文件夹下。

然后回到 Aerial 的配置面板，在 _Custom Videos_ 一栏，添加视频文件的文件夹，选中刚才下载视频所在的文件夹。

{% asset_img aerial-custom-video.png %}

配置里会自动检测出视频文件。然后点击右上角的 _Preview_ ，可以看下效果。

{% asset_img aerial-preview.png %}

如果后续还想更改配置，可以在 Windows 的 _开始_ 处，搜索 “屏幕保护程序”，然后再进行配置。

{% asset_img aerial-update-config.png %}

配置完后，搭配公司两个 27 寸的显示屏，简直不要太好看啦！！！
