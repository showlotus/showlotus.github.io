import fs from 'fs-extra'
import { globby } from 'globby'
import matter from 'gray-matter'

export interface Post {
  frontMatter: {
    date: string
    title: string
    category: string
    tags: string[]
    description: string
  }
  regularPath: string
}

export async function getPosts() {
  const paths = await getPostMDFilePaths()
  const posts = (await Promise.all(
    paths.map(async (item) => {
      const content = await fs.readFile(item, 'utf-8')
      const { data } = matter(content)
      data.date = _convertDate(data.date)
      return {
        frontMatter: data,
        regularPath: `/${item.replace('.md', '.html')}`,
      }
    }),
  )) as Post[]
  posts.sort((a, b) => (a.frontMatter.date < b.frontMatter.date ? 1 : -1))
  return posts
}

function _convertDate(date = new Date().toString()) {
  const json_date = new Date(date).toJSON()
  return json_date.split('T')[0]
}

async function getPostMDFilePaths() {
  const paths = await globby(['**.md'], {
    ignore: ['node_modules', 'README.md'],
  })
  return paths.filter((item) => item.includes('posts/'))
}

export async function getPostLength() {
  // getPostMDFilePath return type is object not array
  return [...(await getPostMDFilePaths())].length
}
