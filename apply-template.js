/**
 * 模板套用腳本
 * 讀取 template-config.json，將 HTML 中的 {{KEY}} 替換為設定值，輸出到 output 資料夾。
 * 使用方式：node apply-template.js
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'template-config.json');
const OUTPUT_DIR = path.join(__dirname, 'output');
const SRC_DIR = __dirname;

// 要處理的 HTML 檔案（根目錄）
const HTML_FILES = ['index.html', 'myan66.html', 'a80.html'];

function loadConfig() {
  const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
  const data = JSON.parse(raw);
  const config = {};
  for (const key of Object.keys(data)) {
    if (key.startsWith('_')) continue;
    config[key] = String(data[key]);
  }
  return config;
}

function applyReplacements(content, config) {
  let out = content;
  for (const [key, value] of Object.entries(config)) {
    const placeholder = `{{${key}}}`;
    out = out.split(placeholder).join(value);
  }
  return out;
}

function main() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('找不到 template-config.json');
    process.exit(1);
  }

  const config = loadConfig();
  console.log('已讀取設定，共', Object.keys(config).length, '個替換項目');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 複製整個專案結構到 output（保留 assets、favicon 等）
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const e of entries) {
      const s = path.join(src, e.name);
      const d = path.join(dest, e.name);
      if (e.isDirectory()) {
        copyDir(s, d);
      } else {
        fs.copyFileSync(s, d);
      }
    }
  };

  const dirsToCopy = ['assets', 'article'];
  try {
    if (fs.existsSync(path.join(SRC_DIR, 'favicon.ico'))) {
      fs.copyFileSync(path.join(SRC_DIR, 'favicon.ico'), path.join(OUTPUT_DIR, 'favicon.ico'));
    }
  } catch (_) {}
  for (const dir of dirsToCopy) {
    const src = path.join(SRC_DIR, dir);
    if (fs.existsSync(src)) copyDir(src, path.join(OUTPUT_DIR, dir));
  }

  const htmlSet = new Set(HTML_FILES);
  const allHtml = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.html'));
  for (const file of allHtml) {
    const srcPath = path.join(SRC_DIR, file);
    const outPath = path.join(OUTPUT_DIR, file);
    if (!fs.existsSync(srcPath)) continue;
    const content = fs.readFileSync(srcPath, 'utf8');
    const result = htmlSet.has(file) ? applyReplacements(content, config) : content;
    fs.writeFileSync(outPath, result, 'utf8');
    console.log(htmlSet.has(file) ? '已輸出（已替換）: ' + file : '已複製: ' + file);
  }
  const processed = Math.min(HTML_FILES.length, allHtml.length);

  // sitemap.xml、robots.txt：套用 {{SITE_URL}} 後輸出
  const extraFiles = ['sitemap.xml', 'robots.txt', 'llms.txt', 'og-image.png', 'BingSiteAuth.xml'];
  const textExts = new Set(['.xml', '.txt', '.html']);
  for (const file of extraFiles) {
    const srcPath = path.join(SRC_DIR, file);
    const outPath = path.join(OUTPUT_DIR, file);
    if (fs.existsSync(srcPath)) {
      const ext = path.extname(file).toLowerCase();
      if (textExts.has(ext)) {
        const content = fs.readFileSync(srcPath, 'utf8');
        fs.writeFileSync(outPath, applyReplacements(content, config), 'utf8');
      } else {
        // Binary file: copy as-is
        fs.copyFileSync(srcPath, outPath);
      }
      console.log('已輸出: ' + file);
    }
  }

  // 複製 config 到 output 以便日後查閱
  fs.copyFileSync(CONFIG_FILE, path.join(OUTPUT_DIR, 'template-config.json'));
  console.log('\n完成。客製化網站已輸出至 output 資料夾。');
}

main();
