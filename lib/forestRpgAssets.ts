const forestRpgAssetBase = "/assets/forest-rpg";

export const forestRpgAssets = {
  backgrounds: {
    dark: `${forestRpgAssetBase}/forest-dark-background.png`,
    bright: `${forestRpgAssetBase}/forest-bright-background.png`
  },
  characters: {
    sleepingSpirit: `${forestRpgAssetBase}/sleeping-spirit.png`,
    awakeSpirit: `${forestRpgAssetBase}/awake-spirit.png`,
    playerAvatar: `${forestRpgAssetBase}/player-avatar.png`,
    nova: `${forestRpgAssetBase}/nova-companion.png`
  },
  objects: {
    starlightLampOff: `${forestRpgAssetBase}/starlight-lamp-off.png`,
    starlightLampOn: `${forestRpgAssetBase}/starlight-lamp-on.png`,
    energyFruit: `${forestRpgAssetBase}/energy-fruit.png`,
    sleepyFog: `${forestRpgAssetBase}/sleepy-fog.png`,
    starlightFragment: `${forestRpgAssetBase}/starlight-fragment.png`
  }
} as const;
