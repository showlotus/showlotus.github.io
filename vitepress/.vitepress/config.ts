import { defineConfig } from 'vitepress'
import { getPostLength, getPosts } from './theme/server/utils'

const isProd = process.env.NODE_ENV === 'production'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "showlotus",
  description: "showlotus's blog",
  // 添加 Tailwind CSS 样式
  head: [
    // ['link', { rel: 'stylesheet', href: '/tailwind.css' }]
  ],
  lang: 'zh-CN',
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // 设置导航栏
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'Archives', link: '/pages/Archives' },
      { text: 'Tags', link: '/pages/Tags' },
    ],
    // 设置侧边栏
    sidebar: [],
    // 设置社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/showlotus' }
    ],
    // 设置搜索
    search: {
      provider: "local",
    },
    lastUpdated: {
      text: '最后更新于',
      // formatOptions: {
      //   dateStyle: 'full',
      //   timeStyle: 'medium'
      // }
    },
    // 设置页脚
    footer: {
      // message: 'Nice to meet you!',
      copyright: 'Copyright © 2025-present showlotus',
    },
    outline: {
      level: 'deep', // 显示所有层级的标题
      label: '目录', // 目录标题
    },
    posts: await getPosts(),
    pageSize: 5,
    postLength: await getPostLength(),
  } as any,
  // srcExclude: isProd
  //   ? [
  //     '**/trash/**/*.md', // 排除所有 trash 目录
  //     '**/draft/**/*.md', // 递归排除子目录
  //     '**/private-notes/*.md', // 排除特定文件
  //     'README.md'
  //   ]
  //   : ['README.md'],
  markdown: {
    math: true,
    lineNumbers: true,
  },
  // 配置 Vite
  vite: {
    optimizeDeps: {
      exclude: ['@shikijs/core']
    }
  },
  // 添加配置以支持获取所有文档数据
  async transformPageData(pageData) {
    // 确保每个页面都有 tags 属性
    if (!pageData.frontmatter.tags) {
      pageData.frontmatter.tags = []
    }
    return pageData
  }
})
