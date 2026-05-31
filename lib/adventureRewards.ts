export const ADVENTURE_COMPLETION_COUNT_STORAGE_KEY = "zx_adventurer_adventure_completion_counts";

type AdventureCompletionCounts = Record<string, number>;

function canUseLocalStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function normalizeCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function readCompletionCounts(): AdventureCompletionCounts {
  if (!canUseLocalStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(ADVENTURE_COMPLETION_COUNT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([adventureId, count]) => [
        adventureId,
        normalizeCount(count)
      ])
    );
  } catch {
    return {};
  }
}

export function getAdventureCompletionCount(adventureId: string) {
  if (!adventureId) {
    return 0;
  }

  try {
    return normalizeCount(readCompletionCounts()[adventureId]);
  } catch {
    return 0;
  }
}

export function incrementAdventureCompletionCount(adventureId: string) {
  if (!adventureId || !canUseLocalStorage()) {
    return 0;
  }

  try {
    const counts = readCompletionCounts();
    const nextCount = normalizeCount(counts[adventureId]) + 1;
    window.localStorage.setItem(
      ADVENTURE_COMPLETION_COUNT_STORAGE_KEY,
      JSON.stringify({ ...counts, [adventureId]: nextCount })
    );
    return nextCount;
  } catch {
    return getAdventureCompletionCount(adventureId);
  }
}
