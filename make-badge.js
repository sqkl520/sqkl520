// 生成带图标的 flat-square SVG 徽章，完全自包含，不依赖 shields.io
// （国内访问 shields.io 不稳定，GitHub camo 代理还会缓存失败结果）
const fs = require('fs');
const path = require('path');

// 图标路径（来自 simpleicons，已内嵌，离线可用）
const ICONS = {};
for (const name of ['github', 'qq', 'bilibili']) {
  const p = path.join(__dirname, 'icons', name + '.txt');
  if (fs.existsSync(p)) ICONS[name] = fs.readFileSync(p, 'utf8').trim();
}

// Verdana 11px 字符宽度近似
function textWidth(s) {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0x2e80) w += 11;
    else if ('MW@%'.includes(ch)) w += 10;
    else if ('iljI.,:;\'|!'.includes(ch)) w += 3.5;
    else if ('mw'.includes(ch)) w += 9;
    else if ('ftr'.includes(ch)) w += 5;
    else if (ch >= '0' && ch <= '9') w += 6.5;
    else if (ch >= 'A' && ch <= 'Z') w += 7.5;
    else w += 6.5;
  }
  return Math.ceil(w);
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * @param {string} label 左侧标签
 * @param {string} value 右侧数值
 * @param {string} color 右侧背景色（不含 #）
 * @param {string} [icon] 图标名（github / qq / bilibili）
 */
function makeBadge(label, value, color, icon) {
  const h = 20;
  const fs_ = 11;
  const baseline = 14;
  const pad = 6;
  const iconW = icon && ICONS[icon] ? 14 : 0; // 图标宽 + 间距
  const iconGap = iconW ? 3 : 0;

  const labelTextW = textWidth(label);
  // 左侧宽度 = 内边距 + 图标 + 间距 + 文字 + 内边距
  const lw = Math.ceil(pad + iconW + iconGap + labelTextW + pad - (iconW ? 1 : 0));
  const vw = Math.ceil(textWidth(value) + pad * 2);
  const total = lw + vw;

  const font = "Verdana,'DejaVu Sans',sans-serif";
  let iconSvg = '';
  if (icon && ICONS[icon]) {
    const ix = pad;
    const iy = (h - 14) / 2;
    iconSvg = `<g transform="translate(${ix},${iy}) scale(${14 / 24})"><path fill="#fff" d="${ICONS[icon]}"/></g>`;
  }

  const labelX = iconW ? pad + iconW + iconGap + labelTextW / 2 : lw / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${h}" role="img" aria-label="${esc(
    label
  )}: ${esc(value)}">
  <title>${esc(label)}: ${esc(value)}</title>
  <rect width="${total}" height="${h}" fill="#555"/>
  <rect x="${lw}" width="${vw}" height="${h}" fill="#${color}"/>
  <g font-family="${font}" font-size="${fs_}" fill="#fff" text-anchor="middle">
    ${iconSvg}
    <text x="${labelX}" y="${baseline + 1}" fill="#010101" fill-opacity=".3">${esc(label)}</text>
    <text x="${labelX}" y="${baseline}">${esc(label)}</text>
    <text x="${lw + vw / 2}" y="${baseline + 1}" fill="#010101" fill-opacity=".3">${esc(value)}</text>
    <text x="${lw + vw / 2}" y="${baseline}">${esc(value)}</text>
  </g>
</svg>
`;
}

module.exports = { makeBadge, textWidth, ICONS };
