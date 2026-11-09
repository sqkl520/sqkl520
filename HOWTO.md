# 怎么更新主页

这份说明是给你未来的自己看的。隔一两年想重写主页时，照着做就行。

---

## 想重写整个主页的时候

### 第一步：先归档旧版

在仓库根目录运行：

```bash
node archive.js "版本说明"
```

版本说明写一句话，比如 `高一结束`、`初三那会儿`、`第一次认真写`。这句会出现在存档索引里。

跑完以后 `archive/` 下会多出一个以日期命名的文件夹，里面有当时的 README（中英）、bio、和全部徽章。**这一步不要跳过**，不然旧版就找不回来了。

### 第二步：改 README

直接改根目录的 `README.md`（中文）和 `README.en.md`（英文）。

改完记得两件事：

1. 底部那行 `<sub>这一版写于 XXXX 年...</sub>` 里的年份要不要改
2. 中英文内容保持一致

### 第三步：更新 bio（如果改了）

```bash
gh api -X PATCH user -f bio="新的简介"
```

### 第四步：提交

```bash
git add -A
git commit -m "docs: 重写主页"
git push
```

---

## 关于徽章

数据徽章（Star / Repos / Followers / Merged PRs）是自动更新的，每天北京时间早上 6:15 跑一次。你不用管。

它是怎么工作的：

- `update-stats.js` 拉 GitHub API 拿到真实数字
- `make-badge.js` 把数字画成 SVG 存到 `badges/`
- README 引用这些 SVG
- `.github/workflows/update-stats.yml` 每天自动跑一遍，有变化就提交

**为什么不用 shields.io**：国内访问那个服务不稳定，而且 GitHub 的图片代理会把失败结果缓存住，导致徽章时不时裂图。自己的 SVG 从 GitHub 自己的域名加载，不会出问题。

### 想改徽章的样式

改 `make-badge.js` 里的参数：

- `W` 对象是字体宽度表，改字体的话要一起改
- `sidePad`、`iconGap` 控制留白
- 图标放在 `icons/` 目录，是 simpleicons 的路径数据

改完运行 `node update-stats.js` 重新生成。

### 想加新的数据项

改 `update-stats.js` 里的 `BADGES` 和 `BADGE_FILE` 两个数组，然后在 `fetchStats()` 里算出新数字。

### 外部 PR 统计

`EXTERNAL_REPOS` 数组列出了你提过 PR 的外部仓库。**如果以后你在新仓库提了 PR，记得在这里加一行**，否则不会统计进去。

`KNOWN_MERGED` 是为那些转私有、Actions 读不到的仓库准备的兜底值。

---

## 关于联系方式

`README.md` 里「找可乐」那节的徽章对应 `badges/qq.svg` 和 `badges/bilibili.svg`。

想换号码，改两处：

1. 徽章 SVG：改 `update-stats.js` 同级的生成脚本，或者直接手动改 SVG 里的文字
2. 链接：`README.md` 里 `<a href="...">` 的地址

微信没有做徽章，因为微信 ID 是纯文本，放上去会被爬。

---

## 文件都是干什么的

| 文件 | 作用 |
|---|---|
| `README.md` | 主页正文（中文） |
| `README.en.md` | 主页正文（英文） |
| `bio.txt` | 左侧那行简介，改完要手动 `gh api` 同步 |
| `archive/` | 历史版本存档 |
| `archive.js` | 归档脚本 |
| `badges/` | 生成的 SVG 徽章，自动更新 |
| `icons/` | 徽章用的图标路径数据 |
| `make-badge.js` | 画徽章 |
| `update-stats.js` | 拉数据 + 生成徽章 + 改 README |
| `.github/workflows/update-stats.yml` | 每天自动跑的定时任务 |

---

## 几个提醒

**别把真实的手机号、微信 ID 写进任何提交。** 2026 年清理过一次，三个仓库的提交历史里有 146 条带着手机号，后来整个重写历史才清掉。以后提交前检查一下 `git config user.email`。

**历史版本不用靠 git 历史找。** 虽然 git 里也有，但要翻很久。`archive/` 目录是给人看的，打开就能读。

**这个仓库就是主页。** 删掉别的仓库不影响，但删掉这个，主页就没了。
