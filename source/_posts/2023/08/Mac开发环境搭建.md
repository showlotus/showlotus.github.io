---
title: Mac 开发环境搭建（持续更新中～）
categories:
tags:
  - Mac
  - 环境搭建
mathjax: false
date: 2023-11-20 24:41:35
---

### 2023/11/20

#### 安装 IDEA

- 下载地址：https://macapp.org.cn/app/intellij-idea.html
- 激活码：

  ```txt
  ZCB571FZHV-eyJsaWNlbnNlSWQiOiJaQ0I1NzFGWkhWIiwibGljZW5zZWVOYW1lIjoiZnV6emVzIGFsbHkiLCJhc3NpZ25lZU5hbWUiOiIiLCJhc3NpZ25lZUVtYWlsIjoiIiwibGljZW5zZVJlc3RyaWN0aW9uIjoiIiwiY2hlY2tDb25jdXJyZW50VXNlIjpmYWxzZSwicHJvZHVjdHMiOlt7ImNvZGUiOiJQREIiLCJmYWxsYmFja0RhdGUiOiIyMDIzLTA3LTAxIiwicGFpZFVwVG8iOiIyMDIzLTA3LTAxIiwiZXh0ZW5kZWQiOnRydWV9LHsiY29kZSI6IlBTSSIsImZhbGxiYWNrRGF0ZSI6IjIwMjMtMDctMDEiLCJwYWlkVXBUbyI6IjIwMjMtMDctMDEiLCJleHRlbmRlZCI6dHJ1ZX0seyJjb2RlIjoiUFBDIiwiZmFsbGJhY2tEYXRlIjoiMjAyMy0wNy0wMSIsInBhaWRVcFRvIjoiMjAyMy0wNy0wMSIsImV4dGVuZGVkIjp0cnVlfSx7ImNvZGUiOiJQQ1dNUCIsImZhbGxiYWNrRGF0ZSI6IjIwMjMtMDctMDEiLCJwYWlkVXBUbyI6IjIwMjMtMDctMDEiLCJleHRlbmRlZCI6dHJ1ZX0seyJjb2RlIjoiUFBTIiwiZmFsbGJhY2tEYXRlIjoiMjAyMy0wNy0wMSIsInBhaWRVcFRvIjoiMjAyMy0wNy0wMSIsImV4dGVuZGVkIjp0cnVlfSx7ImNvZGUiOiJQUkIiLCJmYWxsYmFja0RhdGUiOiIyMDIzLTA3LTAxIiwicGFpZFVwVG8iOiIyMDIzLTA3LTAxIiwiZXh0ZW5kZWQiOnRydWV9LHsiY29kZSI6IklJIiwiZmFsbGJhY2tEYXRlIjoiMjAyMy0wNy0wMSIsInBhaWRVcFRvIjoiMjAyMy0wNy0wMSIsImV4dGVuZGVkIjpmYWxzZX0seyJjb2RlIjoiUEdPIiwiZmFsbGJhY2tEYXRlIjoiMjAyMy0wNy0wMSIsInBhaWRVcFRvIjoiMjAyMy0wNy0wMSIsImV4dGVuZGVkIjp0cnVlfSx7ImNvZGUiOiJQU1ciLCJmYWxsYmFja0RhdGUiOiIyMDIzLTA3LTAxIiwicGFpZFVwVG8iOiIyMDIzLTA3LTAxIiwiZXh0ZW5kZWQiOnRy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
  ```

#### 如何安装已损坏的软件

https://zhuanlan.zhihu.com/p/135948430

### 2023/10/25

#### 录制 Gif：[Gifox](https://gifox.app/)

强烈推荐，录制的贼清晰！

### 2023/08/27

#### 使用 Alt + Tab 切换应用：[AltTab](https://alt-tab-macos.netlify.app/)

![AltTab](alt-tab.png)

#### 实用工具网站推荐

- https://appstorrent.ru/
- https://www.macat.vip/
- https://www.better365.cn/
- https://macapp.org.cn/app/

### 2023/08/21

#### 任务栏养小猫：[Run Cat](https://apps.apple.com/us/app/runcat/id1429033973?mt=12)

{% asset_img run-cat.gif %}

#### 屏幕保护：[Brooklyn](https://github.com/pedrommcarrasco/Brooklyn#manual-hand)

