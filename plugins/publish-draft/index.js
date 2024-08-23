const inquirer = require("inquirer")
const dayjs = require("dayjs")
const fsPromises = require("fs").promises
const path = require("path")

const cwd = process.cwd()

async function init() {
  try {
    const draftDir = path.join(cwd, "source/_drafts")
    const postDir = path.join(cwd, "source/_posts")
    const response = await fsPromises.readdir(draftDir)
    const drafts = response.filter(dir => !dir.endsWith(".md")).map((v, i) => `${String(i + 1).padStart(2, "0")}. ${v}`)
    const { name } = await inquirer.prompt([
      {
        name: "name",
        type: "list",
        message: "请选择要发布的草稿：",
        choices: drafts,
        default: drafts[0]
      }
    ])
    const articleName = name.slice(4)
    const folder = path.join(draftDir, articleName)
    const article = folder + ".md"

    const content = (await fsPromises.readFile(article)).toString()
    const header = content.match(/---[\s\S]+(?=(---))/)?.[0]
    if (!header) {
      throw new Error("草稿头信息不存在")
    }

    const date = header.match(/date: ([^\n]+)/g)?.[0].slice(6)
    if (!date) {
      throw new Error("草稿头中日期信息不存在")
    }

    const { $y, $M } = dayjs(date)
    const year = String($y)
    const month = String($M + 1).padStart(2, "0")

    const targetFolder = path.join(postDir, year, month)
    // 创建目标目录
    await fsPromises.mkdir(targetFolder, { recursive: true })

    const newFolder = path.join(targetFolder, articleName)
    const newArticle = newFolder + ".md"

    await fsPromises.rename(folder, newFolder)
    await fsPromises.rename(article, newArticle)

    console.log(`✔︎ 草稿 ${articleName} 已发布 🎉🎉🎉`)
  } catch (e) {
    console.log(e)
  }
}

init()
