import type { MistakeRecord, MonsterRecord, MonsterType } from "./learningProgress";

type MonsterTemplate = {
  name: string;
  title: string;
  description: string;
  weakness: string;
};

const monsterTemplates: Record<MonsterType, MonsterTemplate> = {
  careless: {
    name: "粗心怪",
    title: "闪电粗心怪",
    description: "它会在计算、符号和细节里突然放电，让答案偏离轨道。",
    weakness: "复盘时把每一步计算重新验算一遍，尤其检查符号和数字。"
  },
  illusion: {
    name: "幻象怪",
    title: "紫瞳幻象怪",
    description: "它会把题目条件藏起来，让你看漏关键字。",
    weakness: "先圈出已知条件和问题，再决定用什么方法。"
  },
  fog: {
    name: "迷雾怪",
    title: "蓝雾概念怪",
    description: "它会放出概念迷雾，让公式、单位和意义变得模糊。",
    weakness: "先说清楚概念含义，再代入数字。"
  },
  armor: {
    name: "铁甲怪",
    title: "铁甲方法怪",
    description: "它披着厚甲，专门挡住列式、列方程和解题方法。",
    weakness: "写出数量关系，再把关系翻译成算式或方程。"
  },
  vine: {
    name: "藤蔓怪",
    title: "藤蔓步骤怪",
    description: "它会缠住解题步骤，让推理顺序断开。",
    weakness: "把解题过程拆成 1、2、3 步，每步只做一件事。"
  },
  normal: {
    name: "小怪兽",
    title: "星尘小怪兽",
    description: "它来自一次还没完全复盘的错题，等你来整理它。",
    weakness: "先找错因，再复述正确方法。"
  }
};

export function resolveMonsterType(tags: string[]): MonsterType {
  const text = tags.join(" ");

  if (/计算错误|粗心|符号错误|正负数|运算|约分/.test(text)) {
    return "careless";
  }

  if (/审题错误|条件看漏|看漏|数量关系/.test(text)) {
    return "illusion";
  }

  if (/概念不清|概念|单位|单位判断错误|百分数|折扣|面积公式/.test(text)) {
    return "fog";
  }

  if (/方法不会|不会列式|不会列方程|方程|移项|公式应用/.test(text)) {
    return "armor";
  }

  if (/步骤混乱|推理断裂|通分|合并同类项|去括号/.test(text)) {
    return "vine";
  }

  return "normal";
}

export function createMonsterFromMistake(mistake: MistakeRecord): MonsterRecord {
  const type = resolveMonsterType(mistake.mistakeTags);
  const template = monsterTemplates[type];
  const mistakeId = mistake.id ?? `${mistake.questionId}-${mistake.createdAt}`;

  return {
    id: `monster-${mistake.questionId}`,
    mistakeId,
    questionId: mistake.questionId,
    name: template.name,
    type,
    title: template.title,
    description: template.description,
    weakness: template.weakness,
    knowledgePoint: mistake.knowledgePoint,
    status: "active",
    hp: 100,
    maxHp: 100,
    rewardExp: 30,
    rewardCoins: 5,
    createdAt: mistake.createdAt
  };
}

export function ensureMonstersForMistakes(
  mistakes: MistakeRecord[],
  monsters: MonsterRecord[]
): MonsterRecord[] {
  const existingQuestionIds = new Set(monsters.map((monster) => monster.questionId));
  const generated = mistakes
    .filter((mistake) => !existingQuestionIds.has(mistake.questionId))
    .map((mistake) => createMonsterFromMistake(mistake));

  return [...monsters, ...generated];
}

export function getMonsterVisual(type: MonsterType) {
  const visuals: Record<MonsterType, { icon: string; tone: string; label: string }> = {
    careless: {
      icon: "⚡",
      tone: "from-amber-300 to-orange-500",
      label: "粗心闪电怪"
    },
    illusion: {
      icon: "👁️",
      tone: "from-fuchsia-300 to-violet-600",
      label: "幻象审题怪"
    },
    fog: {
      icon: "🌫️",
      tone: "from-cyan-200 to-blue-500",
      label: "蓝雾概念怪"
    },
    armor: {
      icon: "🛡️",
      tone: "from-slate-300 to-blue-700",
      label: "铁甲方法怪"
    },
    vine: {
      icon: "🌿",
      tone: "from-emerald-300 to-green-600",
      label: "藤蔓步骤怪"
    },
    normal: {
      icon: "✨",
      tone: "from-pink-300 to-rose-500",
      label: "星尘小怪兽"
    }
  };

  return visuals[type];
}
