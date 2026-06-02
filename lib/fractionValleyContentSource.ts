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
    intro: "先看星光被怎么分开，再动手点亮需要的那一份。",
    idle: "点地图上的发光地点，去帮山谷重新分光。",
    hint: "看图，不急着看数字。",
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
      description: "小精灵想和你公平分享圆饼。",
      assetKey: "gate",
      position: { x: 22, y: 77 },
      reward: "分享星片 +1",
      mechanic: {
        type: "make-half",
        prompt: "小精灵想和你公平分享圆饼，先试着把它分开。",
        success: "分享门亮起温暖的光。",
        hint: "两边要看起来一样大。",
        wrongHint: "圆饼还没公平分开，再看两边大小。",
        strongHint: "两份一样大时，每个人拿到的才一样多。",
        successSummary: "你拿到了两份中的一份，这就是一半。",
        options: ["左边大一点", "两边一样大", "右边大一点"],
        answer: "两边一样大"
      }
    },
    {
      id: "half-pie",
      title: "半块花园",
      shortTitle: "半块",
      description: "花园被分开了，找出公平的一份。",
      assetKey: "halfPie",
      position: { x: 50, y: 59 },
      unlockAfter: ["gate"],
      reward: "分享星片 +1",
      mechanic: {
        type: "make-half",
        prompt: "花园被分开了，找出两份中公平的一份。",
        success: "半块花园开出了星花。",
        hint: "不要太少，也不要拿走全部。",
        wrongHint: "这一份不是公平分出来的一份。",
        strongHint: "两份一样大时，拿其中一份就是一半。",
        successSummary: "你拿到了两份中的一份，这就是一半。",
        options: ["一小角", "一半", "一整块"],
        answer: "一半"
      }
    },
    {
      id: "quarter-garden",
      title: "四份花田",
      shortTitle: "四份",
      description: "花园被分成四块小地。",
      assetKey: "quarterGarden",
      position: { x: 75, y: 42 },
      unlockAfter: ["half-pie"],
      reward: "分享星片 +1",
      mechanic: {
        type: "quarter-garden",
        prompt: "花园分成四块小地，先试着点亮需要的几块。",
        success: "两块四分之一合成了半片星光。",
        hint: "数一数现在亮起了几块。",
        wrongHint: "现在亮起的块数还不对，数一数有几块亮了。",
        strongHint: "先按亮一块，再试试按亮两块。",
        successSummary: "四等分花田亮起来了！",
        options: ["第1块", "第2块", "第3块", "第4块"],
        answer: ["第1块", "第2块"],
        targetCount: 2
      }
    },
    {
      id: "equal-river",
      title: "相等河",
      shortTitle: "相等河",
      description: "小河两边要亮起一样多的星光。",
      assetKey: "equalRiver",
      position: { x: 40, y: 26 },
      unlockAfter: ["quarter-garden"],
      reward: "分享星片 +1",
      mechanic: {
        type: "equal-river",
        prompt: "小河两边要亮起一样多的星光，找右边一样多的那一份。",
        success: "相等河重新流动起来。",
        hint: "先看左边亮了多少，再找右边一样多的。",
        wrongHint: "这一边亮得少了一点或多了一点。",
        strongHint: "右边分成四小格，试着找和左边同样多的亮光。",
        successSummary: "2/4 和 1/2 一样多，小河桥亮起来了！",
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
