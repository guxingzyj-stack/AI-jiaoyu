const assetVersion = "s4-complete-v1";
const withVersion = (path: string) => `${path}?v=${assetVersion}`;

export const timeCityAssets = {
  background: withVersion("/assets/time-city/time-city-background.webp"),
  reward: withVersion("/assets/time-city/time-gear.webp"),
  nova: withVersion("/assets/time-city/time-nova.webp"),
  train: withVersion("/assets/time-city/time-train.webp"),
  nodes: {
    station: withVersion("/assets/time-city/time-station-node.webp"),
    clock: withVersion("/assets/time-city/clock-platform-node.webp"),
    trainOrder: withVersion("/assets/time-city/train-order-node.webp"),
    bridge: withVersion("/assets/time-city/arrival-bridge-node.webp"),
    core: withVersion("/assets/time-city/clock-core-node.webp")
  }
} as const;
