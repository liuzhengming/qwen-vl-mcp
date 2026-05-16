# qwen-vl-mcp

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)

Qwen-VL-MCP 是一个 MCP (Model Context Protocol) Server，让 Claude Desktop 等 MCP 客户端获得**图片识别**能力。它对接**通义千问 Qwen-VL-Max** 视觉模型，支持将 UI 截图、设计稿等图片内容转化为结构化文字描述，方便后续编写前端代码。

## 功能

| 工具 | 功能 |
|------|------|
| `describe_image` | 通用图片识别，返回详细文字描述 |
| `describe_ui_for_code` | 专为前端开发优化，输出结构化描述（布局、组件、样式、交互） |

## 前置要求

- Node.js >= 18
- 阿里云百炼 API Key（[免费申请](https://bailian.console.aliyun.com)）

## 安装

```bash
git clone https://github.com/your-username/qwen-vl-mcp.git
cd qwen-vl-mcp
npm install
```

## 配置环境变量

创建 `.env` 文件（**请勿提交到 Git**）：

```env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

## 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

添加以下内容：

```json
{
  "mcpServers": {
    "qwen-vl": {
      "command": "node",
      "args": ["D:/github/qwen-vl-mcp/index.js"],
      "env": {
        "DASHSCOPE_API_KEY": "你的API Key"
      }
    }
  }
}
```

保存后**重启 Claude Desktop**。

## 使用

在 Claude 对话中，直接告诉它：

```
请用 describe_ui_for_code 分析这张UI截图：C:\screenshots\login-page.png
```

Claude 会自动调用 MCP 工具识别图片并返回结构化描述，然后基于描述生成代码。

## 支持的图片格式

PNG、JPG、JPEG、WebP、GIF、BMP

## 模型费用

使用通义千问 Qwen-VL-Max，按量付费。新用户通常有免费额度。详见[百炼平台定价](https://help.aliyun.com/zh/model-studio/getting-started/models)。

## 项目结构

```
qwen-vl-mcp/
├── index.js          # MCP Server 入口
├── package.json      # 项目配置
├── .gitignore        # Git 忽略规则
├── .env.example      # 环境变量示例
├── LICENSE           # MIT 许可证
└── README.md         # 项目文档
```

## 开发

```bash
# 本地测试（需先设置环境变量）
$env:DASHSCOPE_API_KEY="你的Key"
node index.js
```

## License

MIT
