import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(walk(full));
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) results.push(full);
  }
  return results;
}

const files = walk('src');
let filesChanged = 0;
let skipped = [];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('http://localhost:3000')) continue;

  const lines = original.split('\n');
  let changed = false;

  const newLines = lines.map((line, idx) => {
    if (!line.includes('http://localhost:3000')) return line;

    if (/\w="http:\/\/localhost:3000/.test(line)) {
      skipped.push(`${file}:${idx + 1}: ${line.trim()}`);
      return line;
    }

    let newLine = line;
    newLine = newLine.replace(/`http:\/\/localhost:3000/g, '`${API_BASE_URL}');
    newLine = newLine.replace(/"http:\/\/localhost:3000([^"]*)"/g, (m, rest) => '`${API_BASE_URL}' + rest + '`');
    newLine = newLine.replace(/'http:\/\/localhost:3000([^']*)'/g, (m, rest) => '`${API_BASE_URL}' + rest + '`');

    if (newLine !== line) changed = true;
    return newLine;
  });

  if (changed) {
    let content = newLines.join('\n');
    if (!/import\s*\{\s*API_BASE_URL\s*\}/.test(content)) {
      let relPath = path.relative(path.dirname(file), 'src/config/api.js').replace(/\\/g, '/').replace(/\.js$/, '');
      if (!relPath.startsWith('.')) relPath = './' + relPath;
      content = `import { API_BASE_URL } from "${relPath}";\n` + content;
    }
    fs.writeFileSync(file, content);
    filesChanged++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`\nTotal files changed: ${filesChanged}`);
if (skipped.length) {
  console.log(`\n⚠️  Manual fix needed (JSX attributes) — ${skipped.length} lines:`);
  skipped.forEach(s => console.log(s));
}
