const assetVersion = "s4-complete-v1";
const withVersion = (path: string) => `${path}?v=${assetVersion}`;

export const fractionValleyAssets = {
  background: withVersion("/assets/fraction-valley/fraction-valley-background.webp"),
  reward: withVersion("/assets/fraction-valley/sharing-star-fragment.webp"),
  nova: withVersion("/assets/fraction-valley/fraction-nova.webp"),
  nodes: {
    gate: withVersion("/assets/fraction-valley/sharing-gate-node.webp"),
    halfPie: withVersion("/assets/fraction-valley/half-pie-node.webp"),
    quarterGarden: withVersion("/assets/fraction-valley/quarter-garden-node.webp"),
    equalRiver: withVersion("/assets/fraction-valley/equal-river-node.webp"),
    core: withVersion("/assets/fraction-valley/sharing-core-node.webp")
  }
} as const;
