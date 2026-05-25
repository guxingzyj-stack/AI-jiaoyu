# 美术资源调试说明

## 替换图片后的刷新步骤

1. 保持文件名和 `lib/gameAssets.ts` 中的路径一致。
2. 替换 `public/assets/...` 下的图片后，建议重启 dev server。
3. 如果仍看到旧图，可以删除 `.next` 后重新启动：

```bash
Remove-Item -Recurse -Force .next
npm run dev
```

4. 浏览器中使用 `Ctrl+F5` 强制刷新。
5. 访问 `/asset-check` 查看每张图片的加载状态、真实宽高和失败提示。

## 路径规则

- 正确：`/assets/game/lobby-hero.png`
- 错误：`public/assets/game/lobby-hero.png`
- 错误：`../../assets/game/lobby-hero.png`

所有业务页面都应从 `lib/gameAssets.ts` 读取资源路径，不要在页面中散落硬编码图片路径。

## 缓存规避

`lib/gameAssets.ts` 会为图片路径追加版本参数，例如：

```text
/assets/game/lobby-hero.png?v=s1e10-2
```

替换正式图片后，如果仍被浏览器缓存，可以提升版本号。

## 正式图片要求

- 不要包含 UI 文字、按钮、完整页面截图。
- 角色、怪兽、装备建议使用透明 PNG。
- 关卡图可以保留简单场景背景。
- 主视觉应是纯游戏插画，不要带页面框架或导航元素。
