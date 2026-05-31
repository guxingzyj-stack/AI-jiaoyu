export type ForestRpgStage = "intro" | "moving" | "encounter" | "awaken" | "reward" | "complete";

export type ForestRpgContent = {
  id: string;
  name: string;
  route: string;
  target: number;
  energyNumbers: number[];
  rewards: {
    item: string;
    amount: number;
  };
  narrative: {
    introTitle: string;
    introLine: string;
    movingGoal: string;
    encounterTitle: string;
    encounterLine: string;
    awakenTitle: string;
    rewardTitle: string;
    completeTitle: string;
    completeLine: string;
  };
  novaLines: Record<ForestRpgStage, string> & {
    firstPick: (value: number) => string;
    wrongPair: (x: number, y: number, sum: number) => string;
    correctPair: (x: number, y: number) => string;
    perfectReward: string;
    retryReward: string;
  };
  buttons: {
    start: string;
    beginAwaken: string;
    continueForward: string;
    replay: string;
    backToAdventure: string;
  };
};

export const forestRpgContent: ForestRpgContent = {
  id: "forest-rpg-awakening",
  name: "森林小路 · 星光唤醒",
  route: "/adventure/forest-rpg",
  target: 10,
  energyNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  rewards: {
    item: "星光碎片",
    amount: 1
  },
  narrative: {
    introTitle: "森林小路暗下来了",
    introLine: "瞌睡迷雾轻轻飘来，小路上的星光变得很小很小。",
    movingGoal: "沿着森林小路，去看看前方的迷雾。",
    encounterTitle: "发现沉睡的小精灵",
    encounterLine: "它不是坏孩子，它被瞌睡迷雾困住了。",
    awakenTitle: "合成 10，驱散迷雾",
    rewardTitle: "小精灵醒来了！",
    completeTitle: "森林小路重新亮起来了",
    completeLine: "你和 Nova 救醒了第一个小精灵。"
  },
  novaLines: {
    intro: "森林睡着了……只有你能帮我把它叫醒！",
    moving: "我看到前面有一团瞌睡迷雾，我们轻轻过去看看。",
    encounter: "它不是坏孩子，它被瞌睡迷雾困住了。我们合出 10，就能把迷雾吹散！",
    awaken: "把两个数字能量球合成 10，就能吹散迷雾。",
    reward: "你看！小精灵醒来了，森林也亮起来了！",
    complete: "你已经不是只跟着我走了，你也能帮我一起点亮星球了。",
    firstPick: (value) => `你选了 ${value}。再找一个数，让它们合起来变成 10。`,
    wrongPair: (x, y, sum) => `${x} 加 ${y} 是 ${sum}，还没到 10。我们再试一次。`,
    correctPair: (x, y) => `就是它！${x} 加 ${y} 正好是 10！星光唤醒，开始！`,
    perfectReward: "完美唤醒！你一眼就找到了能量组合！",
    retryReward: "成功啦！我们一起把迷雾吹散了。"
  },
  buttons: {
    start: "和 Nova 出发",
    beginAwaken: "开始唤醒",
    continueForward: "继续看看前方",
    replay: "再唤醒一次",
    backToAdventure: "回到冒险入口"
  }
};
