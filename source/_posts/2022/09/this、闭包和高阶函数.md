---
title: this、闭包和高阶函数 <W4>
tags:
  - JavaScript
  - JavaScript-设计模式与开发实践
categories:
  - [笔记]
  - [日常]
  - [每周一篇]
mathjax: false
date: 2022-09-24 13:20:41
---

{% asset_img banner.jpg %}

> 这周没遇到什么比较有意思的地方，就拿这篇读书笔记凑数吧，写了也挺久的了，从 9.11 开始写，9.24 才结束，太能拖啦~

## _this_

_this_ 的指向大致分为四种：

### 作为对象的方法调用

当函数作为对象的方法调用时，_this_ 指向该对象。

```js
const obj = {
  name: "Tom",
  getName() {
    console.log(this.name)
  }
}

obj.getName() // "Tom"
```

### 作为普通函数调用

当函数作为普通函数被调用时，此时的 _this_ 总指向全局对象。在浏览器中全局对象是 _window_ ，在 _Nodejs_ 中全局对象是 _globalThis_ 。

```js
window.name = "globalName"
const obj = {
  name: "Tom",
  getName() {
    console.log(this.name)
  }
}

const getName = obj.getName
getName() // "globalName"
```

如果在方法内部调用一个函数，_this_ 也是指向全局对象。

```js
window.name = "globalName"
const obj = {
  name: "Tom"
}

obj.getName = function () {
  function callback() {
    console.log(this.name)
  }

  callback()
}

obj.getName() // "globalName"
```

如果想让内部函数的 _this_ 指向该对象，需要设置一个当前 _this_ 的引用。

```js
window.name = "globalName"
const obj = {
  name: "Tom"
}

obj.getName = function () {
  const _this = this
  function callback() {
    console.log(_this.name)
  }

  callback()
}

obj.getName() // "Tom"
```

或者使用箭头函数定义内部函数，因为箭头函数没有自己的 _this_ ，_this_ 由函数定义时的上下文决定。

```js
window.name = "globalName"
const obj = {
  name: "Tom"
}

obj.getName = function () {
  const callback = () => {
    console.log(this.name)
  }

  callback()
}

obj.getName() // "Tom"
```

### 构造器调用

当通过 `new` 操作符调用函数时，该函数会返回一个对象。通常情况下，构造器里的 `this` 就指向这个返回的对象。

```js
function Person() {
  this.name = "Tom"
  this.getName = function () {
    console.log(this.name)
  }
}
const p = new Person()
console.log(p) // Person { name: "Tom", getName: function() }
p.getName() // "Tom"
```

如果构造器显式地返回了一个 `object` 类型的对象（`obj != null && typeof obj == "object"` 或者 `function`），那么运算的结果将返回这个对象。

```js
function Person() {
  this.name = "Tom"
}
function Person2() {
  this.name = "Tom"
  return { name: "Jack" }
}
function Person3() {
  this.name = "Tom"
  return [1]
}
function Person4() {
  this.name = "Tom"
  return function () {}
}
const p = new Person()
const p2 = new Person2()
const p3 = new Person3()
const p4 = new Person4()
console.log(p) // Person { name: "Tom" }
console.log(p2) // { name: "Jack" }
console.log(p3) // [1]
console.log(p4) // [Function (anonymous)]
```

如果不显式返回任何数据，或者是返回一个非对象类型的数据，那么就不会有上述的问题。

```js
function Person() {
  this.name = "Tom"
}
function Person2() {
  this.name = "Tom"
  return 1
}
function Person3() {
  this.name = "Tom"
  return "1243"
}
function Person4() {
  this.name = "Tom"
  return null
}
const p = new Person()
const p2 = new Person2()
const p3 = new Person3()
const p4 = new Person4()
console.log(p) // Person { name: "Tom" }
console.log(p2) // Person { name: "Tom" }
console.log(p3) // Person { name: "Tom" }
console.log(p4) // Person { name: "Tom" }
```

### 通过 `call`、`apply` 或 `bind` 调用

```js
const obj1 = {
  name: "Tom",
  getName() {
    console.log(this.name)
  }
}

const obj2 = {
  name: "Jack"
}

obj1.getName() // "Tom"
obj1.getName.call(obj2) // "Jack"
obj1.getName.apply(obj2) // "Jack"

const fn = obj1.getName.bind(obj2)
fn() // "Jack"
```

其中 _call_ 和 _apply_ 都是修改当前函数的 _this_ 后，立即执行；而 _bind_ 是修改当前函数的 _this_ 后，并返回一个新的函数。

#### _call_ 和 _apply_ 的区别

