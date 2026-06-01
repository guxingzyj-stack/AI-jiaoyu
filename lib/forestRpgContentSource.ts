export type ForestRpgStage =
  | "intro"
  | "mission"
  | "map"
  | "collect"
  | "lamp"
  | "result"
  | "follow"
  | "gate"
  | "bridgeIntro"
  | "forestCenter"
  | "seedAwake"
  | "complete";

export type ForestFruit = {
  id: string;
  value: number;
  label: string;
  position: {
    x: number;
    y: number;
  };
};

export type ForestEncounter = {
  id: "first-spirit" | "second-spirit" | "star-bridge";
  kind: "spirit" | "bridge";
  title: string;
  targetEnergy: number;
  fruits: ForestFruit[];
  correctPair: [number, number];
  progressText: string;
  successText: string;
  rewardText: string;
  startPrompt: string;
  mapLine: string;
  firstFruitLine: (value: number) => string;
  bagFullLine: string;
  justRightLine: string;
  successSummary: (x: number, y: number) => string;
  tryButton: string;
};

export type LampState = "sleeping" | "charging" | "too-low" | "too-high" | "lit";

export type ForestRpgContent = {
  id: string;
  chapterTitle: string;
  name: string;
  route: string;
  encounters: ForestEncounter[];
  rewards: {
    item: string;
  };
  prompts: {
    intro: string;
    mission: string;
    oneFruit: string;
    bagReady: string;
    tryingLamp: string;
    tooLow: string;
    tooHigh: string;
    result: string;
    follow: string;
    gate: string;
    bridgeIntro: string;
    forestCenter: string;
    seedAwake: string;
    complete: string;
  };
  intro: {
    title: string;
    line: string;
    detail: string;
  };
  mission: {
    title: string;
    line: string;
    goal: string;
    fragmentGoal: string;
    pathGoal: string;
  };
  gateScene: {
    title: string;
    line: string;
    secondLine: string;
    novaLine: string;
  };
  bridgeScene: {
    title: string;
    line: string;
    secondLine: string;
    novaLine: string;
  };
  forestCenter: {
    title: string;
    line: string;
    actionLine: string;
    awakeTitle: string;
    awakeLine: string;
    novaLine: string;
  };
  finalComplete: {
    title: string;
    seed: string;
    friends: string;
    progress: string;
    fragments: string;
    bridge: string;
    hookTitle: string;
    hookLine: string;
    hookDetail: string;
    novaHook: string;
    novaReflection: string;
  };
  narrative: {
    resultPerfectTitle: string;
    resultSuccessTitle: string;
    friendLine: string;
    followTitle: string;
    followLine: string;
    secondFollowTitle: string;
    secondFollowLine: string;
    firstFragmentLine: string;
    firstDirectionLine: string;
    secondFriendsLine: string;
    secondGateLine: string;
    bridgeFragmentLine: string;
  };
  novaLines: {
    intro: string;
    needTwoFruits: string;
    needOneFruit: string;
    goLamp: string;
    tooLow: string;
    tooHigh: string;
    complete: string;
  };
  buttons: {
    start: string;
    startMission: string;
    retry: string;
    continueForward: string;
    openGate: string;
    enterGate: string;
    startBridge: string;
    goForestCenter: string;
    placeFragments: string;
    lightForestPath: string;
    replay: string;
    backToAdventure: string;
  };
};

