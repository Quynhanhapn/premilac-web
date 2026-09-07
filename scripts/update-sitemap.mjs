import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const today = new Date().toISOString().slice(0, 10);
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const pages = fs.readdirSync(root)
  .filter((file) => file.endsWith('.html'))
  .filter((file) => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    return !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  })
  .sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b, 'vi')));

const blocks = pages.map((file) => {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const relativeUrl = file === 'index.html' ? '' : file;
  const canonical = `https://www.premilac.com/${relativeUrl}`;
  const image = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  let lastmod = today;
  try {
    lastmod = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' }).trim() || today;
  } catch {}

  const imageXml = image && title
    ? `\n    <image:image>\n      <image:loc>${escapeXml(image)}</image:loc>\n      <image:title>${escapeXml(title)}</image:title>\n    </image:image>`
    : '';

  return `  <url>\n    <loc>${canonical}</loc>\n    <lastmod>${lastmod}</lastmod>${imageXml}\n  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${blocks.join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);
console.log(`Đã cập nhật sitemap với ${pages.length} URL có thể lập chỉ mục.`);
