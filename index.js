const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

// ===================== Load .env =====================
try {
  require("dotenv").config({ path: path.join(__dirname, ".env") });
} catch (_) {
  // dotenv is optional; env vars may be set directly
}

// ===================== Configuration =====================
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || "";
const DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const MODEL_NAME = "qwen-vl-max";

// ===================== Initialize OpenAI Client =====================
const client = new OpenAI({
  apiKey: DASHSCOPE_API_KEY,
  baseURL: DASHSCOPE_BASE_URL,
});

// ===================== Helper: Image to Base64 =====================
function imageToBase64(imagePath) {
  const resolved = path.resolve(imagePath);
  if (!fs.existsSync(resolved)) {
    throw new Error("Image file not found: " + resolved);
  }
  const buffer = fs.readFileSync(resolved);
  const ext = path.extname(resolved).toLowerCase();
  const mimeMap = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
  };
  const mimeType = mimeMap[ext] || "image/png";
  return { base64: buffer.toString("base64"), mimeType };
}

// ===================== Core: Call Qwen-VL =====================
async function describeImage(imagePath, customPrompt) {
  const { base64, mimeType } = imageToBase64(imagePath);
  const dataUrl = "data:" + mimeType + ";base64," + base64;

  const prompt = customPrompt ||
    "Please describe this image in detail. If it is a UI screenshot, please:\n" +
    "1. Describe the overall layout structure\n" +
    "2. List all visible UI components (buttons, inputs, navbars, cards, etc.)\n" +
    "3. Describe the color scheme and design style\n" +
    "4. Describe text content and typography\n" +
    "5. If there are interactive elements, describe their positions and possible interactions\n\n" +
    "Please be as detailed as possible so that the UI can be accurately reproduced. Write the response in Chinese.";

  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text", text: prompt },
        ],
      },
    ],
    max_tokens: 4096,
  });

  return response.choices[0].message.content;
}

// ===================== Tools =====================
const TOOLS = [
  {
    name: "describe_image",
    description:
      "Use Qwen-VL-Max vision model to recognize and describe an image. " +
      "Ideal for UI screenshots and design drafts. Returns structured text description for code generation.",
    inputSchema: {
      type: "object",
      properties: {
        image_path: {
          type: "string",
          description: "Absolute path to the image file (PNG, JPG, JPEG, WebP, GIF, BMP)",
        },
        custom_prompt: {
          type: "string",
          description: "Custom prompt for description focus. Defaults to a detailed UI description prompt.",
        },
      },
      required: ["image_path"],
    },
  },
  {
    name: "describe_ui_for_code",
    description:
      "Specifically designed for UI design screenshots. " +
      "Returns a structured description optimized for frontend code generation, including layout, components, styles, and colors.",
    inputSchema: {
      type: "object",
      properties: {
        image_path: {
          type: "string",
          description: "Absolute path to the UI screenshot",
        },
        tech_stack: {
          type: "string",
          description: "Target tech stack (React, Vue, HTML/CSS, etc). Default: React",
        },
      },
      required: ["image_path"],
    },
  },
];

// ===================== MCP Server =====================
const server = new Server(
  { name: "qwen-vl-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  var startTime = Date.now();
  console.error("\n[>>>] Request received: " + name);
  console.error("      Image: " + args.image_path);
  if (args.tech_stack) {
    console.error("      Tech stack: " + args.tech_stack);
  }

  try {
    var result = "";
    switch (name) {
      case "describe_image": {
        console.error("[...] Sending to Qwen-VL-Max for analysis...");
        result = await describeImage(args.image_path, args.custom_prompt);
        break;
      }
      case "describe_ui_for_code": {
        var techStack = args.tech_stack || "React";
        console.error("[...] Analyzing UI for " + techStack + " code generation...");
        var prompt =
          "You are a professional frontend developer. Analyze this UI design screenshot " +
          "and output a structured description suitable for writing " + techStack + " code.\n\n" +
          "Format your response as follows:\n\n" +
          "## Overall Layout\n" +
          "[Describe the overall page layout]\n\n" +
          "## Component List\n" +
          "[List all UI components with their hierarchy]\n\n" +
          "## Style Details\n" +
          "- Color scheme: [primary, secondary, background colors]\n" +
          "- Typography: [font sizes, weights, families]\n" +
          "- Spacing: [padding, margins]\n" +
          "- Visual effects: [border-radius, shadows, etc]\n\n" +
          "## Interaction Logic\n" +
          "[Describe interactions: clicks, hover, form submission, etc]\n\n" +
          "## Code Suggestions\n" +
          "[Implementation suggestions, recommended component libraries or CSS frameworks]\n\n" +
          "Write the response in Chinese.";

        result = await describeImage(args.image_path, prompt);
        break;
      }
      default:
        throw new Error("Unknown tool: " + name);
    }

    var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error("[OK] Completed in " + elapsed + "s | Response length: " + result.length + " chars");
    return { content: [{ type: "text", text: result }] };
  } catch (error) {
    var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error("[!!] Failed after " + elapsed + "s: " + error.message);
    return {
      content: [{ type: "text", text: "Error: " + error.message }],
      isError: true,
    };
  }
});

// ===================== Start =====================
async function main() {
  var banner = [
    "",
    "  ==========================================",
    "       Qwen-VL MCP Server v1.0.0",
    "   Powered by Alibaba Cloud DashScope",
    "  ==========================================",
    "",
  ].join("\n");
  console.error(banner);

  if (!DASHSCOPE_API_KEY) {
    console.error("[X] DASHSCOPE_API_KEY is not set.\n");
    console.error("    Please set it via:");
    console.error("    1. .env file at: " + __dirname);
    console.error("    2. environment variable: DASHSCOPE_API_KEY");
    console.error("    3. Claude Desktop config: mcpServers -> qwen-vl -> env\n");
    console.error("    Get your key at: https://bailian.console.aliyun.com\n");
    process.exit(1);
  }
  console.error("[*] API Key loaded successfully");
  console.error("[*] Vision Model: " + MODEL_NAME);
  console.error("[*] API Base: " + DASHSCOPE_BASE_URL + "\n");

  console.error("[*] Registered Tools (" + TOOLS.length + "):");
  TOOLS.forEach(function (tool) {
    console.error("    - " + tool.name);
  });

  console.error("\n[i] Supported formats: PNG, JPG, JPEG, WebP, GIF, BMP\n");

  console.error("[...] Connecting via stdio transport...");
  var transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[OK] Server is ready. Waiting for requests...\n");
}

main().catch(function (err) {
  console.error("[!!] Startup failed:", err.message);
  process.exit(1);
});
