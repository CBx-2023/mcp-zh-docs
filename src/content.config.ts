import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
export const collections = {
  docs: defineCollection({
    loader:glob({pattern:'**/*.mdx',base:'./src/content/docs',generateId:({entry})=>entry.replaceAll('\\','/').replace(/\.mdx$/,'')}),
    schema:z.object({title:z.string(),description:z.string().optional(),sidebar:z.object({label:z.string()}).optional(),sourceHeadings:z.array(z.object({depth:z.number(),slug:z.string(),text:z.string()})).optional()}).passthrough(),
  }),
};
