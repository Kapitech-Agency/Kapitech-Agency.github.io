const fs = require('fs');
const path = require('path');

// Directory to process (project root)
const rootDir = path.resolve(__dirname, '..', '..');

// File extensions to process
const exts = ['.tsx', '.ts', '.jsx', '.js', '.css'];

// Mapping of hex colors to CSS variable tokens
const colorMap = {
  '#111318': 'var(--k-surface)', // surface base
  '#090A0F': 'var(--k-bg)', // background app
  '#0A0A0A': 'var(--k-bg)',
  '#0B0C0E': 'var(--k-bg)',
  '#16181D': 'var(--k-surface-subtle)',
  '#0D0F12': 'var(--k-surface)',
  '#E50914': 'var(--k-red)',
  '#FF1E27': 'var(--k-red-hover)',
  '#FF6B00': 'var(--k-orange)', // if defined, else keep as is
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  // Replace Tailwind-like utility classes: bg-[#XXXXXX]
  content = content.replace(/bg-\[#([0-9A-Fa-f]{6})\]/g, (match, hex) => {
    const key = `#${hex.toUpperCase()}`;
    return colorMap[key] ? `bg-[${colorMap[key]}]` : match;
  });
  // Replace border colors
  content = content.replace(/border-\[#([0-9A-Fa-f]{6})\]/g, (m, hex) => {
    const key = `#${hex.toUpperCase()}`;
    return colorMap[key] ? `border-[${colorMap[key]}]` : m;
  });
  // Replace text colors
  content = content.replace(/text-\[#([0-9A-Fa-f]{6})\]/g, (m, hex) => {
    const key = `#${hex.toUpperCase()}`;
    return colorMap[key] ? `text-[${colorMap[key]}]` : m;
  });
  // Replace any raw hex in CSS (e.g., color: #E50914;)
  content = content.replace(/#([0-9A-Fa-f]{6})/g, (m, hex) => {
    const key = `#${hex.toUpperCase()}`;
    return colorMap[key] || m;
  });
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) continue;
      walk(fullPath);
    } else if (entry.isFile() && exts.includes(path.extname(entry.name))) {
      replaceInFile(fullPath);
    }
  }
}

walk(rootDir);
