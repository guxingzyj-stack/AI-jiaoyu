// 占位资源：用户提供透明 PNG 后，替换 worldMap / heroIdle / heroWalk 的路径即可。
// worldMap 期望：竖向 1080x1920，去掉烘焙在图里的小机器人，能量环保留。
// heroIdle / heroWalk 期望：透明背景 PNG，全身站立/迈步，约 512x640。
export const mapAssets = {
  worldMap: "/assets/map/world-map.webp",
  heroIdle: "/assets/map/hero-idle.png" as string | null,
  heroWalk: "/assets/map/hero-walk.png" as string | null,
  novaFollow: "/assets/characters/nova-happy.png"
};
