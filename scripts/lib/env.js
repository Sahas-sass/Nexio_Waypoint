const fs = require("fs");
const path = require("path");

const ENV_FILES = ["../.env", "../api-backend/.env", "../web-portals/.env.local"];

/** Loads KEY=VALUE pairs from the project env files without overriding real env vars. */
function loadEnv() {
  for (const rel of ENV_FILES) {
    const file = path.resolve(__dirname, "..", rel);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
      const match = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

module.exports = { loadEnv };
