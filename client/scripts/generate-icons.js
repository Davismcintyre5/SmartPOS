// scripts/generate-icons.js
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputFile = path.join(__dirname, "..", "public", "logo.png");

async function generateIcons() {
  try {
    await sharp(inputFile).resize(192, 192).png().toFile(path.join(__dirname, "..", "public", "icon-192.png"));
    console.log("icon-192.png created");

    await sharp(inputFile).resize(512, 512).png().toFile(path.join(__dirname, "..", "public", "icon-512.png"));
    console.log("icon-512.png created");

    console.log("Icons generated successfully!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

generateIcons();