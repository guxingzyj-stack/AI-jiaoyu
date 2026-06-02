export type S4MechanicType =
  | "intro"
  | "shape-match"
  | "path-build"
  | "mirror-pair"
  | "set-clock"
  | "order-train"
  | "duration-bridge"
  | "make-half"
  | "quarter-garden"
  | "equal-river"
  | "memory-choice"
  | "memory-sequence"
  | "core";

export type S4ChapterNode = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  assetKey: string;
  position: {
    x: number;
    y: number;
  };
  unlockAfter?: string[];
  reward?: string;
  mechanic: {
    type: S4MechanicType;
    prompt: string;
    success: string;
    hint: string;
    wrongHint?: string;
    strongHint?: string;
    successSummary?: string;
    options?: string[];
    answer?: string | string[];
    targetCount?: number;
  };
};

export type S4ChapterContent = {
  chapterTitle: string;
  chapterSubtitle: string;
  route: string;
  theme: "geometry" | "time" | "fraction" | "core";
  intro: {
    title: string;
    body: string;
    button: string;
  };
  hud: {
    rewardLabel: string;
    coreLabel: string;
  };
  mapHint: string;
  nova: {
    intro: string;
    idle: string;
    hint: string;
    complete: string;
  };
  nodes: S4ChapterNode[];
  edges: Array<[string, string]>;
  completion: {
    title: string;
    summary: string;
    stats: string[];
    nextHref: string;
    nextLabel: string;
    replayLabel: string;
  };
};

export type S4ChapterAssets = {
  background: string;
  reward: string;
  nova: string;
  nodes: Record<string, string>;
};
