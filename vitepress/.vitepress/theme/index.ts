// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Tags from './components/Tags.vue'
import Archives from './components/Archives.vue'
import Home from './components/Home.vue'
import './style.css'
import './tailwind.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('Tags', Tags)
    app.component('Archives', Archives)
    app.component('Home', Home)
  }
} satisfies Theme
