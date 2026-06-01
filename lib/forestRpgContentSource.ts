export type ForestRpgStage = "intro" | "map" | "collect" | "lamp" | "result" | "follow" | "gate" | "bridgeIntro" | "complete";

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
    oneFruit: string;
    bagReady: string;
    tryingLamp: string;
    tooLow: string;
    tooHigh: string;
    result: string;
    follow: string;
    gate: string;
    bridgeIntro: string;
    complete: string;
  };
  intro: {
    title: string;
    line: string;
  };
  gateScene: {
    title: string;
    line: string;
    novaLine: string;
  };
  bridgeScene: {
    title: string;
    line: string;
    novaLine: string;
  };
  finalComplete: {
    title: string;
    friends: string;
    progress: string;
    fragments: string;
    bridge: string;
    hookTitle: string;
    hookLine: string;
    novaHook: string;
  };
  narrative: {
    resultPerfectTitle: string;
    resultSuccessTitle: string;
    friendLine: string;
    followTitle: string;
    followLine: string;
    secondFollowTitle: string;
    secondFollowLine: string;
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
    retry: string;
    continueForward: string;
    openGate: string;
    enterGate: string;
    startBridge: string;
    replay: string;
    backToAdventure: string;
  };
};

export const forestRpgContent: ForestRpgContent = {
  id: "forest-rpg-starlight-lamp",
  chapterTitle: "森林小路 · 星光唤醒完整章",
  name: "森林小路 · 星光唤醒",
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
    intro: "看看森林小路发生了什么",
    oneFruit: "再找一颗能量果",
    bagReady: "背包装满啦，去点亮目标",
    tryingLamp: "星光正在试能量",
    tooLow: "灯亮了一点，还差一些",
    tooHigh: "能量太多啦，星光有点晃",
    result: "星光亮起来了",
    follow: "前面还有一团瞌睡迷雾",
    gate: "迷雾门出现了",
    bridgeIntro: "门后有一座断开的星光桥",
    complete: "森林小路亮起 3/3"
  },
  intro: {
    title: "星光灯变暗了",
    line: "瞌睡迷雾罩住森林小路。Nova 请求你一起把星光叫醒。"
  },
  gateScene: {
    title: "迷雾门出现了",
    line: "两个森林朋友一起发光，灰蓝迷雾慢慢打开。",
    novaLine: "它们好像能帮我们打开迷雾门。"
  },
  bridgeScene: {
    title: "断开的星光桥",
    line: "门后有一座断开的星光桥。",
    novaLine: "点亮桥心灯，桥就能重新连起来。"
  },
  finalComplete: {
    title: "森林小路完全亮起来了！",
    friends: "你救醒了 2 个森林朋友",
    progress: "森林小路亮起 3/3",
    fragments: "星光碎片 x3",
    bridge: "星光桥已经恢复",
    hookTitle: "下一章：星光海即将开启",
    hookLine: "桥的另一边，出现了一片新的星光海。",
    novaHook: "Nova：那边好像是倍数海的方向……"
  },
  narrative: {
    resultPerfectTitle: "完美点亮！",
    resultSuccessTitle: "成功点亮！",
    friendLine: "它现在是你的森林朋友了。",
    followTitle: "它跟上来了！",
    followLine: "前面好像还有一团瞌睡迷雾……我们去看看？",
    secondFollowTitle: "两个森林朋友都跟上来了",
    secondFollowLine: "远处有一扇被迷雾盖住的门。"
  },
  novaLines: {
    intro: "森林睡着了，我们一起把星光叫醒吧。",
    needTwoFruits: "还需要两颗能量果。先去找果子吧。",
    needOneFruit: "还差一颗能量果。再找一颗吧。",
    goLamp: "把背包里的能量果放进去，看看星光会不会亮起来。",
    tooLow: "灯亮了一点，还差一些。换一颗能量更大的果子试试。",
    tooHigh: "能量太多啦，星光有点晃。换一颗小一点的试试。",
    complete: "桥的另一边，出现了一片新的星光海。那边好像是倍数海的方向……"
  },
  buttons: {
    start: "和 Nova 出发",
    retry: "重新找果子",
    continueForward: "继续往前走",
    openGate: "去看看迷雾门",
    enterGate: "进入迷雾门",
    startBridge: "修复星光桥",
    replay: "再玩一次",
    backToAdventure: "回到入口"
  }
};
