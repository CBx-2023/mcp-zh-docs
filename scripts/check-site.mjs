import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { site, nodes, sourcePath } from './lib.mjs';

const entries = await readdir('dist',{recursive:true});
const htmlFiles = entries.filter(p=>p.endsWith('.html'));
const redirects = (await readFile('dist/_redirects','utf8')).split('\n').filter(Boolean).map(row=>row.split(/\s+/));
const redirectPaths = new Set(redirects.map(row=>row[0]));
const documents = new Map();
const errors = [];
for(const file of htmlFiles) {
  const $=load(await readFile(path.join('dist',file),'utf8'));
  const ids=new Set();
  $('[id]').each((_,el)=>{
    const id=$(el).attr('id');
    if(ids.has(id)) errors.push(`${file}: duplicate ID ${id}`);
    ids.add(id);
  });
  documents.set(file,{$,ids});
}
let links=0,images=0;
for(const [file,{$}] of documents) {
  if(file==='404.html') continue;
  const base='https://local.invalid/'+file.replace(/index\.html$/,'');
  for(const element of $('a[href],img[src]').toArray()) {
    const isImage=element.tagName==='img';
    const ref=$(element).attr(isImage?'src':'href');
    if(!ref || /^(mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    const url=new URL(ref,base);
    if(url.origin!=='https://local.invalid') continue;
    if(isImage) images++; else links++;
    const pathname=decodeURIComponent(url.pathname);
    if(redirectPaths.has(pathname)) continue;
    const rel=pathname.replace(/^\/mcp-zh-docs\/?/,'').replace(/^\//,'');
    const target=documents.has(path.posix.join(rel,'index.html'))?path.posix.join(rel,'index.html'):rel;
    if(!existsSync(path.join('dist',target))) { errors.push(`${file}: missing ${ref}`); continue; }
    if(url.hash && documents.has(target)) {
      const hash=decodeURIComponent(url.hash.slice(1));
      if(!documents.get(target).ids.has(hash)) errors.push(`${file}: missing anchor ${ref}`);
    }
  }
}
const headings=JSON.parse(await readFile('src/generated/headings.json','utf8'));
for(const page of site.pages) {
  const doc=documents.get(`${page.path}/index.html`);
  assert.ok(doc,`Missing translation page ${page.path}`);
  for(const id of headings[page.path]) if(!doc.ids.has(id)) errors.push(`${page.path}: lost original anchor ${id}`);
  const expected=nodes(await readFile(sourcePath(page),'utf8'),'code').filter(n=>n.lang!=='mermaid').length;
  if(doc.$('pre').length<expected) errors.push(`${page.path}: missing rendered code blocks`);
}
assert.ok(entries.some(f=>f==='pagefind/pagefind.js'),'Search index not generated');
await writeFile('reports/site-validation.json',JSON.stringify({pages:htmlFiles.length,internalLinks:links,images,englishFallbackRoutes:redirects.length,errors},null,2)+'\n');
assert.equal(errors.length,0,errors.join('\n'));
console.log(`✓ ${htmlFiles.length} pages, ${links} internal links, ${images} images, all original heading anchors and search assets checked.`);
