---
title: JS中的类型转换 <W10>
categories:
  - [日常]
  - [笔记]
  - [每周一篇]
tags:
  - JavaScript
  - JavaScript-权威指南
mathjax: false
date: 2022-11-03 12:50:11
---

{% asset_img banner.jpg %}

## JS 中的数据类型

基础数据类型（又称为原始值）：_null_ 、_undefined_ 、_boolean_ 、_string_ 、_number_ 。

- 声明时：用栈存储，栈中存放的是对应的值；
- 赋值时：生成一块相同值的栈，两个变量对应不同的地址。

动态数据类型：_Array_ 、_Object_ 、_Set_ 、_Map_ 等。

- 声明时：值存放在堆中，栈中存放指向堆的地址；
- 赋值时：将栈中的地址赋给另一个变量，也就是两个变量指向堆中的同一个对象。

> 动态数据类型，可以理解为：长度不固定的数据类型，可以新增或者删除元素。

## 转换为原始值

值得一提的是，无论是基础数据类型还是动态数据类型都能转换为原始值。这一点很重要，为变量间的隐式类型转换提供了有力的支持。

### 转为 _boolean_ 类型

> 如果是隐式转换，则内部采用 `Boolean()` 方法。

|       值       |  结果   |
| :------------: | :-----: |
|  `undefined`   | `false` |
|     `null`     | `false` |
|      `0`       | `false` |
|     `NaN`      | `false` |
| `""`(空字符串) | `false` |
|  任何非零数字  | `true`  |
| 任何非空字符串 | `true`  |
|  任何对象类型  | `true`  |

### 转为 _string_ 类型

> 如果是隐式转换，则内部采用 `String()` 方法。

|     值      |         结果         |
| :---------: | :------------------: |
| `undefined` |    `"undefined"`     |
|   `null`    |       `"null"`       |
|   `true`    |       `"true"`       |
|   `false`   |      `"false"`       |
|  任何数字   | 调用 `String()` 方法 |

- _Date_ 转 _String_ ，返回一个描述当前日期的字符串。

  ```js
  const d = new Date()
  d.toString() // "Sat Nov 05 2022 14:46:39 GMT+0800 (中国标准时间)"
  ```

- _Array_ 转 _String_ ，内部调用 `toString()` 方法，等同于 `Array.prototype.join()`。

  ```js
  const arr = [1, 2]
  arr.join() // "1,2"
  arr.toString() // "1,2"
  ```

- _Function_ 转 _String_ ，内部调用 `toString()` 方法，返回定义的函数源码字符串。

  ```js
  const f = () => 1
  f.toString() // "() => 1"
  ```

- _RegExp_ 转 _String_ ，转成一个 _RegExp_ 字面量字符串。

  ```js
  const reg = new RegExp(/hello/)
  reg.toString() // "/hello/"
  ```

- 其余对象 转 _String_ ，内部调用 `toString()` 方法，返回一个 `"[object 当前类型]"` 的字符串。

  ```js
  const obj = {}
  const set = new Set()
  const map = new Map()
  obj.toString() // "[object Object]"
  set.toString() // "[object Set]"
  map.toString() // "[object Map]"
  ```

> 以上转换规则，仅适用于在不改变原型对象上 `valueOf()` 与 `toSting()` 这两个方法的前提下。

### 转为 _number_ 类型

> 如果是隐式转换，则内部采用 `Number()` 方法。

|            值            |         结果         |
| :----------------------: | :------------------: |
|       `undefined`        |        `NaN`         |
|          `null`          |         `0`          |
|          `true`          |         `1`          |
|         `false`          |         `0`          |
| `""`(空字符串或全为空格) |         `0`          |
|        其余字符串        | 调用 `Number()` 方法 |

- _Date_ 转 _Number_ ，返回一个毫秒级时间戳，等同于 `Date.prototype.getTime()`。

> 以上转换规则，仅适用于在不改变原型对象上 `valueOf()` 与 `toSting()` 这两个方法的前提下。

## `valueOf()` 与 `toString()`

JS 中所有类型都会继承这两个方法，而且在隐式类型转换阶段，转换结果完全取决于这两个方法的返回值。

