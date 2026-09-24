// fix_colors.cjs
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'src');

const mappings = {
  '#E50914': 'var(--k-red)',
  '#FF1E27': 'var(--k-red-hover)',
  '#090A0F': 'var(--k-bg)',
  '#0A0A0A': 'var(--k-bg)',
  '#111318': 'var(--k-surface)',
  '#181B22': 'var(--k-surface-raised)',
  '#21252F': 'var(--k-surface-subtle)',
  '#FFFFFF': 'var(--k-text)',
  '#F8FAFC': 'var(--k-text)',
  '#8A94A6': 'var(--k-text-secondary)',
  '#64748B': 'var(--k-text-muted)',
  '#262930': 'var(--k-border)',
  '#0D0F12': 'var(--k-bg)',
  '#0B0C0E': 'var(--k-bg)',
  '#16181D': 'var(--k-surface)'
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  for (const [hex, token] of Object.entries(mappings)) {
    // Tailwind arbitrary value classes e.g., bg-[#E50914]
    const classRegex = new RegExp(`([a-zA-Z-]+)\\[${hex}\\]`, 'g');
    content = content.replace(classRegex, `$1[${token}]`);
    // Raw hex values inside CSS or style strings
    const hexRegex = new RegExp(hex, 'g');
    content = content.replace(hexRegex, token);
  }
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
    } else if (['.tsx', '.ts', '.jsx', '.js', '.css'].includes(path.extname(entry.name))) {
      replaceInFile(fullPath);
    }
  }
}

walk(srcDir);
console.log('Color token replacement complete.');
