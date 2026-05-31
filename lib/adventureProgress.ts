// 记录世界地图上各岛屿（探险关卡）的通关状态，供 /map 解锁/标记 completed 使用。
export const ADVENTURE_PROGRESS_STORAGE_KEY = "zx_adventurer_island_progress";

export type AdventureProgress = {
  completedIslands: string[];
};

const defaultAdventureProgress: AdventureProgress = {
  completedIslands: []
};

export function readAdventureProgress(): AdventureProgress {
  if (typeof window === "undefined") {
    return defaultAdventureProgress;
  }

  try {
    const raw = window.localStorage.getItem(ADVENTURE_PROGRESS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AdventureProgress>) : null;
    return {
      completedIslands: Array.isArray(parsed?.completedIslands) ? parsed!.completedIslands : []
    };
  } catch {
    return defaultAdventureProgress;
  }
}

export function markIslandCompleted(islandId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readAdventureProgress();
  if (current.completedIslands.includes(islandId)) {
    return;
  }

  const next: AdventureProgress = {
    completedIslands: [...current.completedIslands, islandId]
  };
  window.localStorage.setItem(ADVENTURE_PROGRESS_STORAGE_KEY, JSON.stringify(next));
}
