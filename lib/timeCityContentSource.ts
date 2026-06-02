import type { S4ChapterContent } from "./s4ChapterTypes";

export const timeCityContent: S4ChapterContent = {
  chapterTitle: "第四章：时间城",
  chapterSubtitle: "拨准时钟，排好列车，让城市重新转动",
  route: "/adventure/time-city",
  theme: "time",
  intro: {
    title: "时间城的列车停住了",
    body: "站台、时钟和列车顺序都乱了。看清几点出发、走了多久、谁先谁后，列车就能继续前进。",
    button: "修好时间城"
  },
  hud: {
    rewardLabel: "时间齿轮",
    coreLabel: "钟塔核心"
  },
  mapHint: "先拨站台时钟，再算到达时间、排列车顺序，最后修好到达桥。",
  nova: {
    intro: "时间会按顺序往前走。先看时钟，再数经过的时间。",
    idle: "点一个发光地点，去修那里的时间机关。",
    hint: "短针看小时，长针看分钟；从早到晚，小时间会变大。",
    complete: "时间城重新转动了，下一站是分数谷。"
  },
  edges: [
    ["station", "clock"],
    ["clock", "train-order"],
    ["train-order", "arrival-bridge"],
    ["arrival-bridge", "core"]
  ],
  nodes: [
    {
      id: "station",
      title: "站台时钟",
      shortTitle: "站台",
      description: "把第一座站台的时钟拨到整点。",
      assetKey: "station",
      position: { x: 18, y: 76 },
      reward: "时间齿轮 +1",
      mechanic: {
        type: "set-clock",
        prompt: "站台要 3:00 开门。点 3:00，让短针指向 3，长针指向 12。",
        success: "站台灯亮了，列车准备出发。",
        hint: "3:00 是三点整，不是 2:00，也不是 4:30。",
        options: ["2:00", "3:00", "4:30"],
        answer: "3:00"
      }
    },
    {
      id: "clock",
      title: "到达时钟",
      shortTitle: "时钟",
      description: "算出列车真正到达的平台时间。",
      assetKey: "clock",
      position: { x: 47, y: 58 },
      unlockAfter: ["station"],
      reward: "时间齿轮 +1",
      mechanic: {
        type: "duration-bridge",
        prompt: "列车 2:00 出发，走 1 小时 30 分钟。它会几点到？",
        success: "到达时钟拨准了，平台桥升起来。",
        hint: "2:00 先到 3:00，再多走半小时，就是 3:30。",
        options: ["3:00", "3:30", "4:00"],
        answer: "3:30"
      }
    },
    {
      id: "train-order",
      title: "列车顺序",
      shortTitle: "列车",
      description: "把三班列车从早到晚排进站台。",
      assetKey: "trainOrder",
      position: { x: 76, y: 42 },
      unlockAfter: ["clock"],
      reward: "时间齿轮 +1",
      mechanic: {
        type: "order-train",
        prompt: "按从早到晚的顺序点列车：先 2:00，再 3:00，最后 4:00。",
        success: "三班列车按顺序接好了。",
        hint: "先找最早的，再找中间的，最后找最晚的。",
        options: ["4:00", "2:00", "3:00"],
        answer: ["2:00", "3:00", "4:00"],
        targetCount: 3
      }
    },
    {
      id: "arrival-bridge",
      title: "到达桥",
      shortTitle: "到达桥",
      description: "算出桥什么时候放下。",
      assetKey: "bridge",
      position: { x: 42, y: 27 },
      unlockAfter: ["train-order"],
      reward: "时间齿轮 +1",
      mechanic: {
        type: "duration-bridge",
        prompt: "列车 1:30 出发，走 2 小时。到达桥应该几点打开？",
        success: "到达桥伸出金色轨道。",
        hint: "分钟还是 30，小时从 1 往后数两个：2、3。",
        options: ["2:30", "3:30", "4:00"],
        answer: "3:30"
      }
    },
    {
      id: "core",
      title: "钟塔核心",
      shortTitle: "钟塔",
      description: "放入时间齿轮，唤醒时间城。",
      assetKey: "core",
      position: { x: 70, y: 17 },
      unlockAfter: ["station", "clock", "train-order", "arrival-bridge"],
      mechanic: {
        type: "core",
        prompt: "时间齿轮集齐了，点亮钟塔核心。",
        success: "时间城重新转动起来！",
        hint: "先修好所有时间机关。",
        answer: "core"
      }
    }
  ],
  completion: {
    title: "时间城重新转动",
    summary: "你拨准了时钟，也让列车按正确顺序出发。",
    stats: ["时间齿轮 4/4", "列车顺序已排好", "钟塔核心已点亮"],
    nextHref: "/adventure/fraction-valley",
    nextLabel: "进入第五章：分数谷",
    replayLabel: "再修一次时间城"
  }
};