两者的第一个参数都是指定函数体内 _this_ 对象的指向，如果不想修改 _this_ ，传个 `null` ，函数体内的 _this_ 默认指向宿主对象。后续的参数：_call_ 需要把每个参数都罗列出来，而 _apply_ 可以使用一个参数的集合，这个集合可以是数组，也可以是类数组。

```js
function fn(a, b, c) {
  console.log(a, b, c)
}

fn.call(null, 1, 2, 3) // 1 2 3
fn.apply(null, [1, 2, 3]) // 1 2 3
```

如果参数数量固定，那么可以使用 _call_ ，如果不固定，那就可以用 _apply_ 。_call_ 只是在 _apply_ 上扩展的语法糖，能用 _call_ 的地方，也能用 _apply_ 。

#### 手写 _call_ 、_apply_ 和 _bind_

主要实现原理：通过对象的方法来调用函数，那么函数的 _this_ 指向该对象。在指定的 _this_ 下新增一个方法，这个方法与原方法相同且接收同样的参数，最后将执行结果返回，同时删除该方法。

```js
Function.prototype.myCall = function (context, ...args) {
  if (typeof context !== "object" || context == null) {
    context = window
  }
  const fn = Symbol()
  context[fn] = this
  const res = context[fn](...args)
  delete context[fn]
  return res
}

Function.prototype.myApply = function (context, args) {
  if (typeof context !== "object" || context == null) {
    context = window
  }
  const fn = Symbol()
  context[fn] = this
  const res = context[fn](...args)
  delete context[fn]
  return res
}

Function.prototype.myBind = function (context, ...args1) {
  return (...args2) => {
    if (typeof context !== "object" || context == null) {
      context = window
    }
    const fn = Symbol()
    context[fn] = this
    const res = context[fn](...args1, ...args2)
    delete context[fn]
    return res
  }
}

// 通过 apply 实现 bind
Function.prototype.myBind2 = function (context, ...args1) {
  return (...args2) => {
    if (typeof context !== "object" || context == null) {
      context = window
    }
    return this.apply(context, [...args1, ...args2])
  }
}
```

### 箭头函数中的 `this`

箭头函数没有自己的 `this`，只会从作用域链的上一层继承 `this`。而且继承后，这个 `this` 永远不会改变，也即箭头函数的 `this` 在函数的定义阶段就已经确定了。

```js
window.name = "globalName"

const fn = () => this.name
const obj = {
  name: "objName"
}

fn() // "globalName"
fn.call(obj) // "globalName"
```

即使通过 `call` 改变 `this` 指向，对于箭头函数而言，也是毫无作用。

## 闭包

闭包是什么？闭包就是一个函数能够读取其他函数内部的变量。先来看一个例子。

```js
function fn() {
  let count = 0
  function getCount() {
    console.log(count)
  }
  getCount()
}
```

> _getCount_ 能够读取到 _fn_ 内部定义的 _count_ ，这就形成了闭包。

再来看一个经典案例。给 _list_ 中的每一项添加一个 _trigger_ 方法，打印当前的 _i_ ，_trigger_ 方法使用了函数外部的变量，这也形成了闭包。

```js
const list = [{}, {}, {}]

for (var i = 0, len = list.length; i < len; i++) {
  list[i].trigger = function () {
    console.log(i)
  }
}

list.forEach(el => {
  el.trigger()
})

/** 输出
3
3
3
*/
```

因为 _var_ 存在提前变量声明，变量的作用域是整个封闭函数或者全局，而上面的代码不是在一个封闭函数中，那么 _i_ 的作用域就是全局。三个 _trigger_ 分别引用了变量 _i_ ，由于执行 _trigger_ 的时机发生在循环之后，所以当执行 _trigger_ 时，循环就早已经执行完毕了，此时的 _i_ 已经变成了 _3_ 。因为 _i_ 是全局的，所以三个 _trigger_ 里引用的 _i_ 也变成了 _3_ 。按照这个思路，如果把 _i_ 放在一个封闭函数中，是不是就能解决这个问题了？

> 小知识：函数执行的时候使用的是 _**定义函数时**_ 生效的变量作用域，而不是 _**调用函数时**_ 生效的变量作用域。

```js
for (var i = 0, len = list.length; i < len; i++) {
  !(function (j) {
    list[j].trigger = function () {
      console.log(j)
    }
  })(i)
}

/** 输出
0
1
2
*/
```

用一个自动执行函数把 _trigger_ 赋值的操作包裹起来，把 _i_ 当作变量传给每一个函数，相当于每个函数内部的 _j_ ，都有了自己的作用域，触发 _trigger_ 时，取各自作用域里的 _j_ 。

上面的方法中，在每次遍历的时候，在内部定义了一个自动执行函数。遍历？函数？是不是想到了数组的一个方法：_forEach_ 。那么使用 _forEach_ 是不是也能呢？答案是肯定的。

