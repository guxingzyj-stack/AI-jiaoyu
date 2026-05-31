# PROJECT_STATUS.md — 项目当前状态

> 项目：智学探险家 / AI 游戏化学生辅助教学
> 技术栈：Next.js 16.2.6 (App Router, Turbopack) · React 19 · TypeScript 5.8 · Tailwind v3 · 纯前端 localStorage 状态，无后端数据库
> 生成日期：2026-05-31
> 本文件由审计自动生成，仅描述状态，未改动任何业务代码。

---

## 1. 当前版本状态

- **基线**：S1.5 教程岛重制版（已在 `origin/main` 提交）——`/pilot`、`/adventure`、`/challenge`、`/report`。
- **当前层（未提交）**：S2「数学星球地图 + 配置化探险引擎」，包含世界地图、通用 7-Beat 探险引擎、两个关卡、本地埋点、Beat 7 真 AI 反思。
- **Git 状态**：分支 `main`，与 `origin/main` 同步；但 **S2 全部改动尚未提交**（工作区有大量 modified + untracked 文件，见 PROJECT_HANDOVER.md / RISK_REPORT.md）。
- **构建状态**：`npm run typecheck` ✅ 通过；`npm run build` ✅ 通过（13 条路由全部编译成功）。

---

## 2. 已完成功能

### S1.5 基线（已提交）
- `/pilot`：教程/新手引导
- `/adventure`：今日冒险中心页（hub）
- `/challenge`：闯关答题（含 Nova AI 求助 L1/L2/L3、错题怪兽、每日任务）
- `/report`：星星学习报告
- 支撑页：`/monsters`（错题怪兽）、`/skills`（技能）、`/feedback`、`/asset-check`（资产自检）

### S2 新增（未提交，本地可运行）
- **`/map` 数学星球世界地图**：英雄行走/朝向/落脚/待机动画，岛屿解锁串联。
- **配置化探险引擎 `components/AdventureRunner.tsx`**：通用 7-Beat 状态机，所有关卡差异由 `lib/adventures.ts` 的 `AdventureConfig` 驱动，路由只是薄包装。
- **关卡 1 `/adventure/multiples-sea` 倍数海**：已由原 ~700 行单页重构为薄包装 + 引擎（专属美术齐全）。
- **关卡 2 `/adventure/forest-island` 森林岛**：复用同引擎，11 张专属美术已就位。
- **统一等级体系**（`lib/learningProgress.ts`）：经验为累计总经验，`computeLevel()` 每 100 exp 升 1 级；`student.exp/coins/level` 一律从 `progress` 派生（单一真相源）。
- **本地埋点 `lib/telemetry.ts`**：localStorage 环形缓冲（上限 500 条，key=`zx_adventurer_events`），覆盖探险全流程 + 闯关答题/AI 求助主流程。
- **Beat 7 真 AI 反思**：`/api/reflect` 路由调用硅基流动（SiliconFlow，OpenAI 兼容）`deepseek-ai/DeepSeek-V4-Flash`，失败/无 key 自动回落静态文案。

---

## 3. 未完成功能 / 待办

- **Beat 6 Nova 的「一句话」仍是写死文案**（`config.truthStatement`），未接 AI。
- **倍数海 `tower-background.png` 仍把「单击」文字烘焙在图里**（违反“文字由代码叠加”铁律），待按负向词规则重导无字版（见 `public/assets/forest-island/README.md` 末尾遗留待办）。
- **埋点无可视化出口**：事件只存 localStorage，无调试页/导出。
- **无自动化测试**：`package.json` 无 `test` / `test:web` 脚本，验证全靠手动 + 构建。
- **AI 反思偶有“跑题”**：模型有时不紧扣所选贴纸主题（文案本身合格）。
- 世界地图 `world-map.png` 等少量资产的精修提示词尚未补全（功能不受影响）。

---

## 4. 当前可演示路径

| 路径 | 说明 | 状态 |
|---|---|---|
| `/` | 首页 | ✅ |
| `/pilot` | 教程岛 | ✅ |
| `/map` | 数学星球世界地图（S2 新） | ✅ |
| `/adventure` | 今日冒险中心 | ✅ |
| `/adventure/multiples-sea` | 倍数海探险（7-Beat） | ✅ 美术齐全 |
| `/adventure/forest-island` | 森林岛探险（7-Beat） | ✅ 美术齐全 |
| `/challenge` | 闯关答题 + AI 求助 | ✅ |
| `/report` | 星星报告 | ✅ |
| `/monsters` `/skills` `/feedback` `/asset-check` | 支撑页 | ✅ |
| `/api/reflect` | Beat 7 真 AI 反思接口（POST） | ✅ 需 `.env.local` 配 key，否则回落静态 |

**演示建议路线**：`/map` → 进入某岛 → 走完 7-Beat 到 Beat 7（选贴纸触发 AI 反思）→ 纪念卡 → 回地图看另一岛。

---

## 5. 当前已知问题

1. **S2 改动全部未提交**——存在丢失风险，建议尽快建分支提交（见 RISK_REPORT）。
2. **`tower-background.png` 含烘焙文字**——美术债，非阻断。
3. **`/api/reflect` 依赖外部 key**——无 key 时静默回落静态文案（不报错，但非真 AI）。
4. **仓库根目录有多个 `*.log` 大日志文件**——已被 `.gitignore` 忽略，但占空间、易混淆。
5. **`.env.local.example` 不在 .gitignore**——审计时发现曾被误填真 key，已还原为占位符；务必保持占位符，真 key 只放 `.env.local`（已忽略）。
6. **无测试脚本**——回归只能靠 typecheck + build + 手动。
