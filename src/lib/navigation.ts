import navigation from '../../content/navigation.json';
export const base='/mcp-zh-docs';
export const canonicalPath=(path:string)=>path.replace(/^\//,'').replace(/\/index$/,'');
export const local=(path:string)=>`${base}/${canonicalPath(path)}`;
export const sections=navigation;
export const sectionFor=(path:string):keyof typeof navigation=>path.startsWith('specification/')?'specification':path.startsWith('extensions/')?'extensions':'docs';
export const groups=navigation.docs.groups;
