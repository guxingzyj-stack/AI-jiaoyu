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
    rewardLabel: "公平分享",
    coreLabel: "分享泉"
  },
  mapHint: "在分享桌上分圆饼、点花园、接亮小河两岸。",
  nova: {
    intro: "先看星光被怎么分开，再动手点亮需要的那一份。",
    idle: "先看分享桌，选择正在等待的分享任务。",
    hint: "看图，不急着看数字。",
    complete: "分数谷亮起来了，星光核心正在呼唤我们。"
  },
  edges: [
    ["gate", "quarter-garden"],
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
      reward: "公平分享 +1",
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
      id: "quarter-garden",
      title: "四份花田",
      shortTitle: "四份",
      description: "花园被分成四块小地。",
      assetKey: "quarterGarden",
      position: { x: 75, y: 42 },
      unlockAfter: ["gate"],
      reward: "公平分享 +1",
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
      reward: "公平分享 +1",
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
      description: "三次公平分享都完成了，分享泉正在等待亮起。",
      assetKey: "core",
      position: { x: 69, y: 16 },
      unlockAfter: ["gate", "quarter-garden", "equal-river"],
      mechanic: {
        type: "core",
        prompt: "三次公平分享都完成了，让分享泉亮起来。",
        success: "大家分得一样公平，分享泉亮起来！",
        hint: "先完成前面的三次分享。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "第五章完成！",
    summary: "大家分得一样公平，分享泉亮起来了！",
    stats: ["公平分享 3/3", "圆饼已分开", "小河两岸一样亮"],
    nextHref: "/adventure/star-core",
    nextLabel: "进入终章：星光核心",
    replayLabel: "再走一次分数谷"
  }
};
