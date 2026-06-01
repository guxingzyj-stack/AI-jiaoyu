export type ForestRpgStage = "intro" | "map" | "collect" | "lamp" | "result" | "complete";

export type ForestFruit = {
  id: string;
  value: number;
  label: string;
  position: {
    x: number;
    y: number;
  };
};

export type LampState = "sleeping" | "charging" | "too-low" | "too-high" | "lit";

export type ForestRpgContent = {
  id: string;
  name: string;
  route: string;
  targetEnergy: number;
  fruits: ForestFruit[];
  rewards: {
    item: string;
    amount: number;
  };
  stageLabels: {
    intro: string;
    collect: string;
    lamp: string;
    perfect: string;
    success: string;
    complete: string;
  };
  prompts: {
    intro: string;
    emptyBag: string;
    oneFruit: string;
    bagReady: string;
    tryingLamp: string;
    tooLow: string;
    tooHigh: string;
    result: string;
    complete: string;
  };
  narrative: {
    introTitle: string;
    introLine: string;
    mapGoal: string;
    lampTitle: string;
    resultPerfectTitle: string;
    resultSuccessTitle: string;
    completeTitle: string;
    completeLine: string;
    friendLine: string;
    rewardTitle: string;
    pathProgress: string;
    hookLine: string;
  };
  novaLines: {
    intro: string;
    map: string;
    firstFruit: (value: number) => string;
    bagFull: string;
    needTwoFruits: string;
    needOneFruit: string;
    goLamp: string;
    tooLow: string;
    tooHigh: string;
    justRight: string;
    successSummary: (x: number, y: number) => string;
    complete: string;
  };
  buttons: {
    start: string;
    tryLamp: string;
    clearBag: string;
    retry: string;
    seeSpirit: string;
    replay: string;
    backToAdventure: string;
  };
};

export const forestRpgContent: ForestRpgContent = {
  id: "forest-rpg-starlight-lamp",
  name: "森林小路 · 星光唤醒",
  route: "/adventure/forest-rpg",
  targetEnergy: 10,
  fruits: [
    { id: "fruit-6", value: 6, label: "6", position: { x: 20, y: 50 } },
    { id: "fruit-4", value: 4, label: "4", position: { x: 82, y: 52 } },
    { id: "fruit-3", value: 3, label: "3", position: { x: 36, y: 32 } },
    { id: "fruit-8", value: 8, label: "8", position: { x: 76, y: 34 } }
  ],
  rewards: {
    item: "星光碎片",
    amount: 1
  },
  stageLabels: {
    intro: "小路变暗",
    collect: "采集能量果",
    lamp: "星光灯",
    perfect: "完美点亮",
    success: "成功点亮",
    complete: "完成"
  },
  prompts: {
    intro: "看看森林小路发生了什么",
    emptyBag: "先去捡一颗发光能量果",
    oneFruit: "再找一颗能量果",
    bagReady: "背包装满啦，去点亮星光灯",
    tryingLamp: "星光灯正在试能量",
    tooLow: "灯亮了一点，还差一些",
    tooHigh: "能量太多啦，星光灯有点晃",
    result: "小精灵醒来了",
    complete: "森林亮起来了"
  },
  narrative: {
    introTitle: "星光灯变暗了",
    introLine: "瞌睡迷雾飘到森林小路，小精灵在星光灯旁边睡着了。",
    mapGoal: "在小路上找两颗能量果，带去星光灯旁边试试。",
    lampTitle: "星光灯能量",
    resultPerfectTitle: "完美点亮！",
    resultSuccessTitle: "成功点亮！",
    completeTitle: "森林小路亮起来了一小段",
    completeLine: "你和 Nova 救醒了第一个小精灵。",
    friendLine: "它现在是你的森林朋友了！",
    rewardTitle: "获得：第一片星光碎片",
    pathProgress: "森林小路亮起 1/3",
    hookLine: "前面好像还有一团瞌睡迷雾……也许还有小伙伴在等我们。"
  },
  novaLines: {
    intro: "小精灵睡着了。我们去帮它点亮星光灯吧。",
    map: "先点一颗发光能量果。",
    firstFruit: (value) => `你找到了 ${value} 号能量果。再找一颗试试看。`,
    bagFull: "背包装满啦。现在去点亮星光灯。",
    needTwoFruits: "还需要两颗能量果。先去找果子吧。",
    needOneFruit: "还差一颗能量果。再找一颗吧。",
    goLamp: "把背包里的能量果放进星光灯，看看灯会不会亮起来。",
    tooLow: "灯亮了一点，还差一些。换一颗能量更大的果子试试。",
    tooHigh: "能量太多啦，星光灯有点晃。换一颗小一点的试试。",
    justRight: "刚刚好！星光灯亮起来了！",
    successSummary: (x, y) => `原来 ${x} 和 ${y} 放在一起，刚好能点亮星光灯。`,
    complete: "前面好像还有一团瞌睡迷雾……也许还有小伙伴在等我们。"
  },
  buttons: {
    start: "和 Nova 出发",
    tryLamp: "去点亮星光灯",
    clearBag: "换果子",
    retry: "重新找果子",
    seeSpirit: "看看小精灵",
    replay: "再救醒一个小精灵",
    backToAdventure: "回到冒险入口"
  }
};
