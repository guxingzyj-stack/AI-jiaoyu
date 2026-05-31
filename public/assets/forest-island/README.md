# 森林岛跳数探险 图片资产 + 生图提示词

森林岛（第 2 关）目前是 asset-light：没有专属背景时走「森林绿主题渐变 + emoji」兜底，
所以**缺这些图也能正常玩**。等定制图到位后，按下面文件名放进本目录，再到
`lib/adventures.ts` 的 `forestIslandConfig.assets` 把内容换成 `...forestIslandAssets`
（那一行有注释说明），整关就会从渐变切换到真图，组件无需改动。

下面给出**可直接粘贴进生图模型**（Midjourney / DALL·E / Stable Diffusion / 即梦 / 通义万相等）
的详细提示词。每张图 = 「通用风格前缀 STYLE」 + 「该图的主体与构图」 + 「通用负向词 NEGATIVE」。

---

## 0. 通用风格前缀 STYLE（每张都加在最前面）

**English:**
> Cute 3D-rendered children's educational game key art, soft rounded shapes, Pixar-like
> soft global illumination, glossy magical glow accents, vibrant saturated colors, clean and
> uncluttered, smooth gradients, gentle bloom, high detail, mobile game illustration, friendly
> and cozy mood, no harsh shadows.

**中文（用国内工具时）：**
> 可爱 3D 渲染的儿童教育游戏主视觉，圆润柔和造型，皮克斯式柔光全局照明，光泽魔法发光点缀，
> 鲜艳饱和色彩，画面干净不杂乱，平滑渐变，柔和泛光，高细节，手游插画风，温暖治愈氛围。

**比例 / 分辨率：** 所有场景图都是 **16:9 横图，建议 1920×1080**（`--ar 16:9`）。
**主色调：** 暖森林绿 + 阳光金 + 苔藓/薄荷高光（刻意区别于倍数海的深蓝星空）。
调色参考：嫩绿 `#bef264`、森林绿 `#228457`、暖阳金 `#fcd34d`、奶白高光 `#fef9e7`。

---

## 0b. 通用负向词 NEGATIVE（每张都加，**最重要**）

> **no text, no letters, no numbers, no words, no captions, no UI, no buttons, no watermark,
> no signature, no logo, no frame border**, no people faces close-up, no clutter, not dark,
> not gloomy, no photorealism, no horror.

> ⚠️ **千万不要把任何文字 / 数字 / 按钮烘焙进画面**——数字、提示文案、"单击"之类全部由代码叠加。
> （倍数海的 `tower-background.png` 就是把"单击"画进了图里，正在返工重导。别重蹈覆辙。）

---

## 0c. Nova 角色一致性（3 张立绘）

Nova 是孩子的探险伙伴小机器人。**强烈建议用现有 `../multiples-sea/nova-guide.png` 做参考图
（image-to-image / 垫图 / Midjourney `--cref`），而不是纯文字重画**，否则两关 Nova 会长得不一样。
若必须文字生成，提示词里固定这几点：同一只圆润友好的小机器人、配色与倍数海版一致、透明背景、
全身、面向镜头略偏。三种表情：

- `nova-guide.png`：平静微笑、引导手势（中性）
- `nova-happy.png`：开心欢呼、眼睛弯成月牙、举手庆祝
- `nova-thinking.png`：歪头思考、手托下巴、头顶一个小问号光点

立绘统一要求：**透明背景 PNG，全身，居中，约 1024×1024，无地面阴影投射到画布边缘**。

---

## 1. map-background.png — 星球地图中的森林岛
**Prompt（STYLE + 下面 + NEGATIVE）：**
> a lush glowing forest island floating in a math-planet world map, seen from a gentle
> top-down 3/4 angle, winding luminous trail of glowing footprints weaving through the
> treetops, warm sunlight breaking through the canopy, soft clouds, the whole island softly
> glowing as if newly discovered, emerald and warm-gold palette.

**构图/安全区：** 森林岛主体放**画面左中**；**右上角 right 6%~16% / top 12%~16% 区域留空**
（代码会在那放发光的"进入岛屿"按钮 + NEW 角标）；**右下角留空**给标题卡。

---

## 2. entrance-background.png — 森林入口（观察阶段）
**Prompt：**
> the entrance of a magical sunlit forest, tall friendly trees forming an archway, warm
> sunbeams streaming through leaves, a row of glowing footprints on the mossy ground leading
> deeper into the woods, sparkling dust motes, inviting and cozy.

