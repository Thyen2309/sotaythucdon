import { DAYS, MEALS } from '../data/constants';

const shuffle = (items) => {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

const pickId = (recipes) => {
  if (!recipes.length) return '';
  return recipes[Math.floor(Math.random() * recipes.length)].id;
};

export const fillRandomMeals = (
  plan,
  recipes,
  { onlyEmpty = false, dayKey, style = 'smart' } = {}
) => {
  if (!recipes.length) return plan;

  const next = { ...plan };
  const dayKeys = dayKey ? [dayKey] : DAYS.map((day) => day.key);

  const comNhaPool = recipes.filter((r) => r.mealStyle === 'com-nha');
  const hangQuanPool = recipes.filter((r) => r.mealStyle === 'hang-quan');

  const getCandidatePool = (mealKey) => {
    if (style === 'com-nha') {
      return comNhaPool.length ? comNhaPool : recipes;
    }
    if (style === 'hang-quan') {
      return hangQuanPool.length ? hangQuanPool : recipes;
    }
    if (style === 'smart') {
      // Breakfast prefers street food / quick breakfast; Lunch & Dinner prefer home cooked meals
      if (mealKey === 'breakfast') {
        return hangQuanPool.length ? hangQuanPool : recipes;
      }
      return comNhaPool.length ? comNhaPool : recipes;
    }
    return recipes;
  };

  // Track meal frequency to maximize meal variety throughout the week
  const usedCounts = new Map();
  if (onlyEmpty) {
    Object.values(next).forEach((day) => {
      Object.values(day).forEach((id) => {
        if (id) usedCounts.set(id, (usedCounts.get(id) || 0) + 1);
      });
    });
  }

  dayKeys.forEach((key) => {
    const row = { ...(next[key] || {}) };
    const slots = onlyEmpty
      ? MEALS.filter((meal) => !row[meal.key])
      : MEALS;

    slots.forEach((meal) => {
      const candidates = getCandidatePool(meal.key);
      const shuffled = shuffle(candidates);
      // Sort to prioritize dishes eaten least this week
      shuffled.sort((a, b) => (usedCounts.get(a.id) || 0) - (usedCounts.get(b.id) || 0));
      const picked = shuffled[0]?.id || pickId(recipes);
      row[meal.key] = picked;
      usedCounts.set(picked, (usedCounts.get(picked) || 0) + 1);
    });

    next[key] = row;
  });

  return next;
};

