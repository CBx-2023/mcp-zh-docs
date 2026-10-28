# MCP 中文学习文档

MCP `2026-07-28` 官方学习文档的非官方简体中文译本。使用 Astro 与 Cloudflare Workers Static Assets，按官方 Mintlify 页面重建双层顶栏、完整导航、正文与右侧目录，复用 Starlight 的无障碍标签页组件。

在线预览：https://docs.starlandai.com/mcp-zh-docs/

已完成该版本 Documentation 全部 26 篇及共享 Examples 页面，共 27 篇完整译文，覆盖概念、客户端／服务器开发、安全与 Inspector 全套文档。构建教程包含 Python、TypeScript、Java、Kotlin、C#、Ruby、Rust、Go 示例。

Specification、Extensions、Registry、SEPs 和 Community 属于本次翻译范围之外，保留通往官方英文内容的链接。网站不代表 MCP 官方。

## 本地开发

需要 Node.js 22.12+（推荐 Node.js 24 LTS）和 npm。

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

`build` 会先校验翻译，生成适配内容，再构建站点、搜索索引并检查内部链接，最终打包到 `deploy/mcp-zh-docs/`。报告位于忽略提交的 `reports/`。

## 文件结构

```text
upstream/                 锁定 commit 的官方英文快照、许可、锚点与哈希
translations/zh-CN/       可编辑的中文 MDX；保留原有文件结构
content/                  自有首页、翻译说明、术语和导航配置
src/components/mint/      Mintlify 组件兼容层
src/layouts/              官方风格的文档布局
src/styles/               对照官方页面编写的样式
scripts/                  保真校验、构建适配与产物链接检查
public/images/            原文引用的图示和截图
wrangler.jsonc            Cloudflare 静态站点部署配置
```

`src/content/docs/`、`src/generated/`、`dist/` 和 `deploy/` 是生成目录，不要手动编辑或提交。

## 翻译要求

完整提示见 [TRANSLATION_PROMPT.md](TRANSLATION_PROMPT.md)，术语见 [content/glossary.json](content/glossary.json)。

- 所有代码块逐字保留，包括注释、字符串、语言标记和 Mermaid；行内代码同样保留。
- Frontmatter 仅可翻译 `title` 的值。`sidebarTitle`、`description` 等字段保持原样。
- 保留链接目标、图片路径、锚点、节点标记、组件和表达式。
- 只翻译自然语言及组件中明确可见的 `title`、`tip`、`alt`、`aria-label`、`caption` 等文字。
- 不擅自修正上游示例。新增说明与译文正文分开。

### 构建适配

翻译源文件不承载框架专有配置。`prepare.mjs` 将译文复制到生成目录，并注入独立站点描述和兼容组件。中文导航及来源说明由布局层生成。构建时为站内路径增加 `/mcp-zh-docs` 前缀，译文中的原始 URL 保持原样。

`remark-compat.mjs` 在编译阶段保留官方页面采集的英文锚点 ID，适配代码分组与 Mermaid，并将相对文档链接解析到正确的同级路径。未翻译文档通过精确的 `_redirects` 路由转到英文原文，保留 URL fragment。

### 检查

```sh
npm run check:translations
npm run build
```

校验覆盖源码快照哈希、MDX 结构、逐字代码、行内代码、链接目标、Frontmatter 和显式节点标记。中文语序允许在同一段落或表格单元格内调整行内元素位置。英文候选文本会输出到报告，供复核专有名称或漏译。全量 27 篇共有 359 个代码块、1,865 处行内代码和 408 个 Markdown 链接。

构建检查覆盖全部生成页面的站内链接、锚点、图片、重复 ID 和官方回退路由。代码保真检查不等于执行验证；八种语言的示例未逐一运行。

## 来源与更新

官方仓库：https://github.com/modelcontextprotocol/modelcontextprotocol

固定 commit：`ccaf9102ec5eb656eab50ca8333ef49dcd259c26`。获取日期：2026-10-28。协议版本目录与源码快照日期分别记录。

更新时先获取新的源码快照，比较受影响的正文与代码，再更新译文与锚点清单。不要直接覆盖已校对译文。`upstream/manifest.json` 是来源与哈希的基准。

## Cloudflare 部署

```sh
npx wrangler login
npm run deploy
```

配置中的 `account_id` 是本项目账号的公开标识，并非凭据。复用项目时改成自己的账号。API Token、OAuth 凭据和环境密钥不进入仓库。

部署脚本会重新构建后上传 `deploy/`，其中静态资源嵌套在 `mcp-zh-docs/`。正式地址为 https://docs.starlandai.com/mcp-zh-docs/ ，Cloudflare Custom Domain 管理该主机名的 DNS 与证书。Cloudflare 当前不依赖 GitHub 推送自动发布；GitHub Actions 仅检查构建。

## 许可与署名

官方文档、代码示例、图示及截图归原作者和贡献者所有。上游许可全文保留于 [upstream/LICENSE](upstream/LICENSE)；其当前说明区分文档、规范、代码与历史贡献，请按具体材料适用的许可使用。

译文改动为简体中文翻译；展示适配位于本站构建与组件层。新增站点代码采用 MIT，范围见 [LICENSE](LICENSE)。本站不将上游材料统一重新许可。
