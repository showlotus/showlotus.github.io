// 自定义 helper 工具函数
hexo.extend.helper.register("formatTag", function (str) {
  return str.replace(/-0|-/g, v => {
    if (v.length === 1) {
      return " "
    } else {
      return "-"
    }
  })
})
