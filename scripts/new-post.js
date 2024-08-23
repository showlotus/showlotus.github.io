const dayjs = require("dayjs")
const { join } = require("path")

// TAG 自定义新建文章时的文件路径
hexo.extend.filter.register(
  "new_post_path",
  data => {
    if (data.layout !== "post") {
      return data
    }

    const datePath = dayjs(data.date || Date.now()).format("YYYY/MM")
    data.path = join(datePath, data.slug)
    return data
  },
  1
)
