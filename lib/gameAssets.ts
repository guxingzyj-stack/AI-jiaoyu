import type { MonsterType } from "./learningProgress";

export const GAME_ASSET_VERSION = "s1e10-2";

function asset(path: string) {
  return `${path}?v=${GAME_ASSET_VERSION}`;
}

export const gameAssets = {
  lobbyHero: asset("/assets/game/lobby-hero.png"),
  novaHappy: asset("/assets/characters/nova-happy.png"),
  novaThinking: asset("/assets/characters/nova-thinking.png"),
  novaCheer: asset("/assets/characters/nova-cheer.png"),
  quests: {
    challenge: asset("/assets/quests/energy-tower.png"),
    ai_help: asset("/assets/quests/nova-clue.png"),
    monster_review: asset("/assets/quests/monster-tracking.png")
  },
  monsters: {
    careless: asset("/assets/monsters/careless-monster.png"),
    illusion: asset("/assets/monsters/illusion-monster.png"),
    fog: asset("/assets/monsters/fog-monster.png"),
    armor: asset("/assets/monsters/armor-monster.png"),
    vine: asset("/assets/monsters/vine-monster.png"),
    normal: asset("/assets/monsters/normal-monster.png")
  } satisfies Record<MonsterType, string>,
  skills: {
    "clear-question": asset("/assets/skills/dialog-chip.png"),
    "step-ask": asset("/assets/skills/thinking-compass.png"),
    "truth-check": asset("/assets/skills/detect-lens.png"),
    "review-power": asset("/assets/skills/review-shield.png")
  }
};

export const assetCheckGroups = [
  {
    group: "game",
    items: [{ label: "lobby-hero", path: "/assets/game/lobby-hero.png", src: gameAssets.lobbyHero }]
  },
  {
    group: "characters",
    items: [
      { label: "nova-happy", path: "/assets/characters/nova-happy.png", src: gameAssets.novaHappy },
      { label: "nova-thinking", path: "/assets/characters/nova-thinking.png", src: gameAssets.novaThinking },
      { label: "nova-cheer", path: "/assets/characters/nova-cheer.png", src: gameAssets.novaCheer }
    ]
  },
  {
    group: "quests",
    items: [
      { label: "energy-tower", path: "/assets/quests/energy-tower.png", src: gameAssets.quests.challenge },
      { label: "nova-clue", path: "/assets/quests/nova-clue.png", src: gameAssets.quests.ai_help },
      { label: "monster-tracking", path: "/assets/quests/monster-tracking.png", src: gameAssets.quests.monster_review }
    ]
  },
  {
    group: "monsters",
    items: [
      { label: "fog-monster", path: "/assets/monsters/fog-monster.png", src: gameAssets.monsters.fog },
      { label: "careless-monster", path: "/assets/monsters/careless-monster.png", src: gameAssets.monsters.careless },
      { label: "illusion-monster", path: "/assets/monsters/illusion-monster.png", src: gameAssets.monsters.illusion },
      { label: "armor-monster", path: "/assets/monsters/armor-monster.png", src: gameAssets.monsters.armor },
      { label: "vine-monster", path: "/assets/monsters/vine-monster.png", src: gameAssets.monsters.vine },
      { label: "normal-monster", path: "/assets/monsters/normal-monster.png", src: gameAssets.monsters.normal }
    ]
  },
  {
    group: "skills",
    items: [
      { label: "dialog-chip", path: "/assets/skills/dialog-chip.png", src: gameAssets.skills["clear-question"] },
      { label: "thinking-compass", path: "/assets/skills/thinking-compass.png", src: gameAssets.skills["step-ask"] },
      { label: "detect-lens", path: "/assets/skills/detect-lens.png", src: gameAssets.skills["truth-check"] },
      { label: "review-shield", path: "/assets/skills/review-shield.png", src: gameAssets.skills["review-power"] }
    ]
  }
];
