// 生成 flat-square 风格 SVG 徽章，自包含不依赖 shields.io
// 字符宽度用 Verdana 实测表，保证左右留白均匀、文字居中
const fs = require('fs');
const path = require('path');

const ICONS = {};
for (const name of ['github', 'qq', 'bilibili', 'deepseek']) {
  const p = path.join(__dirname, 'icons', name + '.txt');
  if (fs.existsSync(p)) ICONS[name] = fs.readFileSync(p, 'utf8').trim();
}

// Verdana 11px 下各字符的实际宽度（单位 px，来自字体度量）
const W = {
  ' ': 4.0, '!': 4.6, '"': 5.8, '#': 8.1, '$': 7.0, '%': 11.4, '&': 8.8, "'": 3.2,
  '(': 5.2, ')': 5.2, '*': 5.7, '+': 8.1, ',': 4.0, '-': 4.6, '.': 4.0, '/': 5.6,
  '0': 7.0, '1': 7.0, '2': 7.0, '3': 7.0, '4': 7.0, '5': 7.0, '6': 7.0, '7': 7.0,
  '8': 7.0, '9': 7.0, ':': 4.6, ';': 4.6, '<': 8.1, '=': 8.1, '>': 8.1, '?': 6.4,
  '@': 12.3, A: 7.5, B: 7.4, C: 7.4, D: 8.0, E: 6.6, F: 6.2, G: 8.0, H: 7.9,
  I: 4.2, J: 4.9, K: 7.2, L: 5.8, M: 9.2, N: 7.9, O: 8.4, P: 6.7, Q: 8.4, R: 7.5,
  S: 6.7, T: 6.3, U: 7.7, V: 7.4, W: 10.4, X: 7.1, Y: 6.6, Z: 6.5,
  '[': 5.2, '\\': 5.6, ']': 5.2, '^': 8.1, _: 7.0, '`': 5.0,
  a: 6.9, b: 7.2, c: 6.1, d: 7.2, e: 6.7, f: 4.2, g: 7.2, h: 7.2, i: 3.1,
  j: 4.0, k: 6.5, l: 3.1, m: 11.0, n: 7.2, o: 7.1, p: 7.2, q: 7.2, r: 4.6,
  s: 5.9, t: 4.5, u: 7.2, v: 6.5, w: 9.7, x: 6.4, y: 6.5, z: 5.8,
  '{': 5.6, '|': 5.2, '}': 5.6, '~': 8.1,
};

function charW(ch) {
  const c = ch.codePointAt(0);
  if (W[ch] !== undefined) return W[ch];
  if (c >= 0x2e80) return 11; // CJK 全宽
  return 7; // 兜底
}

function textWidth(s) {
  let w = 0;
  for (const ch of s) w += charW(ch);
  return w;
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * 生成徽章 SVG
 * @param {string} label 左侧标签
 * @param {string} value 右侧数值
 * @param {string} color 右侧背景色（不含 #）
 * @param {object} [opt] { icon: 图标名, labelColor: 左侧背景色 }
 */
function makeBadge(label, value, color, opt = {}) {
  const icon = opt.icon || null;
  const labelBg = opt.labelColor || '#555';
  const iconSize = 12;
  const iconGap = 3; // 图标与文字间距
  const sidePad = 5; // 文字两侧留白

  const hasIcon = icon && ICONS[icon];
  const textW = textWidth(label);
  // 左块宽度 = 图标 + 间距 + 文字 + 两侧留白（无图标时只有文字 + 留白）
  const lw = Math.ceil((hasIcon ? iconSize + iconGap : 0) + textW + sidePad * 2);
  const vw = Math.ceil(textWidth(value) + sidePad * 2);
  const total = lw + vw;
  const h = 20;
  const fs_ = 11;
  const baseline = 14;

  const font = "Verdana,'DejaVu Sans',Geneva,sans-serif";

  // 图标和文字整体在左块内居中
  const contentW = (hasIcon ? iconSize + iconGap : 0) + textW;
  const contentX = (lw - contentW) / 2;
  const iconX = contentX;
  const iconY = (h - iconSize) / 2;
  const textCx = contentX + (hasIcon ? iconSize + iconGap : 0) + textW / 2;

  let iconSvg = '';
  if (hasIcon) {
    iconSvg = `<g transform="translate(${iconX.toFixed(2)},${iconY}) scale(${iconSize / 24})"><path fill="#fff" d="${
      ICONS[icon]
    }"/></g>`;
  }

  const valueCx = lw + vw / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${h}" role="img" aria-label="${esc(
    label
  )}: ${esc(value)}">
  <title>${esc(label)}: ${esc(value)}</title>
  <g shape-rendering="crispEdges">
    <rect width="${lw}" height="${h}" fill="${labelBg}"/>
    <rect x="${lw}" width="${vw}" height="${h}" fill="#${color}"/>
  </g>
  ${iconSvg}
  <g font-family="${font}" font-size="${fs_}" text-anchor="middle">
    <text x="${textCx.toFixed(2)}" y="${baseline + 1}" fill="#010101" fill-opacity=".35">${esc(label)}</text>
    <text x="${textCx.toFixed(2)}" y="${baseline}" fill="#fff">${esc(label)}</text>
    <text x="${valueCx}" y="${baseline + 1}" fill="#010101" fill-opacity=".35">${esc(value)}</text>
    <text x="${valueCx}" y="${baseline}" fill="#fff">${esc(value)}</text>
  </g>
</svg>
`;
}

module.exports = { makeBadge, textWidth, ICONS };
