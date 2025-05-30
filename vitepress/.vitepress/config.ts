import { defineConfig } from 'vitepress'
import { getPostLength, getPosts } from './theme/server/utils'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'Archives', link: '/pages/Archives' },
      { text: 'Tags', link: '/pages/Tags' },
    ],

    sidebar: [],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    search: {
      provider: "local",
    },
    lastUpdated: true,
    posts: await getPosts(),
    pageSize: 5,
    postLength: await getPostLength(),
  } as any,
  // 添加配置以支持获取所有文档数据
  async transformPageData(pageData) {
    // 确保每个页面都有 tags 属性
    if (!pageData.frontmatter.tags) {
      pageData.frontmatter.tags = []
    }
    return pageData
  }
})
