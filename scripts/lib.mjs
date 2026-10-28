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
export const canonicalPath = route => route.replace(/^\//,'').replace(/\/index$/,'');
export function localReference(ref){
  const [pathname,...tail]=ref.split(/(?=[#?])/);
  const known=new Set(site.pages.map(p=>'/'+canonicalPath(p.path)));
  let candidate=pathname.replace(/\/index\/?$/,'').replace(/\/$/,'');
  const versioned=candidate.replace(/^\/specification\/latest(?=\/|$)/,'/specification/2026-07-28');
  if(known.has(versioned))candidate=versioned;
  const extension=candidate.replace(/^\/docs\/extensions\//,'/extensions/');
  if(known.has(extension))candidate=extension;
  const normalized=(known.has(candidate)?candidate:pathname)+tail.join('');
  const historical={
    '/specification/2026-07-28/basic/authorization#dynamic-client-registration':'/specification/2026-07-28/basic/authorization/client-registration#dynamic-client-registration',
    '/specification/2026-07-28/basic/transports#stdio':'/specification/2026-07-28/basic/transports/stdio'
  };
  return historical[normalized]||normalized;
}
