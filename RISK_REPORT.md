# RISK_REPORT.md — 风险报告

> 项目：智学探险家 / AI 游戏化学生辅助教学
> 生成日期：2026-05-31
> 依据：`git status` / `git diff --stat` + `npm run typecheck`（通过）+ `npm run build`（通过）+ 代码审查。
> 本报告只评估风险，未改动任何业务代码。

---

## 1. 高风险项

| # | 风险 | 说明 | 建议 |
|---|---|---|---|
| H1 | **S2 全部改动未提交** | 工作区 12 个 modified + 16 个 untracked 文件/目录全部未进 git，与 `origin/main` 差距巨大。一次误删/`git checkout .` 即全失。 | **立即建分支提交**：`git checkout -b s2-adventure-map && git add -A`（先确认 `.env.local` 已被忽略）。分批提交便于回溯。 |
| H2 | **`.env.local.example` 不在 .gitignore，且曾被误填真 key** | `.gitignore` 只忽略 `.env*`/`.env.local`，不忽略 `.example`。审计中发现该示例文件一度写入了真实 SiliconFlow key，现已还原为占位符。若再次误填并提交即泄漏。 | 保持占位符；真 key 只放 `.env.local`。可考虑把示例改名或在 .gitignore 显式加白名单校验。**若该 key 已外泄历史，建议到 SiliconFlow 控制台吊销重置。** |

> 注：H1/H2 是“流程/安全”高风险，**不是代码错误**——代码本身 typecheck + build 均通过。

---

## 2. 可能导致页面异常的文件

| 文件 | 风险点 | 等级 |
|---|---|---|
| `components/AdventureRunner.tsx` | 多关共用的核心引擎，单点故障：任何关卡都依赖它。已通过两关手动走查，但无自动化测试兜底。 | 中 |
| `lib/learningProgress.ts` | 改了等级体系与 student/progress 同步逻辑；老用户 localStorage 旧结构靠 `defaultProgress` 合并兜底，需关注极端旧数据。 | 中 |
| `lib/adventures.ts` | 关卡配置集中地；config 字段缺失会直接让对应关卡崩。新增关卡时易漏字段。 | 中 |
| `app/adventure/multiples-sea/page.tsx` | 已从 ~700 行瘦身为薄包装；逻辑全转移到引擎，行为等价性靠手动验证。 | 低-中 |

---

## 3. 可能导致构建失败的文件

| 文件 | 风险点 | 当前状态 |
|---|---|---|
| `tailwind.config.ts` | opacity 全刻度定义是 Turbopack + Tailwind v3 的必需补丁，**删除会掉样式（非构建失败但视觉崩）**。 | 当前正确，勿删 |
| `app/api/reflect/route.ts` | 唯一动态路由（server）。若 Next/Turbopack 版本变动或 fetch 行为变化需复测；当前 `build` 已成功注册为 `ƒ /api/reflect`。 | ✅ 构建通过 |
| `next.config.ts` | `allowedDevOrigins` 含硬编码内网 IP `192.168.0.57`，仅影响 dev，不影响 build。 | ✅ |

> 实测：`npm run build` ✅ 成功，13 条路由全部编译；`npm run typecheck` ✅ 无错误。**当前无导致构建失败的文件。**

---

## 4. 图片资产风险

| 资产 | 风险 | 等级 |
|---|---|---|
| `public/assets/multiples-sea/tower-background.png` | **把「单击」文字烘焙进图里**，违反“文字由代码叠加”铁律；本次还把体积从 1.9MB 撑到 3.3MB。无法本地化、缩放糊、与代码叠加文字打架。 | 中 |
| `public/assets/multiples-sea/tower-background.png` 体积 | 3.3MB 单图偏大，移动端首屏/预加载有带宽成本。 | 低 |
| 森林岛 11 图 / map 3 图 | 文件名与 `lib/forestIslandAssets.ts` / `lib/mapAssets.ts` 严格对应，**重命名或移动会导致整关回落渐变或缺图**。 | 低（只要不动） |
| 缺图兜底 | 引擎有 `--scene-bg` 主题渐变兜底，缺图不崩，但视觉降级。 | 低 |

---

## 5. 状态管理风险

| 风险 | 说明 | 等级 |
|---|---|---|
| localStorage 单一真相源迁移 | `student.exp/coins/level` 现由 `progress` 派生。若有调用方仍直接写 `student.exp`，会被 `saveStudentAndProgress` 覆盖——属预期，但需新代码遵守约定。 | 中 |
| StrictMode 双调用副作用 | 已修复（埋点移出 `setState` 更新函数）。新代码若把副作用写回更新函数内会再次重复记录。 | 低（已修复，需规范约束） |
| 埋点环形缓冲 500 上限 | 超出丢最旧；无导出/上报出口，数据仅本地。 | 低 |
| 无后端 / 无账号 | 进度只在单浏览器；清缓存即丢，跨设备不同步。属设计取舍。 | 低 |
| AI 反思外部依赖 | `/api/reflect` 依赖 SiliconFlow + 网络 + 余额；任一缺失静默回落静态文案（不报错，但非真 AI）。 | 低 |

---

## 6. 建议先修复的问题（按顺序）

1. **【H1】提交 S2 改动到新分支**——消除丢失风险，这是最优先项。
2. **【H2】确认 SiliconFlow key 安全**——保持 `.env.local.example` 占位符；若 key 曾进入任何提交/外发，吊销重置。
3. **重导 `tower-background.png` 无字版**——去文字 + 压体积。
4. **补一条最小 CI**（typecheck + build）——锁住“能构建”这条底线。
5. （可选）清理仓库根目录的 `*.log` 调试日志，减少混淆。
