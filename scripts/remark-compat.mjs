import { visit } from 'unist-util-visit';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toString } from 'mdast-util-to-string';

const root = fileURLToPath(new URL('../', import.meta.url));
const element = (name,attributes,children) => ({ type:'mdxJsxFlowElement', name, attributes, children });
const attribute = (name,value) => ({type:'mdxJsxAttribute',name,value});

export function remarkCompatibility() {
  return (tree,file) => {
    const filePath = file.path.replaceAll('\\','/');
    if(!filePath.includes('/src/content/docs/'))return;
    const match = filePath.match(/src\/content\/docs\/([^.]+)\.mdx$/);
    const route = match?.[1];
    const headings = route?JSON.parse(readFileSync(path.join(root,'src/generated/headings.json'),'utf8'))[route]:null;
    let headingIndex = 0;
    let accordionIndex = 0;
    visit(tree,'heading', node => {
      if(!headings)return;
      const original = headings[headingIndex++];
      if(!original) throw new Error(`Missing source heading: ${route}: ${toString(node)}`);
      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.id = original;
    });
    visit(tree,node=>{
      // The upstream local-server guide links to an older wording of this accordion title.
      // Keep the original href and provide its historical anchor only in the rendered site.
      if(node.type==='mdxJsxFlowElement'&&node.name==='Accordion'){
        if(route==='docs/2026-07-28/develop/connect-local-servers'&&accordionIndex===1)node.attributes.push(attribute('id','getting-logs-from-claude-for-desktop'));
        accordionIndex++;
      }
      if(['link','image'].includes(node.type) && node.url.startsWith('.')&&route) node.url = path.posix.resolve('/',path.posix.dirname(route),node.url);
      if(['link','image'].includes(node.type) && node.url.startsWith('/')&&!node.url.startsWith('/mcp-zh-docs/'))node.url='/mcp-zh-docs'+node.url;
      for(const attr of node.attributes??[])if(['href','src'].includes(attr.name)&&typeof attr.value==='string'&&attr.value.startsWith('/')&&!attr.value.startsWith('/mcp-zh-docs/'))attr.value='/mcp-zh-docs'+attr.value;
      if(node.type==='mdxJsxFlowElement' && node.name==='CodeGroup') {
        node.name='Tabs';
        node.attributes=[];
        node.children = node.children.filter(c=>c.type!=='text'||c.value.trim()).map((child,index)=>{
          if(child.type!=='code') return child;
          return element('Tab',[attribute('title',child.meta || child.lang || `示例 ${index+1}`)],[child]);
        });
      }
    });
    visit(tree,'code',(node,index,parent)=>{
      if(node.lang==='mermaid') parent.children[index]=element('Mermaid',[attribute('source',node.value)],[]);
    });
    if(headings&&headingIndex!==headings.length) throw new Error(`Heading count changed: ${route}`);
  };
}
