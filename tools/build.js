#!/usr/bin/env node
/*
  Build script to emit a clean "dist/" with organized assets:
  - Moves root-level images/, audio/, videos/ to assets/images|audio|videos in dist
  - Keeps "Game pixel art/" at root in dist (survey depends on this path)
  - Copies all HTML/CSS/JS/PHP and rewrites references:
      /images/ -> /assets/images/
      /audio/  -> /assets/audio/
      /videos/ -> /assets/videos/
  - Leaves source tree untouched
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dest) {
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest, { filter } = {}) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const sp = path.join(src, e.name);
    const dp = path.join(dest, e.name);
    if (filter && !filter(sp, e)) continue;
    if (e.isDirectory()) {
      mkdirp(dp);
      copyDir(sp, dp, { filter });
    } else if (e.isFile()) {
      copyFile(sp, dp);
    }
  }
}

function rewriteContent(content) {
  // Simple path rewrites; keep absolute paths intact, just retarget folders
  return content
    .replace(/\/(images)\//g, '/assets/images/')
    .replace(/\/(audio)\//g, '/assets/audio/')
    .replace(/\/(videos)\//g, '/assets/videos/');
}

function isTextFile(file) {
  const ext = path.extname(file).toLowerCase();
  return [
    '.html', '.htm', '.css', '.js', '.json', '.md', '.php', '.txt'
  ].includes(ext);
}

function copyAndRewrite(srcRoot, destRoot) {
  const stack = [srcRoot];
  while (stack.length) {
    const dir = stack.pop();
    const rel = path.relative(srcRoot, dir);
    const outDir = path.join(destRoot, rel);
    mkdirp(outDir);
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const sp = path.join(dir, e.name);
      const rp = path.relative(srcRoot, sp);
      const dp = path.join(destRoot, rp);
      // Skip build-related folders
      if (rp.startsWith('node_modules')) continue;
      if (rp.startsWith('dist')) continue;
      if (rp.startsWith('.git')) continue;
      if (rp.startsWith('.vscode')) continue;
      if (rp.startsWith('tools')) continue; // tools copied separately below
      if (e.isDirectory()) {
        stack.push(sp);
      } else if (e.isFile()) {
        const buf = fs.readFileSync(sp);
        if (isTextFile(sp)) {
          const content = buf.toString('utf8');
          const rewritten = rewriteContent(content);
          mkdirp(path.dirname(dp));
          fs.writeFileSync(dp, rewritten);
        } else {
          copyFile(sp, dp);
        }
      }
    }
  }
}

function main() {
  rmrf(DIST);
  mkdirp(DIST);
  // Copy and rewrite all regular files
  copyAndRewrite(ROOT, DIST);

  // Ensure assets/ exists
  mkdirp(path.join(DIST, 'assets'));

  // Move media folders into assets in dist
  const mediaMap = [
    { src: path.join(DIST, 'images'), dest: path.join(DIST, 'assets', 'images') },
    { src: path.join(DIST, 'audio'), dest: path.join(DIST, 'assets', 'audio') },
    { src: path.join(DIST, 'videos'), dest: path.join(DIST, 'assets', 'videos') }
  ];
  for (const m of mediaMap) {
    if (fs.existsSync(m.src)) {
      mkdirp(path.dirname(m.dest));
      // If destination exists, merge; else move
      if (!fs.existsSync(m.dest)) mkdirp(m.dest);
      copyDir(m.src, m.dest);
      rmrf(m.src);
    }
  }

  // Keep "Game pixel art/" at root of dist (copy as-is if present)
  const gpaSrc = path.join(ROOT, 'Game pixel art');
  const gpaDest = path.join(DIST, 'Game pixel art');
  if (fs.existsSync(gpaSrc)) {
    mkdirp(gpaDest);
    copyDir(gpaSrc, gpaDest);
  }

  // Copy tools (optional) for verification into dist/tools
  const toolsSrc = path.join(ROOT, 'tools');
  const toolsDest = path.join(DIST, 'tools');
  if (fs.existsSync(toolsSrc)) {
    mkdirp(toolsDest);
    copyDir(toolsSrc, toolsDest);
  }

  console.log('Build completed. Output in dist/.');
  console.log('Rewritten paths: /images -> /assets/images, /audio -> /assets/audio, /videos -> /assets/videos');
  console.log('Game pixel art/ kept at dist root for survey compatibility.');
}

main();