苹果的各种 LOGO 动画

{% asset_img mac-logo.gif 400 %}

#### 格式化磁盘：[DiskGenius](https://www.diskgenius.cn/download.php)

### 2023/08/18

#### Mac 使用手册

- 快捷键：https://support.apple.com/zh-cn/HT201236
- 触摸板手势：https://support.apple.com/zh-cn/HT204895

#### 安装 `brew`

```shell
/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
```

#### 终端配置

- 安装 `iTerm2`：https://iterm2.com/
- `oh-my-zsh`：

  - 安装

    - 方式一：

      ```shell
      sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

      # 国内镜像
      sh -c "$(curl -fsSL https://gitee.com/mirrors/oh-my-zsh/raw/master/tools/install.sh)"
      ```

    - 方式二：

      从 [GitHub](https://github.com/ohmyzsh/ohmyzsh/) 克隆，然后进入到 `tools` 目录下执行下面的命令：

      ```shell
      sh install.sh
      ```

  - 主题

    可选主题：https://github.com/ohmyzsh/ohmyzsh/wiki/Themes

    切换主题：

    1. 打开配置文件

       ```shell
       vim ~/.zshrc
       ```

    2. 更改为对应的主题名

       ```shell
       ZSH_THEME="robbyrussell"
       ```

    3. 保存并退出

       ```shell
       :wq
       ```

  - 安装 [powerlevel10k](https://github.com/romkatv/powerlevel10k#oh-my-zsh)，[下载字体](https://github.com/romkatv/powerlevel10k#manual-font-installation)。如果重新配置，输入 `p10k configure`。

    贴一下配置后的 `iTerm2` 的样子：

    {% asset_img terminal.png %}

- 语法高亮：[zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting/blob/master/INSTALL.md#oh-my-zsh)

- 命令补全提示：[zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#oh-my-zsh)

#### NodeJS

- 安装

  ```shell
  brew install node
  ```

- 安装版本切换工具 `n`

  - 安装

    ```shell
    npm i n -g
    ```

  - 使用

    - 安装指定版本，版本号不带 `v` 前缀

      ```shell
      n [版本号]
      ```

      如果安装报错没权限，使用 `sudo` 命令

      ```shell
      sudo n [版本号]
      ```

      如果安装版本超时，使用阿里镜像（贼快～）

      ```shell
      sudo NODE_MIRROR=http://npm.taobao.org/mirrors/node n [版本号]
      ```

    - 切换版本

      ```shell
      n
      ```

      然后出现一个界面，按照提示操作即可

#### Git

- 安装

  ```shell
  brew install git
  ```

- 打开 `.gitconfig` 文件

  ```shell
  open ~/.gitconfig
  ```

- 全局忽略 `.DS_Store`

  新建全局忽略配置文件 `.gitignore_global`

  ```shell
  touch ~/.gitignore_global
  ```

  写入内容

  ```shell
  .DS_Store
  **/.DS_Store
  .DS_Store?
  ```

  全局配置

  ```shell
  git config --global core.excludesfile ~/.gitignore_global
  ```

  删除仓库已有的 `.DS_Store` 文件

  ```shell
  find . -name .DS_Store -print0 | xargs -0 git rm -f --ignore-unmatch
  ```

- 显示隐藏文件快捷键：`⌘ + Shift + .`

- 生成 SSH

  - 打开终端执行下方命令：

    ```shell
    ssh-keygen -t rsa -C "xxx@qq.com"
    ```

    紧接着会出现提示，默认创建在 `/Users/xxx/.ssh/id_rsa` 路径下，然后输入两次密码

    ```shell
    Generating public/private rsa key pair.
    Enter file in which to save the key (/Users/xxx/.ssh/id_rsa):
    Created directory '/Users/xxx/.ssh'.
    Enter passphrase (empty for no passphrase):
    Enter same passphrase again:
    ```

  - 打开 `.ssh/id_rsa.pub` 文件

    ```shell
    cat .ssh/id_rsa.pub
    ```

    复制内容，然后再在 `GitHub` -> `Settings` -> `SSH and GPG keys` 里新建 `SSH key`。

  - 验证

    ```shell
    ssh -T git@github.com
    ```

    出现下面的内容，则表示连接成功。

    ```shell
    Hi xxx! You've successfully authenticated, but GitHub does not provide shell access.
    ```
