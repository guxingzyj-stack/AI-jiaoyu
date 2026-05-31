// 森林岛专属美术资源路径（与倍数海同结构）。当前 public/assets/forest-island/ 下
// 还没有这些 PNG，所以 forestIslandConfig 暂不引用它们、走主题渐变兜底；
// 美术到位后，在 lib/adventures.ts 里把 forestIslandConfig.assets 换成
// `...forestIslandAssets`（见该处注释），整关即从渐变切到真图，无需改组件。
export const forestIslandAssets = {
  map: "/assets/forest-island/map-background.png",
  beach: "/assets/forest-island/entrance-background.png",
  stoneQuestion: "/assets/forest-island/footprint-question-background.png",
  islandVictory: "/assets/forest-island/path-lit-background.png",
  tower: "/assets/forest-island/big-tree-background.png",
  truth: "/assets/forest-island/treetop-background.png",
  notebook: "/assets/forest-island/notebook-background.png",
  complete: "/assets/forest-island/complete-background.png",
  novaGuide: "/assets/forest-island/nova-guide.png",
  novaHappy: "/assets/forest-island/nova-happy.png",
  novaThinking: "/assets/forest-island/nova-thinking.png"
};