**构图/安全区：** **左上角留空**给标题卡（eyebrow + 标题）；**画面下方 1/3 居中留出干净地面/小径**，
代码会在 `bottom ~17%` 水平排一排"脚印数字石"按钮（5、10、15、20、?）。

---

## 3. footprint-question-background.png — 脚印数字路机关
**Prompt：**
> a clear forest clearing floor with a straight row of five large glowing footprint
> stepping-stones receding gently into the woods, soft moss, dappled sunlight, the fifth
> stepping-stone faintly pulsing as if waiting to be solved, clean uncluttered foreground.

**构图/安全区：** 中心到下方**大片留空**，代码会叠加数字路（数字 + → 箭头）和三个答案选项按钮；
**左上角留空**给标题卡。脚印石本身**不要画数字**。

---

## 4. path-lit-background.png — 森林小径点亮（胜利）
**Prompt：**
> a forest path fully lit up in celebration, the entire trail of footprints glowing bright
> golden-green, light particles rising, trees gently illuminated, a triumphant warm radiance,
> sense of breakthrough and joy.

**构图/安全区：** **左上角留空**给标题卡；**中下方留空**，代码会叠加一排发光数字（含高亮答案）和
"登上新岛"按钮；庆祝粒子由代码叠加（图里可有少量光点但别太满）。

---

## 5. big-tree-background.png — 大树数字（塔阶段，竖向数列）
**Prompt：**
> one majestic ancient tree filling the center of the frame, sturdy vertical trunk with
> glowing rings/notches climbing from base to crown, magical light pulsing up the trunk,
> warm sunlight behind the canopy, a tall vertical climb feeling, symmetrical composition.

**构图/安全区（关键）：** 大树**居中、树干竖直**——代码会沿树干**从上到下竖排 5 个数字圆圈**
（约 `top 14%` 起向下），所以**树干正中要留出竖向干净空间**；**顶部居中留空**给 3 个进度点；
**底部居中留空**给答案选项按钮。同样**不要在树上画任何数字**。

---

## 6. treetop-background.png — 树顶平台（真相探测器）
**Prompt：**
> a serene treetop platform among the highest branches, Nova the cute robot companion
> standing on a sturdy branch looking out, floating glowing question-mark sparks drifting in
> the air around, soft sky and sunlit canopy below, slightly mysterious but warm mood.

**构图/安全区：** Nova 放**偏侧**（左或右三分之一），**中下方留出干净区域**给 Nova 那句话的卡片
（`bottom ~28%` 居中）和"继续"按钮；**左上角留空**给标题卡。问号光点可入画。
> 注：若想 Nova 与右侧面板立绘完全一致，画面里的 Nova 也用同一参考图。

---

## 7. notebook-background.png — 探险笔记本（复盘）
**Prompt：**
> an open adventure journal / scrapbook with blank cream-colored pages, forest theme,
> pressed leaves and tiny wood-grain decorations in the margins, warm cozy desk lighting,
> the page surface mostly empty and clean, ready for stickers, top-down flat-lay view.

**构图/安全区：** **页面大面积留白**——左侧窄列会叠"贴纸"按钮、右侧大片叠贴纸图与复盘文案卡；
装饰只放在**四周边缘**，中间保持干净。色调可与倍数海笔记本统一但偏暖绿。

---

## 8. complete-background.png — 森林岛纪念卡背景
**Prompt：**
> a celebratory completion scene of the forest island at golden hour, the glowing footprint
> trail and lit-up forest in the background, gentle confetti of leaves and light sparks,
> festive warm radiance, a sense of accomplishment, soft vignette of light (not dark).

**构图/安全区：** **左侧 6%~44% 区域**会叠"完成"标题 + 🏅 奖牌卡，**右侧**会叠成绩结果卡，
所以**左右两侧别放主体细节**，把视觉重心放在**上方/中间的森林光景**；庆祝粒子代码会再叠一层。

---

## 9. Nova 三张立绘 — 见上面 §0c（优先用 multiples-sea 现有 Nova 垫图保持一致）

---

## 遗留待办（倍数海）

- `../multiples-sea/tower-background.png` 把「单击」文字烘焙进了图里，需要按本规则
  （负向词禁止文字）重新导出去掉文字的版本。