```js
list.forEach((el, i) => {
  el.trigger = function () {
    console.log(i)
  }
})

/** 输出
0
1
2
*/
```

上面两种方法都是采用函数来解决 _var_ 声明变量的作用域是整个封闭函数问题。还可以使用一种更简单的方法：_let_ 。

```js
for (let i = 0, len = list.length; i < len; i++) {
  list[i].trigger = function () {
    console.log(i)
  }
}

/** 输出
0
1
2
*/
```

_let_ 声明的变量作用域只在其声明的块或子块内部。先看一个例子：

```js
function fn() {
  let a = 1
  {
    let a = 2
    console.log(a) // 2
  }
  {
    let b = 3
  }
  console.log(a) // 1
  console.log(b) // ReferenceError: b is not defined
}

function fn() {
  var a = 1
  {
    var a = 2
    console.log(a) // 2
  }
  {
    var b = 3
  }
  console.log(a) // 2
  console.log(b) // 3
}
```

> 每个 `{}` 可以算做一个块，对于 _let_ ，块内声明变量的作用域只作用于当前块；而对于 _var_ ，封闭函数才是它的作用域，所以无论是否在块中声明变量，只要在整个封闭函数内，都能获取该变量，而且对于已存在的变量还能重新定义。

### 闭包的运用

#### 私有化变量

看一个经典的闭包案例。

```js
function fn() {
  let cnt = 0
  return function () {
    console.log(cnt++)
  }
}

const f = fn()
f() // 0
f() // 1
f() // 2
// ...
```

在函数 _fn_ 内部定义一个 _cnt_ ，执行 _fn_ 会返回一个新函数，每执行一次这个函数，就会将 `cnt + 1`。只能通过 _f_ 来更改 _cnt_ 的值，如果想销毁 _cnt_ ，将 _f_ 置空（`f = null`）。

把上面的代码，换成面向对象的风格：

```js
const obj = {
  cnt: 0,
  addCnt() {
    console.log(this.cnt++)
  }
}

obj.addCnt() // 0
obj.addCnt() // 1
```

#### 缓存数据

可以缓存数字之和的函数。

```js
function cacheSum() {
  const cache = {}
  return function () {
    const data = [...arguments]
    const key = data.join()
    if (key in cache) return cache[key]

    const computedSum = arr => arr.reduce((sum, curr) => sum + curr, 0)
    console.log("computed")
    return (cache[key] = computedSum(data))
  }
}

const sum = cacheSum()
console.log(sum(1, 2, 3, 4)) // "computed" 10
console.log(sum(1, 2, 3, 4)) // 10
```

拦截对象上的某个方法，执行返回的函数后，重置该方法。

```js
function intercept(obj, key, cb) {
  const originKey = obj[key]
  obj[key] = function () {
    originKey(...arguments)
    cb(...arguments)
  }
  return function () {
    obj[key] = originKey
  }
}

const obj = {
  sayHi(name) {
    console.log("Hi~", name)
  }
}

obj.sayHi("Tom") // "Hi~ Tom"
const teardownSayHi = intercept(obj, "sayHi", function () {
  console.log("I has be intercepted")
})
obj.sayHi("Tom") // "Hi~ Tom" "I has be intercepted"
teardownSayHi()
obj.sayHi("Tom") // "Hi~ Tom"
```

### 闭包的问题

引用 《JavaScript 设计模式与开发实践》中的一段话：

“一种耸人听闻的说法是闭包会导致内存泄漏，因为没能及时回收变量，导致内存泄漏，这听起来好像很合理。然而闭包和内存泄露有关系的地方是，使用闭包的同时比较容易形成循环引用，如果闭包的作用域链中保存着一些 DOM 节点，这时候就有可能造成内存泄露。但这本身并非闭包的问题，也并非 JavaScript 的问题。在 IE 浏览器中（ _IE_ ：又鞭尸我是吧？），由于 BOM 和 DOM 中的对象是使用 C++以 COM 对象的方式实现的，而 COM 对象的垃圾收集机制采用的是引用计数策略。在基于引用计数策略的垃圾回收机制中，如果两个对象之间形成了循环引用，那么这两个对象都无法被回收，但循环引用造成的内存泄露在本质上也不是闭包造成的。”

## 高阶函数

高阶函数指至少满足下列条件之一的函数：

- 函数可以作为参数被传递；
- 函数可以作为返回值输出。

> 在闭包的<a href="#缓存数据"> 缓存数据 </a>部分，实现的拦截器函数 `intercept` 就是一个高阶函数。它不仅把函数当作参数传入，还返回一个新函数。

