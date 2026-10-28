import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import { remarkCompatibility } from './scripts/remark-compat.mjs';
export default defineConfig({
  site: 'https://docs.starlandai.com',
  base: '/mcp-zh-docs',
  trailingSlash: 'always',
  markdown: { processor: unified({ smartypants:false, remarkPlugins:[remarkCompatibility] }) },
  integrations: [
    expressiveCode({ themes:['github-light','github-dark'], defaultLocale:'zh-CN', shiki:{langAlias:{env:'dotenv'}}, styleOverrides:{borderRadius:'0.75rem',codeFontSize:'0.8125rem'} }),
    mdx({optimize:true}),
  ],
});
