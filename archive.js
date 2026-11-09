#!/usr/bin/env node
// 归档当前版本：把 README、bio、徽章快照到 archive/<日期>/
// 用法：node archive.js [版本标签]
// 例：node archive.js "初三下·第一版"

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ARCHIVE = path.join(ROOT, 'archive');

const tag = process.argv[2] || '';

// 用当前日期做目录名，同一天多次归档加序号
const now = new Date();
const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
  now.getDate()
).padStart(2, '0')}`;

let dirName = ymd;
let n = 2;
while (fs.existsSync(path.join(ARCHIVE, dirName))) {
  dirName = `${ymd}-${n}`;
  n++;
}

const target = path.join(ARCHIVE, dirName);
fs.mkdirSync(target, { recursive: true });

// 复制主要文件
const files = ['README.md', 'README.en.md'];
for (const f of files) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(target, f));
}

// bio 单独复制一份
const bioSrc = path.join(ROOT, 'bio.txt');
if (fs.existsSync(bioSrc)) fs.copyFileSync(bioSrc, path.join(target, 'bio.txt'));

// 徽章快照
const badgeSrc = path.join(ROOT, 'badges');
if (fs.existsSync(badgeSrc)) {
  const bdir = path.join(target, 'badges');
  fs.mkdirSync(bdir, { recursive: true });
  for (const f of fs.readdirSync(badgeSrc)) {
    fs.copyFileSync(path.join(badgeSrc, f), path.join(bdir, f));
  }
}

// 写一个说明文件
const meta = `# 版本存档：${dirName}

- 归档时间：${now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
${tag ? `- 版本标签：${tag}\n` : ''}- 内容：当时的 README（中/英）、bio、数据徽章

这一份是当时的快照，不会随主页更新而改变。
`;
fs.writeFileSync(path.join(target, 'META.md'), meta, 'utf8');

console.log(`已归档到 archive/${dirName}/`);
console.log(`  文件: ${fs.readdirSync(target).join(', ')}`);

// 更新 archive/README.md 索引
const indexPath = path.join(ARCHIVE, 'README.md');
let entries = [];
if (fs.existsSync(indexPath)) {
  const cur = fs.readFileSync(indexPath, 'utf8');
  const m = cur.match(/<!-- ENTRIES:START -->([\s\S]*?)<!-- ENTRIES:END -->/);
  if (m) {
    entries = m[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('- '));
  }
}

entries.unshift(`- [${dirName}](./${dirName}/)${tag ? ` — ${tag}` : ''}`);

const index = `# 主页历史版本

这里保存每一版 GitHub 主页的快照。想看当时写了什么，点进对应日期即可。

最新版永远在仓库根目录，这里是存档。

<!-- ENTRIES:START -->
${entries.join('\n')}
<!-- ENTRIES:END -->
`;
fs.writeFileSync(indexPath, index, 'utf8');
console.log(`索引已更新，共 ${entries.length} 个版本`);
