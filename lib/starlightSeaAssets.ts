// 星光海正式视觉资产（压缩后的 WebP）。原图在本地 _incoming-starlight-sea-assets/（已 gitignore），
// 由 scripts/optimize-starlight-sea-assets.mjs 压缩输出到 public/assets/starlight-sea/。代码只引用英文名 WebP。
export const starlightSeaAssets = {
  background: "/assets/starlight-sea/sea-background.webp",
  routePath: "/assets/starlight-sea/sea-route-path.webp",
  platform: "/assets/starlight-sea/sea-platform.webp",
  dockNode: "/assets/starlight-sea/dock-node.webp",
  boatNode: "/assets/starlight-sea/boat-node.webp",
  lighthouseNode: "/assets/starlight-sea/lighthouse-node.webp",
  vortexGateNode: "/assets/starlight-sea/vortex-gate-node.webp",
  lighthouseCoreNode: "/assets/starlight-sea/lighthouse-core-node.webp",
  seaFragment: "/assets/starlight-sea/sea-fragment.webp",
  novaCompanion: "/assets/starlight-sea/nova-companion.webp"
} as const;
