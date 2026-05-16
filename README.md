# qwen-vl-mcp

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)

> 为 Claude Desktop 注入视觉能力 — 基于通义千问 Qwen-VL-Max  
> [English README](README_EN.md)

qwen-vl-mcp 是一个 MCP (Model Context Protocol) Server，让 Claude Desktop 获得**识图**能力。它对接阿里云**通义千问 Qwen-VL-Max** 视觉模型，可将 UI 截图、设计稿等图片转化为结构化文字描述，方便后续编写前端代码。

## 功能

| 工具 | 说明 |
|------|------|
| `describe_image` | 通用图片识别，返回详细文字描述 |
| `describe_ui_for_code` | 专为前端开发优化，输出结构化描述（布局、组件、样式、交互） |

## 前置要求

- Node.js >= 18
- 阿里云百炼 API Key（[免费申请](https://bailian.console.aliyun.com)）

## 安装

```bash
git clone https://github.com/liuzhengming/qwen-vl-mcp.git
cd qwen-vl-mcp
npm install
```

## 配置

### 1. 设置 API Key

在项目根目录创建 `.env` 文件（**请勿提交到 Git**）：

```env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

或设为环境变量：

```bash
# Windows PowerShell
$env:DASHSCOPE_API_KEY="your-key"

# macOS / Linux
export DASHSCOPE_API_KEY="your-key"
```

### 2. 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

| 平台 | 路径 |
|------|------|
| Windows | `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

添加 `qwen-vl` 服务：

```json
{
  "mcpServers": {
    "qwen-vl": {
      "command": "node",
      "args": ["D:/github/qwen-vl-mcp/index.js"]
    }
  }
}
```

保存后**重启 Claude Desktop**。

## 使用

配置完成后，直接在对话中让 Claude 分析图片：

> 请用 describe_ui_for_code 分析这张UI截图：`C:\screenshots\login-page.png`，用 React 实现

Claude 会自动调用 MCP 工具识别图片并返回结构化描述，然后生成对应代码。

### 工具参数

**describe_image**：
- `image_path`（必填）— 图片绝对路径
- `custom_prompt`（可选）— 自定义描述提示词

**describe_ui_for_code**：
- `image_path`（必填）— UI 截图绝对路径
- `tech_stack`（可选）— 目标技术栈：`React`、`Vue`、`HTML/CSS` 等，默认 `React`

## 支持的图片格式

PNG、JPG、JPEG、WebP、GIF、BMP

## 费用

Qwen-VL-Max 按 token 计费，新用户通常有免费额度。详见[百炼平台定价](https://help.aliyun.com/zh/model-studio/getting-started/models)。

## 项目结构

```
qwen-vl-mcp/
├── index.js          # MCP Server 入口
├── package.json      # 项目配置
├── .gitignore        # Git 忽略规则
├── .env.example      # 环境变量模板
├── LICENSE           # MIT 许可证
├── README.md         # 中文文档
└── README_EN.md      # English Docs
```

## 开发

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 开发模式（文件变更自动重启）
npm run dev
```

## License

MIT
