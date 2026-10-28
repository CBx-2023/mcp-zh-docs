import { readFile } from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import { visit } from 'unist-util-visit';

export const site = JSON.parse(await readFile(new URL('../content/site.json', import.meta.url), 'utf8'));
export const manifest = JSON.parse(await readFile(new URL('../upstream/manifest.json', import.meta.url), 'utf8'));
export const parser = unified().use(remarkParse).use(remarkFrontmatter, ['yaml']).use(remarkGfm).use(remarkMdx);
export function nodes(text, type) {
  const found = [];
  visit(parser.parse(text), type, node => { found.push(node); });
  return found;
}
export const raw = (text, node) => text.slice(node.position.start.offset, node.position.end.offset);
export const sourcePath = page => `upstream/docs/${page.path}.mdx`;
export const translatedPath = page => `translations/zh-CN/${page.path}.mdx`;
