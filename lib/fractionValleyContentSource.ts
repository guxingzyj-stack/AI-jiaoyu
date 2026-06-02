import type { S4ChapterContent } from "./s4ChapterTypes";

export const fractionValleyContent: S4ChapterContent = {
  chapterTitle: "第五章：分数谷",
  chapterSubtitle: "公平切分星光，让每一份一样大",
  route: "/adventure/fraction-valley",
  theme: "fraction",
  intro: {
    title: "分数谷的分享光路暗了",
    body: "这里的星光要公平分给小伙伴。看清整体被分成几份，再点亮需要的那几份。",
    button: "修好分数谷"
  },
  hud: {
    rewardLabel: "分享星片",
    coreLabel: "分享核心"
  },
  mapHint: "修好分享门、半块花园、四份花田和相等河，再点亮分享核心。",
  nova: {
    intro: "公平分，就是每一份一样大。",
    idle: "点地图上的发光地点，去帮山谷重新分光。",
    hint: "先看整体分成几份，再看点亮了几份。",
    complete: "分数谷亮起来了，星光核心正在呼唤我们。"
  },
  edges: [
    ["gate", "half-pie"],
    ["half-pie", "quarter-garden"],
    ["quarter-garden", "equal-river"],
    ["equal-river", "core"]
  ],
  nodes: [
    {
      id: "gate",
      title: "公平分享门",
      shortTitle: "分享门",
      description: "把一整块星光切成两份一样大。",
      assetKey: "gate",
      position: { x: 22, y: 77 },
      reward: "分享星片 +1",
      mechanic: {
        type: "make-half",
        prompt: "哪一种切法是两边一样大？点中间那块公平切分。",
        success: "分享门亮起温暖的光。",
        hint: "两边看起来一样大，才是公平分成两半。",
        options: ["左边大一点", "两边一样大", "右边大一点"],
        answer: "两边一样大"
      }
    },
    {
      id: "half-pie",
      title: "半块花园",
      shortTitle: "半块",
      description: "从完整花园里找出一半。",
      assetKey: "halfPie",
      position: { x: 50, y: 59 },
      unlockAfter: ["gate"],
      reward: "分享星片 +1",
      mechanic: {
        type: "make-half",
        prompt: "完整花园被分成两份一样大。哪一份刚好是一半？",
        success: "半块花园开出了星花。",
        hint: "一小角太少，一整块太多；一半是两份中的一份。",
        options: ["一小角", "一半", "一整块"],
        answer: "一半"
      }
    },
    {
      id: "quarter-garden",
      title: "四份花田",
      shortTitle: "四份",
      description: "从四块一样大的花田里点亮两块。",
      assetKey: "quarterGarden",
      position: { x: 75, y: 42 },
      unlockAfter: ["half-pie"],
      reward: "分享星片 +1",
      mechanic: {
        type: "quarter-garden",
        prompt: "花田分成 4 块一样大。点第1块和第2块，让 2/4 亮起来。",
        success: "两块四分之一合成了半片星光。",
        hint: "每一小块都一样大。请点两块，不是一块也不是三块。",
        options: ["第1块", "第2块", "第3块", "第4块"],
        answer: ["第1块", "第2块"],
        targetCount: 2
      }
    },
    {
      id: "equal-river",
      title: "相等河",
      shortTitle: "相等河",
      description: "找出和一半一样多的分数。",
      assetKey: "equalRiver",
      position: { x: 40, y: 26 },
      unlockAfter: ["quarter-garden"],
      reward: "分享星片 +1",
      mechanic: {
        type: "equal-river",
        prompt: "看上面的 1/2，再点和它一样多的那一份。",
        success: "相等河重新流动起来。",
        hint: "四份里点亮两份，是 2/4；它和 1/2 一样多。",
        options: ["1/4", "2/4", "3/4"],
        answer: "2/4"
      }
    },
    {
      id: "core",
      title: "分享核心",
      shortTitle: "核心",
      description: "放入分享星片，点亮分数谷。",
      assetKey: "core",
      position: { x: 69, y: 16 },
      unlockAfter: ["gate", "half-pie", "quarter-garden", "equal-river"],
      mechanic: {
        type: "core",
        prompt: "分享星片集齐了，点亮分享核心。",
        success: "分数谷完全亮起来！",
        hint: "先完成前面的分享机关。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "分数谷公平亮起",
    summary: "你让星光被公平地分成一样大的份数。",
    stats: ["分享星片 4/4", "2/4 和 1/2 已连上", "分享核心已点亮"],
    nextHref: "/adventure/star-core",
    nextLabel: "进入终章：星光核心",
    replayLabel: "再走一次分数谷"
  }
};
