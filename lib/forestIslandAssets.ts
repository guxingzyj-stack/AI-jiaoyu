// 森林岛专属美术资源路径（与倍数海同结构）。当前 public/assets/forest-island/ 下
// 还没有这些 PNG，所以 forestIslandConfig 暂不引用它们、走主题渐变兜底；
// 美术到位后，在 lib/adventures.ts 里把 forestIslandConfig.assets 换成
// `...forestIslandAssets`（见该处注释），整关即从渐变切到真图，无需改组件。
export const forestIslandAssets = {
  map: "/assets/forest-island/map-background.webp",
  beach: "/assets/forest-island/entrance-background.webp",
  stoneQuestion: "/assets/forest-island/footprint-question-background.webp",
  islandVictory: "/assets/forest-island/path-lit-background.webp",
  tower: "/assets/forest-island/big-tree-background.webp",
  truth: "/assets/forest-island/treetop-background.webp",
  notebook: "/assets/forest-island/notebook-background.webp",
  complete: "/assets/forest-island/complete-background.webp",
  novaGuide: "/assets/forest-island/nova-guide.webp",
  novaHappy: "/assets/forest-island/nova-happy.webp",
  novaThinking: "/assets/forest-island/nova-thinking.webp"
};
