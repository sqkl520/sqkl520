// 每日自动更新 README.md 中的数据徽章
// 只重写 <!-- STATS:START --> 与 <!-- STATS:END --> 之间的内容
const fs = require('fs');
const path = require('path');

const USER = 'sqkl520';
const ROOT = __dirname;
const README = path.join(ROOT, 'README.md');
const START = '<!-- STATS:START -->';
const END = '<!-- STATS:END -->';

const BADGES = [
  ['星标', 'star', 'f59e0b', true],
  ['项目', 'repos', '238636', true],
  ['关注者', 'followers', '58a6ff', false],
  ['合并PR', 'merged_prs', '8957e5', false],
];

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

// 我提过 PR 的外部仓库（定表，逐个精确统计，不依赖 search 索引）
// 新增贡献过的仓库时在这里补一行
const EXTERNAL_REPOS = [
  'nan-tang-xi-xi-owo/BackupStudio',
  'happy66dev/ServerWeb',
  'YsGqHY/BlackBoxPro',
];

async function api(p) {
  const url = 'https://api.github.com' + p;
  const res = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      Accept: 'application/vnd.github+json',
      'User-Agent': USER + '-profile-stats',
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${p}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

async function fetchStats() {
  const user = await api(`/users/${USER}`);

  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await api(`/users/${USER}/repos?per_page=100&page=${page}`);
    if (!batch.length) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  const own = repos.filter((r) => !r.fork);
  const stars = own.reduce((s, r) => s + r.stargazers_count, 0);

  // 已合并的对外 PR：逐个仓库查 PR 列表并按作者过滤，
  // 不走 search API —— GITHUB_TOKEN 在 Actions 里的搜索结果会偏少
  let merged = 0;
  for (const repo of EXTERNAL_REPOS) {
    try {
      for (let page = 1; ; page++) {
        const prs = await api(`/repos/${repo}/pulls?state=closed&per_page=100&page=${page}`);
        const hit = prs.filter((p) => p.merged_at && p.user && p.user.login === USER);
        merged += hit.length;
        if (prs.length < 100) break;
      }
    } catch (e) {
      console.log(`跳过 ${repo}: ${e.message.slice(0, 60)}`);
    }
  }

  console.log(`stats: star=${stars} repos=${own.length} followers=${user.followers} merged_prs=${merged}`);
  return { star: stars, repos: own.length, followers: user.followers, merged_prs: merged };
}

function badge(label, value, color, withLogo) {
  let q = '?style=flat-square';
  if (withLogo) q += '&logo=github&logoColor=white';
  const src =
    'https://img.shields.io/badge/' +
    encodeURIComponent(label) +
    '-' +
    encodeURIComponent(String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) +
    `-${color}${q}`;
  return `  <img alt="${label}" src="${src}">`;
}

function buildBlock(stats) {
  const imgs = BADGES.map(([label, key, color, logo]) => badge(label, stats[key], color, logo));
  return '<p align="center">\n' + imgs.join('\n') + '\n</p>';
}

(async () => {
  const content = fs.readFileSync(README, 'utf8');
  if (!content.includes(START) || !content.includes(END)) {
    throw new Error(`README.md 中找不到 ${START} ... ${END} 标记块`);
  }

  const block = buildBlock(await fetchStats());
  const re = new RegExp(
    START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '[\\s\\S]*?' +
      END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const updated = content.replace(re, `${START}\n${block}\n${END}`);

  if (updated === content) {
    console.log('数据无变化');
    return;
  }
  fs.writeFileSync(README, updated, 'utf8');
  console.log('已更新 README.md 数据徽章');
})().catch((e) => {
  console.error('失败:', e.message);
  process.exit(1);
});
