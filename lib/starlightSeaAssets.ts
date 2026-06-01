// 星光海视觉资产路径。直接引用 public/assets/starlight-sea/ 下用户手动放入的图片，按真实扩展名书写：
// 7 张节点/图标为 .png（用户手动放入），3 张场景图为 .webp（沿用之前压缩好的）。带版本号破除缓存。
// 注意：当前 .png 图标自带近白底（非真透明），页面用「圆形裁切 + cover」当徽章显示，避免白方块。
const assetVersion = "s4e2-r5-manual-assets";
const v = (path: string) => `${path}?v=${assetVersion}`;

export const starlightSeaAssets = {
  background: v("/assets/starlight-sea/sea-background.webp"),
  routePath: v("/assets/starlight-sea/sea-route-path.webp"),
  platform: v("/assets/starlight-sea/sea-platform.webp"),
  dockNode: v("/assets/starlight-sea/dock-node.png"),
  boatNode: v("/assets/starlight-sea/boat-node.png"),
  lighthouseNode: v("/assets/starlight-sea/lighthouse-node.png"),
  vortexGateNode: v("/assets/starlight-sea/vortex-gate-node.png"),
  lighthouseCoreNode: v("/assets/starlight-sea/lighthouse-core-node.png"),
  seaFragment: v("/assets/starlight-sea/sea-fragment.png"),
  novaCompanion: v("/assets/starlight-sea/nova-companion.png")
} as const;