export const forestRpgContent: ForestRpgContent = {
  id: "forest-rpg-starlight-lamp",
  chapterTitle: "第一章：森林小路 · 星光种子",
  name: "森林小路 · 星光种子",
  route: "/adventure/forest-rpg",
  encounters: [
    {
      id: "first-spirit",
      kind: "spirit",
      title: "第一只小精灵",
      targetEnergy: 10,
      fruits: [
        { id: "first-fruit-6", value: 6, label: "6", position: { x: 25, y: 43 } },
        { id: "first-fruit-4", value: 4, label: "4", position: { x: 82, y: 52 } },
        { id: "first-fruit-3", value: 3, label: "3", position: { x: 36, y: 32 } },
        { id: "first-fruit-8", value: 8, label: "8", position: { x: 58, y: 24 } }
      ],
      correctPair: [6, 4],
      progressText: "森林小路亮起 1/3",
      successText: "第一只小精灵醒来了！",
      rewardText: "星光碎片 +1",
      startPrompt: "先去捡一颗发光能量果",
      mapLine: "森林睡着了，我们一起把星光叫醒吧。",
      firstFruitLine: (value) => `你找到了 ${value} 号能量果。再找一颗试试看。`,
      bagFullLine: "背包装满啦。现在去点亮星光灯。",
      justRightLine: "刚刚好！第一盏星光灯亮起来了！",
      successSummary: (x, y) => `原来 ${x} 和 ${y} 放在一起，刚好能点亮星光灯。`,
      tryButton: "去点亮星光灯"
    },
    {
      id: "second-spirit",
      kind: "spirit",
      title: "第二只小精灵",
      targetEnergy: 10,
      fruits: [
        { id: "second-fruit-7", value: 7, label: "7", position: { x: 28, y: 31 } },
        { id: "second-fruit-3", value: 3, label: "3", position: { x: 74, y: 36 } },
        { id: "second-fruit-5", value: 5, label: "5", position: { x: 22, y: 52 } },
        { id: "second-fruit-8", value: 8, label: "8", position: { x: 82, y: 55 } }
      ],
      correctPair: [7, 3],
      progressText: "森林小路亮起 2/3",
      successText: "第二只小精灵也醒来了！",
      rewardText: "星光碎片 +1",
      startPrompt: "前面还有一团瞌睡迷雾",
      mapLine: "这次你来找刚刚好的能量果。",
      firstFruitLine: (value) => `这颗是 ${value} 号能量果。再选一颗，让它们合成 10。`,
      bagFullLine: "两颗能量果准备好了。去试试第二盏星光灯。",
      justRightLine: "太好了！第二盏星光灯也亮起来了！",
      successSummary: (x, y) => `${x} 和 ${y} 合在一起也是 10，第二团迷雾散开了。`,
      tryButton: "去点亮星光灯"
    },
    {
      id: "star-bridge",
      kind: "bridge",
      title: "星光桥",
      targetEnergy: 10,
      fruits: [
        { id: "bridge-fruit-5a", value: 5, label: "5", position: { x: 24, y: 34 } },
        { id: "bridge-fruit-5b", value: 5, label: "5", position: { x: 76, y: 35 } },
        { id: "bridge-fruit-2", value: 2, label: "2", position: { x: 24, y: 54 } },
        { id: "bridge-fruit-8", value: 8, label: "8", position: { x: 82, y: 53 } }
      ],
      correctPair: [5, 5],
      progressText: "森林小路亮起 3/3",
      successText: "星光桥亮起来了！",
      rewardText: "星光碎片 +1",
      startPrompt: "点亮桥心灯，修复星光桥",
      mapLine: "点亮桥心灯，桥就能重新连起来。",
      firstFruitLine: (value) => `你带上了 ${value} 号能量果。再找一颗让桥心灯亮起来。`,
      bagFullLine: "桥心灯在等能量。去试试看。",
      justRightLine: "星光桥亮起来了！",
      successSummary: (x, y) => `${x} 和 ${y} 合成 10，桥心灯把星光桥连起来了。`,
      tryButton: "点亮桥心灯"
    }
  ],
  rewards: {
    item: "星光碎片"
  },
  prompts: {
    intro: "远处有一个小光点",
    mission: "找回 3 片星光碎片",
    oneFruit: "再找一颗能量果",
    bagReady: "背包装满啦，去点亮目标",
    tryingLamp: "星光正在试能量",
    tooLow: "灯亮了一点，还差一些",
    tooHigh: "能量太多啦，星光有点晃",
    result: "星光亮起来了",
    follow: "前面还有一团瞌睡迷雾",
    gate: "迷雾门出现了",
    bridgeIntro: "门后有一座断开的星光桥",
    forestCenter: "把 3 片星光碎片送回去",
    seedAwake: "星光种子醒来了",
    complete: "第一章完成"
  },
  intro: {
    title: "森林的星光变暗了",
    line: "Nova 的小灯也变得很微弱。",
    detail: "远处有一个小小的光点，好像在向我们求助。"
  },
  mission: {
    title: "星光种子睡着了",
    line: "森林中心的星光种子睡着了。",
    goal: "我们要找回 3 片星光碎片，才能叫醒它。",
    fragmentGoal: "星光碎片 0/3",
    pathGoal: "森林小路 0/3"
  },
  gateScene: {
    title: "迷雾门出现了",
    line: "两个森林朋友一起发出星光。",
    secondLine: "远处的迷雾裂开了一条缝，一扇迷雾门露出来了。",
    novaLine: "它们好像一直在守着这扇门。两个森林朋友在帮我们打开它。"
  },
  bridgeScene: {
    title: "断开的星光桥",
    line: "星光桥断开了。",
    secondLine: "桥的另一边，就是森林中心。",
    novaLine: "门后面……还有一条断开的星光桥。点亮桥心灯，桥就能重新连起来。"
  },
  forestCenter: {
    title: "森林中心",
    line: "这里就是森林中心。星光种子睡着了。",
    actionLine: "把 3 片星光碎片送回去。",
    awakeTitle: "星光种子醒来了！",
    awakeLine: "森林小路完全亮起来了！",
    novaLine: "3 片星光碎片都找齐了。现在把它们送回星光种子吧。"
  },
  finalComplete: {
    title: "第一章完成！",
    seed: "星光种子已经醒来",
    friends: "森林朋友 2 个",
    progress: "森林小路亮起 3/3",
    fragments: "星光碎片 3/3",
    bridge: "星光桥已经恢复",
    hookTitle: "下一章：星光海",
    hookLine: "桥的另一边，出现了一片蓝金色的星光海。",
    hookDetail: "海面上，好像有会发光的数字石头。",
    novaHook: "Nova：那里……也有星光在变暗。",
    novaReflection: "你真的把森林小路叫醒了。一开始我还很紧张，现在森林又亮起来了。"
  },
  narrative: {
    resultPerfectTitle: "完美点亮！",
    resultSuccessTitle: "成功点亮！",
    friendLine: "它现在是你的森林朋友了。",
    followTitle: "它跟上来了！",
    followLine: "它轻轻指向森林深处。前面还有一个朋友在睡觉。",
    secondFollowTitle: "两个森林朋友都跟上来了",
    secondFollowLine: "远处有一扇被迷雾盖住的门。",
    firstFragmentLine: "它把一片星光碎片交给你。",
    firstDirectionLine: "它轻轻指向森林深处。",
    secondFriendsLine: "两个森林朋友一起发出星光。",
    secondGateLine: "远处的迷雾裂开了一条缝。",
    bridgeFragmentLine: "你找到了第 3 片星光碎片。"
  },
  novaLines: {
    intro: "森林睡着了，我们一起把星光叫醒吧。",
    needTwoFruits: "还需要两颗能量果。先去找果子吧。",
    needOneFruit: "还差一颗能量果。再找一颗吧。",
    goLamp: "把背包里的能量果放进去，看看星光会不会亮起来。",
    tooLow: "灯亮了一点，还差一些。换一颗能量更大的果子试试。",
    tooHigh: "能量太多啦，星光有点晃。换一颗小一点的试试。",
    complete: "你真的把森林小路叫醒了。现在森林又亮起来了。"
  },
  buttons: {
    start: "去看看那个光点",
    startMission: "找回星光碎片",
    retry: "重新找果子",
    continueForward: "跟着小精灵往前走",
    openGate: "靠近迷雾门",
    enterGate: "走进门后",
    startBridge: "修复星光桥",
    goForestCenter: "去森林中心",
    placeFragments: "放入星光碎片",
    lightForestPath: "点亮森林小路",
    replay: "再玩一次",
    backToAdventure: "回到入口"
  }
};