- `valueOf()` 把对象转换为原始值（如果存在这样一个原始值），对于大多数对象而言都无法通过原始值表示，所以直接返回当前对象本身。而对于原始值类型，`valueOf()` 返回的也是原始值本身。
- `toSting()` 返回对象的字符串表示（前文已经介绍过了，这里不再赘述）。

JS 中的三种对象到原始值转换算法：

- 偏字符串算法

  返回原始值，尽可能返回一个字符串。首先尝试 `toString()`，如果该方法有定义并且返回一个原始值，则使用该原始值（即使这个值不是字符串）。如果 `toString()` 不存在，或者返回值不是一个原始值，则再尝试 `valueOf` 方法。如果该方法有定义且返回一个原始值，则使用该值。否则，转换失败，报错 `TypeError`。

- 偏数值算法

  返回原始值，尽可能返回一个数值。与偏字符串算法类似，只不过先尝试 `valueOf()`，再尝试 `toString()`。如果转换失败，同样报错 `TypeError`。

- 无偏好算法

  在转为原始值时，不倾向任何原始值。JS 中除了 `Date` 对象，使用偏字符串算法，其余类型的对象，都采用偏数值算法。

## 隐式类型转换

什么是隐式类型转换？又或者什么时候会发生隐式类型转换？

总结成一句话就是：当前操作的类型与需要的类型不一致时，就会发生隐式类型转换。比如，在 `if`、`while` 等判断语句里，需要一个 _Boolean_ 类型，而传过来一个 _Number_ 或者 _String_ ，这时候就会把这个非 _Boolean_ 类型隐式转化为 _Boolean_ 类型。这种算是比较常见的隐式类型转换了，而且也比较容易理解，接下来重点讲讲几种晦涩难懂的隐式转换。

### `+` 操作符

#### 一个操作数

当只有一个操作数时，`+`（`-` 也可以，转换后再乘以 `-1`） 会对当前的值进行隐式 _Number_ 转换。如果是原始值类型，就如前文表中所述的转换规则进行转换 <a href="#转为-number-类型">👆(回到上方表格)</a>。否则，由于需要一个 _Number_ 类型，所以会采用偏数值算法对当前值进行转换。

- 当操作数是 _Array_ 类型时

  ```js
  console.log(+[]) // 0
  /**
   * 转换流程
   * 先调用 valueOf() 方法，返回当前数组本身 []，不是原始值
   * 再调用 toString() 方法，返回一个字符串 ""，是原始值
   * 将 "" 转为 Number 类型，就是 0，所以最后的结果就是 0
   */
  ```

- 当操作数是 _Object_ 类型时

  ```js
  console.log(+{}) // NaN
  /**
   * 转换流程
   * 先调用 valueOf() 方法，返回当前对象本身 {}，不是原始值
   * 再调用 toString() 方法，返回一个字符串 "[object Object]"，是原始值
   * 将 "[object Object]" 转为 Number 类型，就是 NaN，所以最后的结果就是 NaN
   */
  ```

- 如果更改了内部的 `valueOf()` 或 `toString()` 方法

  ```js
  const obj = {
    valueOf() {
      return 1
    }
  }
  const obj2 = {
    toString() {
      return 2
    }
  }

  console.log(-obj) // -1
  console.log(-obj2) // -2
  ```

#### 两个操作数

当操作数有两个时，不仅可以进行数值加法运算，还可以进行字符串拼接。同为数值或者同为字符串的情况就不考虑了，着重介绍如果操作数中有对象的情况。可以铭记的一点是：<font style="border-bottom: 1px solid #4a4a4a">_任何类型与字符串进行 `+` 运算得到的一定是字符串_</font>。

