# PROJECT_HANDOVER.md — 交接文档（给 Codex）

> 项目：智学探险家 / AI 游戏化学生辅助教学
> 生成日期：2026-05-31
> 面向：接手继续开发的 Codex。本文件只描述与建议，未改动业务代码。

---

## 0. 一句话现状

S1.5 基线（pilot/adventure/challenge/report）已在 `origin/main`。在其之上，Claude 完成了 **S2：数学星球地图 + 配置化 7-Beat 探险引擎 + 两个关卡 + 本地埋点 + Beat 7 真 AI 反思**，**全部尚未提交**。`typecheck` 与 `build` 均通过。

---

## 1. 最近修改摘要（Claude 的 S2 工作）

> 说明：所有 S2 改动当前都在工作区未提交，`git` 无法在“未提交集合”内部再细分时间，但下表依据开发记录归类。

### 新增文件（untracked）
| 文件/目录 | 作用 |
|---|---|
| `components/AdventureRunner.tsx` | **核心**：通用 7-Beat 探险引擎，消费 `AdventureConfig` 渲染整关 |
| `components/BottomNav.tsx` | 底部导航 |
| `lib/adventures.ts` | **核心**：`AdventureConfig` 类型 + 两关配置（倍数海 / 森林岛）|
| `lib/adventureProgress.ts` | 岛屿完成进度（key=`zx_adventurer_island_progress`）|
| `lib/telemetry.ts` | 本地事件日志环形缓冲（key=`zx_adventurer_events`，上限 500）|
| `lib/reflection.ts` | 客户端 `getReflection()`，POST `/api/reflect`，异常回落 seed |
| `lib/reflectionPrompt.ts` | Beat 7 反思 prompt 构造 + 贴纸中文标签 |
| `lib/mockReflection.ts` | 无 key/失败时的兜底（回到静态贴纸文案）|
| `lib/mapAssets.ts` | 世界地图美术路径 |
| `lib/forestIslandAssets.ts` | 森林岛美术路径 |
| `app/map/page.tsx` | 世界地图页 |
| `app/adventure/forest-island/page.tsx` | 森林岛薄包装路由 |
| `app/api/reflect/route.ts` | 真 AI 反思服务端路由（SiliconFlow / OpenAI 兼容）|
| `public/assets/forest-island/*` | 11 张森林岛 PNG + README（含生图提示词）|
| `public/assets/map/*` | `hero-idle.png` `hero-walk.png` `world-map.png` |
| `.env.local.example` | 真 AI 配置示例（占位符 key）|

### 修改文件（tracked / modified）
| 文件 | 修改目的 | 内容 | 影响模块 | 风险 | 保留? |
|---|---|---|---|---|---|
| `app/adventure/multiples-sea/page.tsx` | 重构为薄包装 | 删 ~696 行，改为引用 `AdventureRunner`+config | 倍数海关卡 | 中 | ✅ |
| `app/challenge/page.tsx` | 接入埋点 | +3 处 `trackEvent`（答题/AI 求助/Nova 讲解）| 闯关 | 低 | ✅ |
| `lib/learningProgress.ts` | 统一等级体系 | 加 `computeLevel/EXP_PER_LEVEL`；`student.exp/coins/level` 从 `progress` 派生 | 全站经验/等级 | 中 | ✅ |
| `lib/dailyQuestEngine.ts` | 配合等级体系 | 极小改动（2 行）| 每日任务 | 低 | ✅ |
| `app/adventure/page.tsx` | 串接地图/关卡 | 入口与展示调整 | 冒险中心 | 低 | ✅ |
| `app/monsters/page.tsx` `app/report/page.tsx` `app/skills/page.tsx` | 等级/展示对齐 | 小幅（4~8 行）| 报告/技能/怪兽 | 低 | ✅ |
| `next.config.ts` | 局域网调试 | `allowedDevOrigins` 增加 `192.168.0.57` | 仅 dev | 低 | ✅（可按需改 IP）|
| `tailwind.config.ts` | 修复 Turbopack 不生成任意透明度 | 显式定义 0-100 opacity 刻度 | 全站样式 | 低 | ✅（重要，删了会掉样式）|
| `public/assets/multiples-sea/tower-background.png` | 替换图片（体积 1.9MB→3.3MB）| 二进制变更，**仍含烘焙「单击」文字** | 倍数海塔阶段 | 中 | ⚠️ 待重导无字版 |
| `next-env.d.ts` | Next 自动生成 | 无需关注 | — | 低 | ✅ |

---

## 2. 关键文件说明

