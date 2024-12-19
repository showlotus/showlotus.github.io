---
title: Rollup 打包 Vue 项目
tags:
  - Rollup
  - Vue
mathjax: false
date: 2024-12-19 15:27:18
categories:
---

用 Rollup 打包一个 Vue 项目所需的配置。

## package.json

所需依赖：

```json
{
  "name": "rollup-build-vue",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "rollup -c"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@babel/preset-env": "^7.26.0",
    "@rollup/plugin-babel": "^6.0.4",
    "@rollup/plugin-commonjs": "^28.0.2",
    "@rollup/plugin-image": "^3.0.3",
    "@rollup/plugin-node-resolve": "^16.0.0",
    "@rollup/plugin-replace": "^6.0.2",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-url": "^8.0.2",
    "rollup": "^4.28.1",
    "rollup-plugin-postcss": "^4.0.2",
    "rollup-plugin-progress": "^1.1.2",
    "rollup-plugin-vue": "^6.0.0"
  }
}
```

## index.js

入口文件：

```js
import Vue from 'vue'

if (typeof window !== 'undefined' && window.Vue) {
  /*  */
}
```

## rollup.config.mjs

打包配置：

```js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import image from '@rollup/plugin-image'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import url from '@rollup/plugin-url'

import vue from 'rollup-plugin-vue'
import postcss from 'rollup-plugin-postcss'
import progress from 'rollup-plugin-progress'

export default {
  input: './index.js',
  output: {
    file: 'public/dist.js',
    format: 'umd'
  },
  plugins: [
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env']
    }),
    image(),
    resolve(),
    terser(),
    vue(),
    postcss(),
    url(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    progress({
      clearLine: true
    })
  ],
  external: ['vue']
}
```