- 操作数中有一个是对象

  先将该对象转为原始值（`Date` 采用偏字符串算法，其余对象采用偏数值算法），如果另一个操作数是字符串，则将该对象的原始值转为字符串，再拼接两个字符串。否则，都转成数值再相加。

  ```js
  console.log(new Date() + "hi") // Sat Nov 05 2022 20:10:14 GMT+0800 (中国标准时间)hi
  console.log(new Date() + 25) // Sat Nov 05 2022 20:10:14 GMT+0800 (中国标准时间)25

  const obj = {}
  console.log(obj + 1) // "[object Object]" + 1 = "[object Object]1"
  /**
   * 转换流程
   * obj 先调用 valueOf() 方法，返回当前对象本身 {}，不是原始值
   * 再调用 toString() 方法，返回一个字符串 "[object Object]"，是原始值
   * "[object Object]" + 1 = "[object Object]1"
   */

  const obj2 = {}
  console.log(obj + "1") // "[object Object]" + "1" = "[object Object]1"

  const obj3 = {
    valueOf() {
      return 3
    }
  }
  console.log(obj3 + 1) // 3 + 1 = 4
  console.log(obj3 + true) //  true => 1 -> 3 + 1 = 4
  console.log(obj3 + null) // null => 0 -> 3 + 0 = 3
  console.log(obj3 + false) // false => 0 -> 3 + 0 = 3
  console.log(obj3 + undefined) // undefined => NaN -> 3 + NaN = NaN
  ```

- 两个操作数都是对象

  都先转为原始值，再进行原始值 `+` 运算。

  ```js
  const obj1 = {}
  const obj2 = []
  console.log(obj1 + obj2) // "[object Object]" + "" = "[object Object]"

  const obj3 = [1, 2]
  console.log(obj1 + obj3) // "[object Object]" + "1,2" = "[object Object]1,2"

  const obj4 = {
    valueOf() {
      return 4
    }
  }
  const obj5 = {
    valueOf() {
      return 5
    }
  }
  console.log(obj4 + obj5) // 4 + 5 = 9
  ```

> 由于 `+` 运算是从左到右进行的，如果是多个操作数的情况，只不过是先计算前一步的结果，然后再与后面的进行运算，同样遵循两个操作数的规则。

### 比较操作符

`==` 、`!=` 、`<`、`<=`、`>` 和 `>=` 在进行比较时，允许进行类型转换。

- 在原始值间比较

  - `null` 与 `undefined` 除了它俩之间宽松相等外，它们不与任何原始值宽松相等。

    ```js
    console.log(null == undefined) // true
    console.log(null == 0) // false
    console.log(null == false) // false
    console.log(null == "") // false
    console.log(undefined == "") // false
    console.log(undefined == false) // false
    console.log(undefined == 0) // false

    // 特殊的是，在进行大小比较时，null会先被转为数值后，再进行比较
    console.log(0 >= null) // true
    console.log(1 > null) // true
    console.log(0 > null) // false
    ```

  - 其余原始值在进行比较时，会转为数值后再进行比较。

    ```js
    console.log(0 == "") // true
    console.log(0 == "0") // true
    console.log(0 == false) // true
    console.log("0" == false) // true
    console.log(1 == true) // true
    console.log("1" == true) // true
    console.log(1 == "1") // true
    console.log(1 == "1.0000") // true
    console.log("2" > true) // true
    console.log(2 == true) // false
    console.log("2" == true) // false
    console.log(0 >= false) // true
    console.log("0" >= false) // true
    console.log(1 >= true) // true
    console.log("2" >= true) // true
    ```

- 对象与原始值比较

  将对象转为原始值后，再比较。

  ```js
  console.log([] == "") // true
  console.log([0] == false) // true
  console.log([1] == true) // true
  console.log([1, 2] == "1,2") // true
  console.log({} == "[object Object]") // true
  console.log(
    {
      valueOf() {
        return 1
      }
    } == 1
  ) // true
  console.log(
    {
      valueOf() {
        return 1
      }
    } == true
  ) // true
  console.log(
    {
      valueOf() {
        return 1
      }
    } > true
  ) // true
  console.log(
    {
      valueOf() {
        return 0
      }
    } < true
  ) // true
  console.log(
    {
      valueOf() {
        return ""
      }
    } <= false
  ) // true
  ```

- `Date` 类型的比较

  由于 `>` 和 `<` 使用偏数值的算法，而 `Date` 转为数值后，是一个表示时间的毫秒时间戳，也就意味着使用 `>` 和 `<` 来比较两个日期是可行的。
