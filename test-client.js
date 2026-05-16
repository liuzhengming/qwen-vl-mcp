// test-client.js - Simple MCP client to test qwen-vl-mcp server
// Usage: node test-client.js <path-to-image>

var cp = require("child_process");
var fs = require("fs");
var path = require("path");

var imagePath = process.argv[2];
if (!imagePath) {
  console.log("Usage: node test-client.js <path-to-image>");
  console.log("Example: node test-client.js your-image.png");
  process.exit(1);
}

imagePath = path.resolve(imagePath);
if (!fs.existsSync(imagePath)) {
  console.log("Error: File not found: " + imagePath);
  process.exit(1);
}

console.log("Image: " + imagePath);
console.log("Size:  " + (fs.statSync(imagePath).size / 1024).toFixed(1) + " KB\n");

// Spawn MCP server
var server = cp.spawn("node", [path.join(__dirname, "index.js")], {
  stdio: ["pipe", "pipe", "pipe"],
});

var requestId = 0;
var pending = {};

server.stderr.on("data", function (data) {
  process.stderr.write(data);
});

server.stdout.on("data", function (data) {
  var lines = data.toString().split("\n").filter(Boolean);
  lines.forEach(function (line) {
    try {
      var msg = JSON.parse(line);
      if (msg.id && pending[msg.id]) {
        pending[msg.id](msg);
        delete pending[msg.id];
      }
    } catch (e) {}
  });
});

function send(method, params) {
  var id = ++requestId;
  var req = JSON.stringify({ jsonrpc: "2.0", id: id, method: method, params: params }) + "\n";
  return new Promise(function (resolve) {
    pending[id] = resolve;
    server.stdin.write(req);
  });
}

// Wait for server to be ready, then send requests
setTimeout(async function () {
  try {
    // Step 1: Initialize
    console.log("\n=== Step 1: Initialize ===");
    await send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test-client", version: "1.0.0" },
    });

    // Step 2: List tools
    console.log("\n=== Step 2: List Tools ===");
    var toolsResult = await send("tools/list", {});
    if (toolsResult.result && toolsResult.result.tools) {
      toolsResult.result.tools.forEach(function (t) {
        console.log("  - " + t.name);
      });
    }

    // Step 3: Call describe_ui_for_code
    console.log("\n=== Step 3: describe_ui_for_code ===");
    var result = await send("tools/call", {
      name: "describe_ui_for_code",
      arguments: {
        image_path: imagePath,
        tech_stack: "React",
      },
    });

    if (result.result && result.result.content) {
      var text = result.result.content[0].text;
      console.log("\n--- Result (" + text.length + " chars) ---");
      console.log(text.slice(0, 500));
      if (text.length > 500) console.log("...(truncated)");
    }

    console.log("\n=== Done ===");
  } catch (err) {
    console.error("Error:", err.message);
  }
  server.kill();
  process.exit(0);
}, 2000);
