import { CATEGORY_ORDER } from '../data/constants';

export const ingredientKey = (name, unit) =>
  `${name.trim().toLowerCase()}|${unit.trim().toLowerCase()}`;

export const buildGroceryList = (mealPlan, recipes) => {
  const recipeMap = Object.fromEntries(recipes.map((r) => [r.id, r]));
  const totals = new Map();

  Object.values(mealPlan).forEach((day) => {
    Object.values(day).forEach((recipeId) => {
      if (!recipeId) return;
      const recipe = recipeMap[recipeId];
      if (!recipe) return;
      recipe.ingredients.forEach((item) => {
        const key = ingredientKey(item.name, item.unit);
        const current = totals.get(key);
        if (current) {
          current.quantity += Number(item.quantity) || 0;
        } else {
          totals.set(key, {
            key,
            name: item.name,
            unit: item.unit,
            category: item.category,
            quantity: Number(item.quantity) || 0,
          });
        }
      });
    });
  });

  const grouped = {};
  [...totals.values()].forEach((item) => {
    const category = item.category || 'Khác';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(item);
  });

  Object.values(grouped).forEach((list) =>
    list.sort((a, b) => a.name.localeCompare(b.name, 'vi')),
  );

  const orderedKeys = [
    ...CATEGORY_ORDER.filter((cat) => grouped[cat]?.length),
    ...Object.keys(grouped)
      .filter((cat) => !CATEGORY_ORDER.includes(cat))
      .sort((a, b) => a.localeCompare(b, 'vi')),
  ];

  return orderedKeys.map((category) => ({
    category,
    items: grouped[category],
  }));
};
