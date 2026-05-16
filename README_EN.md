# qwen-vl-mcp

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)

> Bring vision capabilities to Claude Desktop via Alibaba Cloud Qwen-VL-Max  
> [中文文档](README.md)

qwen-vl-mcp is an MCP (Model Context Protocol) Server that gives Claude Desktop the ability to **see and understand images**. It connects to Alibaba Cloud's **Qwen-VL-Max** vision model, converting UI screenshots, design mockups, and other images into structured text descriptions — perfect for screenshot-to-code workflows.

## Features

| Tool | Description |
|------|-------------|
| `describe_image` | General-purpose image recognition with detailed text description |
| `describe_ui_for_code` | UI-specialized analysis, returns structured output (layout, components, styles, interactions) optimized for frontend code generation |

## Prerequisites

- Node.js >= 18
- Alibaba Cloud DashScope API Key ([Get one free](https://bailian.console.aliyun.com))

## Installation

```bash
git clone https://github.com/liuzhengming/qwen-vl-mcp.git
cd qwen-vl-mcp
npm install
```

## Configuration

### 1. Set your API Key

Create a `.env` file in the project root (**do NOT commit this**):

```env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

Or set it as an environment variable:

```bash
# Windows PowerShell
$env:DASHSCOPE_API_KEY="your-key"

# macOS / Linux
export DASHSCOPE_API_KEY="your-key"
```

### 2. Configure Claude Desktop

Edit your Claude Desktop config file:

| Platform | Path |
|----------|------|
| Windows | `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

Add the `qwen-vl` server entry:

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

Save and **restart Claude Desktop**.

## Usage

Once configured, ask Claude to analyze images directly in chat:

> Please use describe_ui_for_code to analyze this UI screenshot: `C:\screenshots\login-page.png`, implement with React

Claude automatically invokes the MCP tool, returns a structured description, and generates code.

### Tool Parameters

**describe_image**:
- `image_path` (required) — Absolute path to the image
- `custom_prompt` (optional) — Custom description prompt

**describe_ui_for_code**:
- `image_path` (required) — Absolute path to the UI screenshot
- `tech_stack` (optional) — Target tech stack: `React`, `Vue`, `HTML/CSS`, etc. Default: `React`

## Supported Image Formats

PNG, JPG, JPEG, WebP, GIF, BMP

## Pricing

Qwen-VL-Max charges per token. New users usually get free credits. See [DashScope Pricing](https://help.aliyun.com/zh/model-studio/getting-started/models).

## Project Structure

```
qwen-vl-mcp/
├── index.js          # MCP Server entry point
├── package.json      # Project metadata
├── .gitignore        # Git ignore rules
├── .env.example      # Environment template
├── LICENSE           # MIT License
├── README.md         # Chinese Docs
└── README_EN.md      # English Docs
```

## Development

```bash
# Install deps
npm install

# Start server
npm start

# Dev mode (auto-restart on changes)
npm run dev
```

## License

MIT © [@liuzhengming](https://github.com/liuzhengming)
