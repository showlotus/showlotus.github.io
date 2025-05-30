<template>
  <div v-for="yearList in data">
    <div class="year">
      {{ yearList[0].frontMatter.date.split('-')[0] }}
    </div>
    <a
      :href="withBase(article.regularPath)"
      v-for="(article, index) in yearList"
      :key="index"
      class="posts"
    >
      <div class="post-container">
        <div class="post-dot"></div>
        {{ article.frontMatter.title }}
      </div>
      <div class="date">{{ article.frontMatter.date.slice(5) }}</div>
    </a>
  </div>
</template>

<script lang="ts" setup>
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

import { Post } from '../server/utils'

const useYearSort = (post: Post[]) => {
  const data: Post[][] = []
  let year = '0'
  let num = -1
  for (let index = 0; index < post.length; index++) {
    const element = post[index]
    if (element.frontMatter.date) {
      const y = element.frontMatter.date.split('-')[0]
      if (y === year) {
        data[num].push(element)
      } else {
        num++
        data[num] = []
        data[num].push(element)
        year = y
      }
    }
  }
  return data
}

const { theme } = useData()
const data = computed(() => useYearSort(theme.value.posts))
</script>

<style scoped>
.year {
  padding: 28px 0 10px 0;
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--bt-theme-title);
  font-family: var(--date-font-family), serif;
}
</style>
