const assetVersion = "s4-complete-v1";
const withVersion = (path: string) => `${path}?v=${assetVersion}`;

export const starCoreAssets = {
  background: withVersion("/assets/star-core/star-core-background.webp"),
  reward: withVersion("/assets/star-core/guardian-star.webp"),
  nova: withVersion("/assets/star-core/star-core-nova.webp"),
  nodes: {
    gate: withVersion("/assets/star-core/core-gate-node.webp"),
    forest: withVersion("/assets/star-core/memory-forest-node.webp"),
    sea: withVersion("/assets/star-core/memory-sea-node.webp"),
    shapeTime: withVersion("/assets/star-core/memory-shape-time-node.webp"),
    share: withVersion("/assets/star-core/memory-share-node.webp"),
    core: withVersion("/assets/star-core/final-core-node.webp")
  }
} as const;
