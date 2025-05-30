---
title: 搭配el-cascader实现一个级联选择日期组件
date: 2021-10-17 12:10:56
tags:
  - Vue
  - ElementUI
---

![华卡雷瓦雷瓦森林的红木纪念树林，新西兰北岛](https://cn.bing.com/th?id=OHR.Whakarewarewa_ZH-CN4957778498_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp)

事情是这样的：经理觉得日期范围选择组件（使用的是 `<el-date-picker type="daterange" />`），如果时间跨度太大，不便于操作，让我优化一下。思考良久之后，我提出方案：做成一个级联下拉框的形式，经理说：可以。开搞！

组件整体是基于 `el-cascader`，然后进行改造，思路如下：

- 将开始日期和结束日期拆分成两个 `el-cascader`;
- 为了防止页面加载过多 DOM 节点，使用了 `cascader` 的 _lazyload_;
- 首次展开面板时，显示最近 10 年的年份（对于本项目，10 年足够了），亦或是在年份的最下面添加一个 _加载更多_ 的按钮（等有时间，下次尝试一下）；
- 每个年份都有 12 个月，这是固定不变的，重点在于一些特殊月（二月：你们看我干嘛），获取某一个月的天数；

#### <center>template</center>

```js
<template>
  <div class="date-picker-wrap">
    <el-cascader
      :class="['start-date', showPanel ? 'is-focus' : '']"
      :size="size"
      placeholder="开始日期"
      :options="options"
      separator="-"
      popper-class="select-date"
      clearable
      @visible-change="isShow => (showPanel = isShow)"
      :props="cascaderProp"
      @change="handlerSelectDate"
      v-model="startTime"
    ></el-cascader>
    <el-cascader
      :class="['end-date', showPanel ? 'is-focus' : '']"
      :size="size"
      placeholder="结束日期"
      :options="options"
      separator="-"
      popper-class="select-date"
      clearable
      @visible-change="isShow => (showPanel = isShow)"
      :props="cascaderProp"
      @change="handlerSelectDate"
      v-model="endTime"
    ></el-cascader>
  </div>
</template>
```

> 这里我通过 `@visible-change` 事件监听弹出层的打开和关闭状态，两个级联框“背靠背”实在是太难看了，于是就通过一个类来修改了 `focus` 和 `hover` 事件，让它俩合二为一，美观加倍！

#### <center>script</center>

```js
<script>
export default {
  name: 'date-picker',
  props: {
    size: {
      type: String,
      default: 'small'
    }
  },
  data () {
    return {
      showPanel: false,
      startTime: '',
      endTime: '',
      options: [],
      cascaderProp: {
        lazy: true,
        lazyLoad: (node, resolve) => {
          const { level } = node
          if (level === 0) {
            /* 懒加载年份 */
            resolve(this.loadYear())
          } else if (level === 1) {
            /* 懒加载月份 */
            resolve(this.loadMonth(node.value))
          } else if (level === 2) {
            /* 懒加载天 */
            resolve(this.loadDay(node.value))
          } else {
            resolve(null)
          }
        }
      }
    }
  },
  methods: {
    handlerSelectDate () {
      let time = []
      if (this.startTime[2]) {
        time[0] = this.$dayjs(this.startTime[2]).format('YYYY-MM-DD 00:00:00')
      }
      time[1] = this.$dayjs(this.endTime[2]).format('YYYY-MM-DD 23:59:59')
      this.$emit('update:updateTime', time)
    },

    loadYear (end = new Date().getFullYear(), start = end - 10) {
      let yearlist = []
      for (let i = end; i > start; i--) {
        yearlist.push({
          label: i,
          value: i
        })
      }
      return yearlist
    },

    loadMonth (year) {
      let monthlist = []
      for (let i = 1; i < 13; i++) {
        monthlist.push({
          label: i.toString().padStart(2, '0'),
          value: year + '-' + i.toString().padStart(2, '0')
        })
      }
      return monthlist
    },

    loadDay (val) {
      let daylist = []
      let maxdays = new Date(val.split('-')[0], val.split('-')[1], 0).getDate()
      for (let i = 1; i <= maxdays; i++) {
        daylist.push({
          label: i.toString().padStart(2, '0'),
          value: val + '-' + i.toString().padStart(2, '0'),
          leaf: true
        })
      }
      return daylist
    },

    init () {
      let date = new Date()
      let year = date.getFullYear()
      for (let i = year; i > year - 10; i--) {
        this.options.push({
          label: i,
          value: i
        })
      }
      this.options.push({
        label: '加载更多...',
        value: 0
      })
    },
    getCurrentDate () {
      return this.$dayjs().format('YYYY-MM-DD 23:59:59')
    }
  }
}
</script>
```

#### <center>style · scss</center>

```scss
.date-picker-wrap {
  width: 240px;
  height: 40px;
  display: flex;
  align-items: center;
  position: relative;

  &::before {
    content: '-';
    position: absolute;
    left: 50%;
    z-index: 1;
  }

  &:hover {
    .el-cascader ::v-deep .el-input__inner {
      border-color: #c0c4cc;
    }
  }

  ::v-deep {
    .el-cascader {
      .el-input__inner {
        text-align: center;
      }
    }

    .el-cascader.is-focus .el-input__inner {
      border-color: #409eff;
    }

    .el-cascader.start-date {
      .el-input__inner {
        border-right: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    .el-cascader.end-date {
      .el-input__inner {
        border-left: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
}
```

> 最后由于宽度太宽了，需要修改宽度，由于弹出层是在 `body` 下，需要将修改宽度的代码在 `main.js` 中引入：

```scss
/* 自定义日期选择组件弹出层的宽度 */
.el-popper.el-cascader__dropdown.select-date {
  .el-scrollbar.el-cascader-menu {
    min-width: 100px;
  }
}
```

#### <center>在父组件中引入</center>

```js
<template>
  <div>
    <ElCascaderDatePicker @update:time="times => (timeRange = times)" />
  </div>
</template>
```

```js
<script>
import ElCascaderDatePicker from 'el-cascader-date-picker.vue'
export default {
  components: {
    ElCascaderDatePicker
  },
  data() {
    return {
      timeRange: []
    }
  }
}
</script>
```

#### <center>效果展示</center>

![效果展示](./7.gif)

####

最后，当我兴高采烈地找到经理，准备邀功时，经理：能不能做成之前其他页面那样，拆成两个框。我：可以！（辛辛苦苦搞了俩小时，等于白干...）
