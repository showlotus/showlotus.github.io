<template>
  <div>
    <h1>Home</h1>
    <div>
      <a
        href="https://github.dev/showlotus/vitepress-blog-pure"
        target="_blank"
      >
        https://github.dev/showlotus/vitepress-blog-pure
      </a>
      <br />
      <br />
      <a
        href="https://github.com/showlotus/vitepress-blog-pure/blob/main/.vitepress/theme/serverUtils.ts#L44"
        target="_blank"
      >
        https://github.com/showlotus/vitepress-blog-pure/blob/main/.vitepress/theme/serverUtils.ts#L44
      </a>
    </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()

console.log(theme, page, frontmatter)
</script>
