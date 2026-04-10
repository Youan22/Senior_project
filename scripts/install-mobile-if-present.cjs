/**
 * Runs `npm install` in mobile/ only when that folder exists (optional in this repo).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const mobileDir = path.join(root, "mobile");
const pkg = path.join(mobileDir, "package.json");

if (fs.existsSync(pkg)) {
  console.log("Installing mobile/ dependencies...");
  execSync("npm install", { cwd: mobileDir, stdio: "inherit" });
} else {
  console.log("Skipping mobile/: not present in this checkout.");
}
