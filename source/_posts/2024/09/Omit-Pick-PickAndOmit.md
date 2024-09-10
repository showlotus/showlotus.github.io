---
title: Omit | Pick | PickAndOmit
tags:
  - TypeScript
mathjax: false
date: 2024-09-10 18:43:58
categories:
---

最新在开发功能的时候需要用到 _lodash_ 中类似 `pick` 和 `omit` 的功能，但是只是用到这两个小功能，实在不想把这个库也下载下来，于是就自己实现了一下。而且既然都用到 _TypeScript_ 了，那就完善一下类型叭。本来想着参考 _lodash_ 里类型是如何实现的，结果发现源代码里虽然是用 _TypeScript_ 写的，但是类型是一点都没写，只能自己琢磨了。最后的版本如下：

<details open>
<summary>ts</summary>

```ts
export function omit<T extends Record<string, any>, U extends (keyof T)[]>(
  obj: T,
  ...keys: U
): Omit<T, U[number]> {
  return Object.keys(obj).reduce((res: any, key) => {
    if (!keys.includes(key)) {
      res[key] = obj[key]
    }
    return res
  }, {})
}

export function pick<T extends Record<string, any>, U extends (keyof T)[]>(
  obj: T,
  ...keys: U
): Pick<T, U[number]> {
  return Object.keys(obj).reduce((res: any, key) => {
    if (keys.includes(key)) {
      res[key] = obj[key]
    }
    return res
  }, {})
}
```

以及 `pick` 和 `omit` 的结合版方法 `pickAndOmit` :

<details open>
<summary>ts</summary>

```ts
export function pickAndOmit<
  T extends Record<string, any>,
  U extends (keyof T)[]
>(obj: T, ...keys: U) {
  return [pick(obj, ...keys), omit(obj, ...keys)] as const
}
```
