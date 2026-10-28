---
title: 服务器示例
description: "A list of example servers and implementations"
---

本页展示多种 Model Context Protocol（MCP）服务器，体现协议的能力与灵活性。这些服务器让大语言模型（LLM）能够安全地访问工具与数据源。

## 参考实现

以下官方参考服务器展示了 MCP 的核心功能及 SDK 用法：

### 当前参考服务器

- **[Everything](https://github.com/modelcontextprotocol/servers/tree/main/src/everything)** — 包含提示模板、资源和工具的参考／测试服务器
- **[Fetch](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)** — 获取并转换 Web 内容，便于 LLM 高效使用
- **[Filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)** — 提供可配置访问控制的安全文件操作
- **[Git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)** — 读取、搜索和操作 Git 仓库的工具
- **[Memory](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)** — 基于知识图谱的持久记忆系统
- **[Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)** — 通过思维序列实现动态、反思式问题求解
- **[Time](https://github.com/modelcontextprotocol/servers/tree/main/src/time)** — 时间与时区转换能力

### 其他示例服务器（已归档）

访问 [servers-archived 仓库](https://github.com/modelcontextprotocol/servers-archived)，查看不再积极维护的归档示例服务器。

这些服务器仅供历史参考。

## 官方集成

访问 [MCP Servers 仓库的 Official Integrations 区域](https://github.com/modelcontextprotocol/servers?tab=readme-ov-file#%EF%B8%8F-official-integrations)，查看各公司为自身平台维护的 MCP Server 列表。

## 社区实现

访问 [MCP Servers 仓库的 Community 区域](https://github.com/modelcontextprotocol/servers?tab=readme-ov-file#-community-servers)，查看社区成员维护的 MCP Server 列表。

## 开始使用

### 使用参考服务器

基于 TypeScript 的服务器可以通过 `npx` 直接运行：

```bash
npx -y @modelcontextprotocol/server-memory
```

基于 Python 的服务器可以通过 `uvx`（推荐）或 `pip` 使用：

```bash
# Using uvx
uvx mcp-server-git

# Using pip
pip install mcp-server-git
python -m mcp_server_git
```

### 在 Claude 中配置

要在 Claude 中使用 MCP Server，请将其添加到配置中：

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/files"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

## 其他资源

访问 [MCP Servers 仓库的 Resources 区域](https://github.com/modelcontextprotocol/servers?tab=readme-ov-file#-resources)，查看更多 MCP 相关资源和项目。

访问我们的 [GitHub Discussions](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions)，参与 MCP 社区交流。