### 函数可以作为参数被传递

常见的就是数组上的一些方法：_sort_ 、_map_ 、_reduce_ 等，都需要传一个函数作为参数。

```js
const arr = [1, 3, 2, 4, 0]
arr.sort((a, b) => a - b) // [0, 1, 2, 3, 4]
arr.map(a => a * 2) // [2, 6, 4, 8, 0]
arr.reduce((sum, curr) => sum + curr, 0) // 10
```

### 函数可以作为返回值输出

实现一个类型判断函数。

```js
function isType(type) {
  return function (obj) {
    return Object.prototype.toString.call(obj).slice(8, -1) === type
  }
}

const isString = isType("String")
const isNumber = isType("Number")
const isNull = isType("Null")

console.log(isString("abc")) // true
console.log(isString(12)) // false
console.log(isNumber(12)) // true
console.log(isNull(null)) // true
```

### 实现 AOP

> 维基百科：面向切面的程序设计（Aspect-oriented programming，AOP，又译作面向方面的程序设计、剖面导向程序设计），是计算机科学中的一种程序设计思想，旨在将横切关注点与业务主体进行进一步分离，以提高程序代码的模块化程度。通过在现有代码基础上增加额外的通知（Advice）机制，能够对被声明为“切点（Pointcut）”的代码块进行统一管理与装饰，比如说：“对所有方法名以 `set*` 开头的方法添加后台日志”。该思想使得开发人员能够将与代码核心业务逻辑关系不那么密切的功能（如日志功能）添加至程序中，同时又不降低业务代码的可读性。面向切面的程序设计思想也是面向切面软件开发的基础。

主要作用是把一些核心业务逻辑模块无关的功能抽离出来，这些跟业务逻辑无关的功能通常包括日志统计、安全控制、异常处理等。把这些功能抽离出来之后，再通过“动态织入”的方式掺入到业务逻辑模块中。这样做的好处首先是可以保证业务逻辑模块的纯净与高内聚性，其次是可以很方便地复用日志统计等功能模块。

实现两个方法：_before_ 与 _after_ ，挂载在 _Function.prototype_ 上，_before_ 在原函数之前执行，_after_ 在原函数之后执行。

```js
Function.prototype.before = function (fn) {
  const _this = this // 保存原函数的引用
  return function () {
    fn.apply(this, arguments) // 执行新函数
    return _this.apply(this, arguments) // 执行原函数，并返回执行结果
  }
}

Function.prototype.after = function (fn) {
  const _this = this // 保存原函数的引用
  return function () {
    const res = _this.apply(this, arguments) // 保存原函数的执行结果
    fn.apply(this, arguments) // 执行新函数
    return res // 将原函数的执行结果返回
  }
}

let fn = function () {
  console.log(2)
}

fn = fn
  .before(() => {
    console.log(1)
  })
  .after(() => {
    console.log(3)
  })

fn()

/** 输出
1
2
3
*/
```

### 节流和防抖

有些场景下，有些事件可能会频繁触发（例如，`window.onresize`、`mousemove`等），假设 1 秒 10 次，然而实际上没必要触发那么多次，1 秒 2 次就能满足需要了，这时候就会造成性能问题。而节流和防抖就是解决函数触发频率太高的方案之一。

> 节流就类似于游戏里的技能冷却时间，当技能未冷却完成时，不能使用。而防抖就类似于电梯，如果有人进来，就等一段时间再关门，关门前，如果又有人进来就再等等，直到一段时间没人进来后，关门再运行。

#### 节流

```js
function throttle(fn, wait) {
  let timer = null
  let isFirstTime = true // 是否是第一次触发

  return function () {
    const args = arguments
    const that = this
    if (isFirstTime) {
      fn.apply(that, args)
      return (isFirstTime = false)
    }

    // 当前正在执行中，直接退出（技能还在冷却中）
    if (timer) {
      return false
    }

    // 设置 timer（使用技能）
    timer = setTimeout(() => {
      clearTimeout(timer)
      timer = null
      fn.apply(that, args)
    }, wait)
  }
}

const print = throttle(() => {
  console.log("print")
}, 1000)

print()
print()
print()

/** 输出
print
print
*/
```

#### 防抖

```js
function debounce(fn, wait) {
  let timer = null
  return function () {
    const args = arguments
    const _this = this
    // 在 wait 时间段内触发（有人进来，取消关闭电梯门的指令，重新打开电梯门）
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    // 设置 timer（等待 wait 时间段后，关闭电梯门）
    timer = setTimeout(() => {
      fn.apply(_this, args)
    }, wait)
  }
}

const print = debounce(() => {
  console.log("print")
}, 1000)

print()
print()
print()

/** 输出
print
*/
```
