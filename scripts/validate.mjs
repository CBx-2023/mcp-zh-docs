import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { visit } from 'unist-util-visit';
import { site, manifest, parser, nodes, raw, sourcePath, translatedPath } from './lib.mjs';

const sha = data => createHash('sha256').update(data).digest('hex');
const report = { upstreamCommit: manifest.commit, pages: [] };
for (const f of manifest.files) {
  assert.equal(sha(await readFile(`upstream/${f.path}`)), f.sha256, `Source snapshot changed: ${f.path}`);
}
for(const asset of manifest.assets??[]) assert.equal(sha(await readFile(asset.path)),asset.sha256,`Source asset changed: ${asset.path}`);
for(const anchor of manifest.anchors??[]) assert.equal(sha(await readFile(anchor.path)),anchor.sha256,`Source anchors changed: ${anchor.path}`);
const requested=process.argv.slice(2);
const pages=requested.length?requested.map(path=>({path})):site.pages;
for (const page of pages) {
  const en = await readFile(sourcePath(page), 'utf8');
  const zh = await readFile(translatedPath(page), 'utf8');
  const enTree = parser.parse(en), zhTree = parser.parse(zh);
  // Compare AST shape while allowing only natural language and explicit visible text props.
  const shape = node => {
    if (node.type === 'text') return null;
    const item = { type: node.type };
    for (const key of ['depth', 'ordered', 'start', 'checked', 'align', 'name', 'url', 'title', 'identifier', 'label', 'lang', 'meta']) {
      if (node[key] !== undefined) item[key] = node[key];
    }
    if (node.type === 'link' || node.type === 'image') delete item.title;
    if (node.attributes) item.attributes = node.attributes.map(a => {
      if (a.type === 'mdxJsxAttribute' && ['title','tip','alt','aria-label','caption'].includes(a.name) && typeof a.value === 'string') return { name: a.name, value: '<translated>' };
      return { name: a.name, value: typeof a.value === 'object' ? a.value?.value : a.value };
    });
    if (['inlineCode', 'code', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm'].includes(node.type)) item.value = node.value;
    if (node.children) {
      item.children = node.children.map(shape).filter(Boolean);
      // Chinese word order may move inline links/code within the same paragraph.
      if (['paragraph','heading','tableCell','mdxJsxTextElement'].includes(node.type)) item.children.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }
    return item;
  };
  try { assert.deepEqual(shape(zhTree),shape(enTree)); }
  catch {
    await mkdir('.work',{recursive:true});
    await writeFile('.work/shape-en.json',JSON.stringify(shape(enTree),null,2));
    await writeFile('.work/shape-zh.json',JSON.stringify(shape(zhTree),null,2));
    throw new Error(`MDX structure changed: ${page.path}; inspect .work/shape-*.json`);
  }
  for (const type of ['code','inlineCode','mdxFlowExpression','mdxTextExpression','mdxjsEsm']) {
    const protectedEn = nodes(en,type).map(n=>raw(en,n));
    const protectedZh = nodes(zh,type).map(n=>raw(zh,n));
    if(type === 'inlineCode') { protectedEn.sort(); protectedZh.sort(); }
    assert.deepEqual(protectedZh, protectedEn, `${type} bytes changed: ${page.path}`);
  }
  const cleanYaml = text => raw(text,nodes(text,'yaml')[0]).replace(/^title:.*$/m, 'title: <translated>');
  assert.equal(cleanYaml(zh), cleanYaml(en), `Frontmatter changed beyond title: ${page.path}`);
  const markers = text => text.match(/\{#[^}]+\}/g) ?? [];
  assert.deepEqual(markers(zh), markers(en), `Explicit anchor markers changed: ${page.path}`);
  const textNodes = nodes(zh,'text').map(n=>n.value).filter(s=>/[A-Za-z]{3}/.test(s) && !/[\u3400-\u9fff]/.test(s));
  const result = { path: page.path, codeBlocks: nodes(en,'code').length, inlineCode: nodes(en,'inlineCode').length, headings: nodes(en,'heading').length, links: nodes(en,'link').length, untranslatedCandidates: [...new Set(textNodes)] };
  report.pages.push(result);
  console.log(`✓ ${page.path}: ${result.codeBlocks} code blocks, ${result.links} links; protected content identical`);
}
await mkdir('reports',{recursive:true});
await writeFile('reports/translation-validation.json',JSON.stringify(report,null,2)+'\n');
