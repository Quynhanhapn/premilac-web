import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const files = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const failures = [];

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const has = (html, pattern) => pattern.test(html);

for (const file of files) {
  const html = read(file);
  const noindex = has(html, /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i);
  const checks = [
    ['title', /<title>[^<]+<\/title>/i],
    ['canonical', /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/www\.premilac\.com\//i],
  ];

  if (!noindex) {
    checks.push(
      ['description', /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{60,}/i],
      ['H1', /<h1\b/i],
      ['Open Graph title', /<meta[^>]+property=["']og:title["']/i],
      ['Open Graph image', /<meta[^>]+property=["']og:image["']/i],
      ['structured data', /application\/ld\+json/i],
    );
  }

  for (const [label, pattern] of checks) {
    if (!has(html, pattern)) failures.push(`${file}: thiếu ${label}`);
  }

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!noindex && h1Count !== 1) failures.push(`${file}: có ${h1Count} thẻ H1`);
}

const localFiles = new Set(fs.readdirSync(root));
for (const file of files) {
  const html = read(file);
  for (const match of html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/gi)) {
    let target = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(target)) continue;
    target = target.replace(/^\//, '');
    if (target && !localFiles.has(target)) failures.push(`${file}: liên kết/tệp thiếu ${match[1]}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`SEO audit đạt: ${files.length} trang, không có liên kết nội bộ hỏng.`);