- **`components/AdventureRunner.tsx`（最重要）**：单文件实现 7-Beat 状态机（地图入场→海边观察→石头题→跳岛→塔题→真相时刻→反思→纪念卡）。所有文案、数列、步长、美术、主题渐变都来自传入的 `config`。改关卡内容**不要改这里**，改 `lib/adventures.ts`。
- **`lib/adventures.ts`**：`AdventureConfig` 类型 + `multiplesSeaConfig` / `forestIslandConfig`。新增关卡 = 加一份 config + 一个薄包装路由 + 一份美术资源 lib。
- **`lib/learningProgress.ts`**：localStorage 真相源。`progress` 是 exp/coins 的唯一来源，`saveStudentAndProgress` 会把 student 的 exp/coins/level 强制同步成 progress 派生值——**调用方不要再单独写 student.exp**。
- **`lib/telemetry.ts`**：`trackEvent(event, props)` 写本地环形缓冲。副作用必须放在 `setState` 更新函数**之外**（React StrictMode 会双调用更新函数，否则一条动作记两次——这是已修复的真实 bug）。
- **`app/api/reflect/route.ts`**：服务端调用 AI。默认 `https://api.siliconflow.cn/v1` + `deepseek-ai/DeepSeek-V4-Flash`，可用 `AI_BASE_URL`/`AI_MODEL` 覆盖，key 读 `SILICONFLOW_API_KEY`（兼容 `AI_API_KEY`/`OPENAI_API_KEY`）。

---

## 3. 当前业务逻辑说明

### 探险 7-Beat（引擎核心）
1. map_intro → 2. beach_observe → 3. stone_question（第一段数字路，答对继续）→ 4. island_jump → 5. tower_question（3 段递进数列）→ 6. truth_moment（Nova 故意把规律过度概括）+ 可选「真相探测器」→ 7. reflection（选贴纸触发 AI 复盘）→ complete（纪念卡，首次完成静默发放 exp/coins，重玩不重复发放）。

### 状态与持久化（localStorage keys）
- `zx_adventurer_student`：学生档案（exp/coins/level 派生自 progress）
- `zx_adventurer_progress`：学习进度（attempts/mistakes/monsters/aiHelpRecords/skillTelemetry…，**exp/coins 真相源**）
- `zx_adventurer_island_progress`：已完成岛屿
- `zx_adventurer_events`：埋点事件（环形 500）

### AI 调用链
- 闯关求助 `lib/aiTutor.ts`：当前在客户端调用 → 实际始终走 `mockAiTutor`（OpenAI 分支仅服务端生效，客户端不触发）。**真 AI 目前只有 Beat 7 反思走通**。
- Beat 7：`AdventureRunner.chooseReflection` → `lib/reflection.getReflection` → `POST /api/reflect` → SiliconFlow；任何失败回落静态贴纸文案，孩子永不见报错。

---

## 4. 下一步建议（优先级从高到低）

1. **先提交 S2**：当前所有改动未提交，建议 `git checkout -b s2-adventure-map` 后分批提交（引擎/关卡/埋点/AI 各一提交），避免丢失。
2. **重导 `tower-background.png` 无字版**：按 `public/assets/forest-island/README.md` 的负向词规则去掉「单击」，保持“文字由代码叠加”。
3. **统一 AI 调用层**：把 `aiTutor` 也改走服务端路由（如 `/api/tutor`），复用 `/api/reflect` 同款 OpenAI 兼容客户端，让闯关求助也能用真 AI。
4. **Beat 6 真 AI**（可选）：把 `config.truthStatement` 接到 AI。
5. **埋点出口**：加一个仅本地的调试页或导出按钮读取 `zx_adventurer_events`。
6. **补测试**：哪怕先加 `typecheck`+`build` 的 CI 或少量冒烟测试。

---

## 5. 给 Codex 的注意事项（务必先读）

- **改关卡内容改 `lib/adventures.ts`，不要改 `AdventureRunner.tsx`**；引擎是多关共用的。
- **不要在 `setState` 更新函数里写埋点/副作用**——StrictMode 双调用会重复记录（已踩过坑）。
- **exp/coins 只通过 `progress` 改**，再调 `saveStudentAndProgress`；别直接写 `student.exp`，否则两份数据漂移。
- **真 key 只放 `.env.local`（已被 git 忽略）**；`.env.local.example` 永远保持占位符，别提交真 key。
- **`tailwind.config.ts` 里的 opacity 全刻度定义不能删**：Turbopack + Tailwind v3 不会 JIT 生成任意透明度（如 `bg-x/72`），删了会大面积掉样式。
- **资产路径大小写/命名敏感**：森林岛 11 图、map 3 图、倍数海各图的文件名与 `lib/*Assets.ts` 一一对应，别重命名/移动。
- **纯前端、无后端 DB**：除 `/api/reflect`（仅做 AI 转发）外没有服务端状态，所有进度在浏览器 localStorage。
- **构建用 Turbopack**：`next build` 已验证通过；如遇样式/任意值问题优先怀疑 Turbopack + Tailwind 兼容。
