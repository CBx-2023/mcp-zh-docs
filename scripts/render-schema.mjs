import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import {visit} from 'unist-util-visit';
import {load} from 'cheerio';
import {nodes,localReference} from './lib.mjs';
import {toString} from 'mdast-util-to-string';

// TypeDoc emits static HTML interleaved with Markdown headings. Rendering that
// directly avoids compiling thousands of inert signature spans into JSX calls.
export async function renderSchema(body,ids,sourceRoute){
  let index=0;
  const processor=unified().use(remarkParse).use(remarkGfm).use(()=>tree=>{
    visit(tree,'heading',node=>{
      node.data??={};node.data.hProperties??={};node.data.hProperties.id=ids[index++];
    });
  }).use(remarkRehype,{allowDangerousHtml:true}).use(rehypeStringify,{allowDangerousHtml:true});
  const compiled=String(await processor.process(body));
  const html=compiled.replace(/<(div|section|span|use)(\s[^<>]*?)?\s*\/>/g,(_,tag,attrs='')=>`<${tag}${attrs}></${tag}>`);
  const $=load(html,{},false);
  const {posix}=await import('node:path');
  $('a[href],use[href]').each((_,el)=>{
    let href=$(el).attr('href');
    if(href==='assets/icons.svg#icon-anchor')href='/assets/typedoc-icons.svg#icon-anchor';
    else if(href.startsWith('.'))href=posix.resolve('/',posix.dirname(sourceRoute),href);
    if(href.startsWith('/')&&!href.startsWith('/mcp-zh-docs/'))href='/mcp-zh-docs'+localReference(href);
    $(el).attr('href',href);
  });
  if(index!==ids.length)throw new Error(`Schema heading mismatch: ${index} vs ${ids.length}`);
  const headings=nodes(body,'heading').map((node,i)=>({depth:node.depth,slug:ids[i],text:toString(node)}));
  return {html:$.html(),headings};
}
