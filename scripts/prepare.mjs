import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { load, dump } from 'js-yaml';
import { site, manifest, nodes, sourcePath, translatedPath } from './lib.mjs';

await rm('src/content/docs',{recursive:true,force:true});
await mkdir('src/content/docs',{recursive:true});
await mkdir('src/generated',{recursive:true});
const headings = {}, redirects = new Set();
const base='/mcp-zh-docs';
const translated = new Set(site.pages.map(p=>'/'+p.path));
for(const page of site.pages) {
  const en = await readFile(sourcePath(page),'utf8');
  const zh = await readFile(translatedPath(page),'utf8');
  const anchors = JSON.parse(await readFile(`upstream/anchors/${page.path.replace(/^docs\/2026-07-28\//,'')}.json`,'utf8')).filter(id=>id!=='page-title'&&!id.startsWith('_R_'));
  if(anchors.length!==nodes(en,'heading').length) throw new Error(`Source anchor mismatch: ${page.path}`);
  headings[page.path] = anchors;
  const frontmatter = nodes(zh,'yaml')[0];
  const meta = load(frontmatter.value);
  // Framework metadata lives only in generated copies. Translation frontmatter stays intact.
  const generatedMeta = { title:meta.title, description:page.description, sidebar:{label:page.label}, tableOfContents:page.path.endsWith('build-server')?{maxHeadingLevel:2}:true, editUrl:`${site.repository}/edit/main/${translatedPath(page)}` };
  const body = zh.slice(frontmatter.position.end.offset).trimStart();
  const imports = `import { Card, CardGroup, Frame, Note, Warning, Tip, Steps, Step, Tabs, Tab, Accordion, AccordionGroup, Tooltip, Mermaid, Info, Icon, Badge } from '/src/components/compat';\n\n`;
  const result=`---\n${dump(generatedMeta,{lineWidth:-1})}---\n\n${imports}${body}`;
  const target=`src/content/docs/${page.path}.mdx`;
  await mkdir(path.dirname(target),{recursive:true});
  await writeFile(target,result);
  await mkdir(path.dirname(`public/${page.path}.md`),{recursive:true});
  await writeFile(`public/${page.path}.md`,zh);
  // Both link nodes and MDX href props feed a precise English fallback routing table.
  const refs = nodes(en,'link').map(n=>n.url);
  for (const type of ['mdxJsxFlowElement','mdxJsxTextElement']) for(const n of nodes(en,type)) for(const attr of n.attributes??[]) if(attr.name==='href'&&typeof attr.value==='string') refs.push(attr.value);
  for(let ref of refs) {
    if(ref.startsWith('.')) ref=path.posix.resolve('/',path.posix.dirname(page.path),ref);
    if(!ref.startsWith('/')) continue;
    ref=ref.split('#')[0].replace(/\/$/,'');
    if(translated.has(ref)) continue;
    redirects.add(`${base}${ref} https://modelcontextprotocol.io${ref} 302`);
    redirects.add(`${base}${ref}/ https://modelcontextprotocol.io${ref} 302`);
  }
}
await writeFile('src/generated/headings.json',JSON.stringify(headings,null,2)+'\n');
await copyFile('content/translation-guide.mdx','src/content/docs/translation-guide.mdx');
// Keep the full official sidebar usable while only three pages are translated.
const nav=JSON.parse(await readFile('upstream/docs/docs.json','utf8')).navigation.tabs[0].versions[0];
function addFallback(value){
 if(typeof value==='string'&&!translated.has('/'+value))for(const slash of ['', '/'])redirects.add(`${base}/${value}${slash} https://modelcontextprotocol.io/${value} 302`);
 else if(Array.isArray(value))for(const child of value)addFallback(child);
 else if(value&&typeof value==='object')addFallback(value.pages);
}
addFallback(nav.pages);
await writeFile('public/_redirects',[
  `/ ${base}/ 302`,
  `${base} ${base}/ 301`,
  `${base}/docs/2026-07-28 ${base}/docs/2026-07-28/getting-started/intro/ 302`,
  `${base}/docs/2026-07-28/ ${base}/docs/2026-07-28/getting-started/intro/ 302`,
  ...[...redirects].sort(),
].join('\n')+'\n');
await copyFile('upstream/LICENSE','public/upstream-license.txt');
await writeFile('public/source-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Prepared ${site.pages.length} translations and ${redirects.size} English fallback routes.`);
