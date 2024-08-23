# hexo 指南

## 常用命令

### 新建文章

```shell
hexo new [类型] [文章名]
```

### 本地浏览器预览

```shell
hexo server
# 简写 hexo s
```

携带 `--draft` 参数，预览草稿状态下的文章

```shell
hexo s --draft
```

### 发布草稿

原理：将文章从 `source/_drafts` 移动到 `source/_posts` 下

```shell
hexo p [文章名]
```

## 插件

### 文章保存后，自动刷新页面

```shell
npm i hexo-browsersync -D
```

### 插入数学表达式

[Hexo Filter MathJax](https://github.com/next-theme/hexo-filter-mathjax)
