#!/usr/bin/env node
/*
  Verifies that entries in assets/data/game-pixel-art.json map to real files
  under the root-level "Game pixel art/" folder. Prints a summary and exits
  with non-zero code if missing files are found.
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const JSON_PATH = path.join(ROOT, 'assets', 'data', 'game-pixel-art.json');
const BASE_DIR = path.join(ROOT, 'Game pixel art');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function exists(p) {
  try { fs.accessSync(p, fs.constants.F_OK); return true; } catch { return false; }
}

function walk(folderData, currentPath, report) {
  const images = folderData.images || [];
  for (const img of images) {
    const p = currentPath ? path.join(currentPath, img) : path.join(img);
    const full = path.join(BASE_DIR, p);
    if (!exists(full)) {
      report.missing.push({ path: p });
    } else {
      report.present += 1;
    }
  }
  const subfolders = folderData.subfolders || {};
  for (const [name, subfolder] of Object.entries(subfolders)) {
    const next = currentPath ? path.join(currentPath, name) : name;
    walk(subfolder, next, report);
  }
}

function main() {
  const db = readJson(JSON_PATH);
  const report = { missing: [], present: 0 };
  for (const [rootName, rootData] of Object.entries(db)) {
    walk(rootData, rootName, report);
  }
  if (report.missing.length) {
    console.log(`Missing files: ${report.missing.length}`);
    for (const m of report.missing.slice(0, 20)) {
      console.log(' -', m.path);
    }
    if (report.missing.length > 20) {
      console.log(` ... and ${report.missing.length - 20} more`);
    }
    console.log(`Present files: ${report.present}`);
    process.exitCode = 1;
  } else {
    console.log(`All referenced files exist. Count: ${report.present}`);
  }
}

main();
