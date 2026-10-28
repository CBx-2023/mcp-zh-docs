export const base='/mcp-zh-docs';
export const local=(path:string)=>`${base}/${path.replace(/^\//,'')}`;
const prefix='docs/2026-07-28/';
export const groups=[
 {title:'快速开始',items:[{label:'什么是 MCP？',path:prefix+'getting-started/intro'}]},
 {title:'关于 MCP',items:[{label:'架构概览',path:prefix+'learn/architecture'},{label:'服务器',path:prefix+'learn/server-concepts'},{label:'客户端',path:prefix+'learn/client-concepts'},{label:'版本管理',path:prefix+'learn/versioning'}]},
 {title:'使用 MCP 开发',items:[
  {label:'连接本地 MCP Server',path:prefix+'develop/connect-local-servers'},
  {label:'连接远程 MCP Server',path:prefix+'develop/connect-remote-servers'},
  {label:'借助 Agent Skills 构建',path:prefix+'develop/build-with-agent-skills'},
  {label:'构建 MCP Server',path:prefix+'develop/build-server'},
  {label:'客户端',children:[{label:'构建 MCP Client',path:prefix+'develop/build-client'},{label:'客户端最佳实践',path:prefix+'develop/clients/client-best-practices'}]},
  {label:'SDK',path:prefix+'sdk'},
  {label:'安全',children:[{label:'理解 MCP 授权',path:prefix+'tutorials/security/authorization'},{label:'安全最佳实践',path:prefix+'tutorials/security/security_best_practices'},{label:'本地服务器安全',path:prefix+'tutorials/security/local-server-security'}]},
 ]},
 {title:'开发工具',items:[{label:'Inspector',children:[
  {label:'概览',path:prefix+'tools/inspector'},
  ...[['Web 客户端','web'],['CLI 客户端','cli'],['TUI 客户端','tui'],['mcpdo 连接客户端','mcpdo'],['配置与参数','configuration'],['授权','authorization'],['协议时代','protocol-eras'],['实践指南','recipes'],['安全','security']].map(([label,p])=>({label,path:prefix+'tools/inspector/'+p})),
 ]},{label:'调试',path:prefix+'tools/debugging'}]},
 {title:'示例',items:[{label:'服务器示例',path:'examples'}]},
];
