export type ForestRpgStage = "intro" | "map" | "collect" | "lamp" | "result" | "follow" | "secondIntro" | "complete";

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
  id: "first-spirit" | "second-spirit";
  title: string;
  targetEnergy: number;
  fruits: ForestFruit[];
  correctPair: [number, number];
  progressText: string;
  successText: string;
  startPrompt: string;
  mapLine: string;
  firstFruitLine: (value: number) => string;
  bagFullLine: string;
  justRightLine: string;
  successSummary: (x: number, y: number) => string;
};

export type LampState = "sleeping" | "charging" | "too-low" | "too-high" | "lit";

export type ForestRpgContent = {
  id: string;
  name: string;
  route: string;
  encounters: ForestEncounter[];
  rewards: {
    item: string;
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
    follow: string;
    complete: string;
  };
  narrative: {
    introTitle: string;
    introLine: string;
    lampTitle: string;
    resultPerfectTitle: string;
    resultSuccessTitle: string;
    friendLine: string;
    followTitle: string;
    followLine: string;
    followHint: string;
    rewardTitle: string;
    finalFriends: string;
    finalProgress: string;
    finalFragments: string;
    mistGateTitle: string;
    mistGateLine: string;
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
    tryLamp: string;
    clearBag: string;
    retry: string;
    continueForward: string;
    seeSpirit: string;
    mistGate: string;
    replay: string;
    backToAdventure: string;
  };
};

export const forestRpgContent: ForestRpgContent = {
  id: "forest-rpg-starlight-lamp",
  name: "森林小路 · 星光唤醒",
  route: "/adventure/forest-rpg",
  encounters: [
    {
      id: "first-spirit",
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
      startPrompt: "先去捡一颗发光能量果",
      mapLine: "先点一颗发光能量果。",
      firstFruitLine: (value) => `你找到了 ${value} 号能量果。再找一颗试试看。`,
      bagFullLine: "背包装满啦。现在去点亮星光灯。",
      justRightLine: "刚刚好！第一盏星光灯亮起来了！",
      successSummary: (x, y) => `原来 ${x} 和 ${y} 放在一起，刚好能点亮星光灯。`
    },
    {
      id: "second-spirit",
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
      startPrompt: "前面还有一团瞌睡迷雾",
      mapLine: "这次你来找刚刚好的两颗能量果。",
      firstFruitLine: (value) => `这颗是 ${value} 号能量果。再选一颗，让它们合成 10。`,
      bagFullLine: "两颗能量果准备好了。去试试第二盏星光灯。",
      justRightLine: "太好了！第二盏星光灯也亮起来了！",
      successSummary: (x, y) => `${x} 和 ${y} 合在一起也是 10，第二团迷雾散开了。`
    }
  ],
  rewards: {
    item: "星光碎片"
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
    follow: "前面还有一团瞌睡迷雾",
    complete: "森林小路亮起 2/3"
  },
  narrative: {
    introTitle: "星光灯变暗了",
    introLine: "瞌睡迷雾飘到森林小路，小精灵在星光灯旁边睡着了。",
    lampTitle: "星光灯能量",
    resultPerfectTitle: "完美点亮！",
    resultSuccessTitle: "成功点亮！",
    friendLine: "小精灵成为你的森林朋友",
    followTitle: "它跟上来了！",
    followLine: "前面好像还有一团瞌睡迷雾……我们去看看？",
    followHint: "小精灵跟上来了。",
    rewardTitle: "星光碎片 x2",
    finalFriends: "你救醒了 2 个森林朋友",
    finalProgress: "森林小路亮起 2/3",
    finalFragments: "星光碎片 x2",
    mistGateTitle: "远处的迷雾门露出来了",
    mistGateLine: "门后面，好像还有更大的秘密。"
  },
  novaLines: {
    intro: "小精灵睡着了。我们去帮它点亮星光灯吧。",
    needTwoFruits: "还需要两颗能量果。先去找果子吧。",
    needOneFruit: "还差一颗能量果。再找一颗吧。",
    goLamp: "把背包里的能量果放进星光灯，看看灯会不会亮起来。",
    tooLow: "灯亮了一点，还差一些。换一颗能量更大的果子试试。",
    tooHigh: "能量太多啦，星光灯有点晃。换一颗小一点的试试。",
    complete: "远处的迷雾门露出来了。门后面，好像还有更大的秘密。"
  },
  buttons: {
    start: "和 Nova 出发",
    tryLamp: "去点亮星光灯",
    clearBag: "换果子",
    retry: "重新找果子",
    continueForward: "继续往前走",
    seeSpirit: "继续往前走",
    mistGate: "继续探索迷雾门",
    replay: "再玩一次",
    backToAdventure: "回到入口"
  }
};
