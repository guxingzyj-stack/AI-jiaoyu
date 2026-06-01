import type { S4ChapterContent } from "./s4ChapterTypes";

export const fractionValleyContent: S4ChapterContent = {
  chapterTitle: "第五章：分数谷",
  chapterSubtitle: "把星光公平分给每个小伙伴",
  route: "/adventure/fraction-valley",
  theme: "fraction",
  intro: {
    title: "分数谷的分享光路变暗了",
    body: "这里的小伙伴需要公平分享星光。分得一样多，山谷就会亮。",
    button: "进入分数谷"
  },
  hud: {
    rewardLabel: "分享星片",
    coreLabel: "分享核心"
  },
  mapHint: "修好分享门、半块花园、四份花田和相等河，再唤醒核心。",
  nova: {
    intro: "公平分享，就是每一份一样多。",
    idle: "点地图上的发光节点，去帮山谷重新分光。",
    hint: "看看每份是不是一样大。",
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
      title: "分享门",
      shortTitle: "分享门",
      description: "把星光分成两份一样多。",
      assetKey: "gate",
      position: { x: 22, y: 77 },
      reward: "分享星片 +1",
      mechanic: {
        type: "make-half",
        prompt: "哪一种分法是两份一样多？",
        success: "分享门亮起温暖的光。",
        hint: "两边看起来一样大，就是公平分成两半。",
        options: ["左边大一些", "两边一样大", "右边大一些"],
        answer: "两边一样大"
      }
    },
    {
      id: "half-pie",
      title: "半块花园",
      shortTitle: "半块",
      description: "找到一个完整花园的一半。",
      assetKey: "halfPie",
      position: { x: 50, y: 59 },
      unlockAfter: ["gate"],
      reward: "分享星片 +1",
      mechanic: {
        type: "make-half",
        prompt: "哪个花园刚好是一半？",
        success: "半块花园开出了星花。",
        hint: "一半就是完整的一份分成两个相同小份中的一个。",
        options: ["一小角", "一半", "一整块"],
        answer: "一半"
      }
    },
    {
      id: "quarter-garden",
      title: "四份花田",
      shortTitle: "四份",
      description: "点出两块四分之一花田。",
      assetKey: "quarterGarden",
      position: { x: 75, y: 42 },
      unlockAfter: ["half-pie"],
      reward: "分享星片 +1",
      mechanic: {
        type: "quarter-garden",
        prompt: "从四块一样大的花田里选两块。",
        success: "两块四分之一合成了半片星光。",
        hint: "每一小块都一样大，选两块就好。",
        options: ["第1块", "第2块", "第3块", "第4块"],
        answer: ["第1块", "第2块"],
        targetCount: 2
      }
    },
    {
      id: "equal-river",
      title: "相等河",
      shortTitle: "相等河",
      description: "让两种分法汇成一样多的光。",
      assetKey: "equalRiver",
      position: { x: 40, y: 26 },
      unlockAfter: ["quarter-garden"],
      reward: "分享星片 +1",
      mechanic: {
        type: "equal-river",
        prompt: "哪一份和一半一样多？",
        success: "相等河重新流动起来。",
        hint: "两个四分之一合起来，和一半一样多。",
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
        prompt: "分享星片集齐了，唤醒分享核心。",
        success: "分数谷完全亮起来了！",
        hint: "先完成前面的分享机关。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "分数谷公平亮起",
    summary: "你让星光被公平地分享给每个小伙伴。",
    stats: ["分享星片 4/4", "相等河已流动", "分享核心已点亮"],
    nextHref: "/adventure/star-core",
    nextLabel: "进入终章：星光核心",
    replayLabel: "再走一次分数谷"
  }
};
