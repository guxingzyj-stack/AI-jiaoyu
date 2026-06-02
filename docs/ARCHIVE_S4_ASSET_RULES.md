# S4 Asset Rules Archive

## 核心原则

- 图片和内容可以一次做完，但不能分离成“先内容后补图”
- 每章资产必须命名清楚、压缩、接入、验收
- 不要把复杂大插画强行缩成 40px 小节点
- 背景图适合做背景
- 节点图必须清楚，适合小尺寸
- 如果图片缩小后不清楚，节点优先使用 CSS 徽章
- 不允许出现白底、棋盘格底、条纹底
- 不要在图片里烘焙文字、数字、按钮
- 代码里不要写中文文件名
- 每章资产放独立目录

## 目录规则

```text
public/assets/geometry-mountain/
public/assets/time-city/
public/assets/fraction-valley/
public/assets/star-core/
```

## 资产映射文件

```text
lib/geometryMountainAssets.ts
lib/timeCityAssets.ts
lib/fractionValleyAssets.ts
lib/starCoreAssets.ts
```

每个映射文件要有版本号防缓存：

```ts
const assetVersion = "s4-complete-v1";
const withVersion = (path: string) => `${path}?v=${assetVersion}`;
```

## 第二章星光海经验

- 背景图可用
- 小节点图必须谨慎
- 如果节点图不清楚，就用高对比 CSS 徽章
- 不要用大装饰图覆盖地图中心
- 路线优先用 CSS 虚线 / 发光线

## S4 当前资产状态

S4 已生成并接入四章 WebP 资产：

- 几何山：8 张
- 时间城：9 张
- 分数谷：8 张
- 星光核心：9 张

这些资产已经压缩为 WebP，并通过 `lib/*Assets.ts` 映射文件统一接入。

## 验收要点

- 图片不能包含文字、数字、按钮、UI
- 背景图需要在 360px / 390px 手机端仍能作为游戏场景
- 节点图在地图中缩小后仍要能看出主题
- 节点不能遮挡主操作区域
- 资产不能以原始大 PNG 形式直接提交，优先 WebP
- 不提交临时 contact sheet、原始生成图、下载目录或 `_incoming-*`
