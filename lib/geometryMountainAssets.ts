const assetVersion = "s4-complete-v1";
const withVersion = (path: string) => `${path}?v=${assetVersion}`;

export const geometryMountainAssets = {
  background: withVersion("/assets/geometry-mountain/geometry-background.webp"),
  reward: withVersion("/assets/geometry-mountain/shape-star-fragment.webp"),
  nova: withVersion("/assets/geometry-mountain/geometry-nova.webp"),
  nodes: {
    gate: withVersion("/assets/geometry-mountain/mountain-gate-node.webp"),
    socket: withVersion("/assets/geometry-mountain/shape-socket-node.webp"),
    trianglePath: withVersion("/assets/geometry-mountain/triangle-path-node.webp"),
    mirror: withVersion("/assets/geometry-mountain/mirror-cave-node.webp"),
    core: withVersion("/assets/geometry-mountain/mountain-core-node.webp")
  }
} as const;
