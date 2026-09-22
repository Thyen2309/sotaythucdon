import { initialRecipes as mockData } from '../data/mockData';
import { emptyMealPlan } from '../data/constants';

const RECIPES_KEY = 'recipes';
const MEAL_PLAN_KEY = 'mealPlan';
const GROCERY_CHECKS_KEY = 'groceryChecks';
const TOKEN_KEY = 'bepnha_auth_token';

const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const syncFromSQL = async () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/user-data', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.recipes) localStorage.setItem(RECIPES_KEY, JSON.stringify(data.recipes));
    if (data.mealPlan) localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(data.mealPlan));
    if (data.groceryChecks) localStorage.setItem(GROCERY_CHECKS_KEY, JSON.stringify(data.groceryChecks));

    // Dispatch event so active pages refresh seamlessly
    window.dispatchEvent(new CustomEvent('bepnha_data_updated', { detail: data }));
    return data;
  } catch (err) {
    console.warn('Cannot sync from SQL server:', err);
    return null;
  }
};

const INIT_FLAG_KEY = 'bepnha_v2_initialized';

export const initData = () => {
  const isInitialized = localStorage.getItem(INIT_FLAG_KEY);
  const existing = readJson(RECIPES_KEY, null);

  if (!isInitialized || !existing || !Array.isArray(existing)) {
    const validExisting = Array.isArray(existing) ? existing : [];
    const customRecipes = validExisting.filter(
      (r) => !mockData.some((m) => m.id === r.id) && r.image && !r.image.includes('placehold.co')
    );
    localStorage.setItem(RECIPES_KEY, JSON.stringify([...mockData, ...customRecipes]));
    localStorage.setItem(INIT_FLAG_KEY, 'true');
  }

  if (!localStorage.getItem(MEAL_PLAN_KEY)) {
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(emptyMealPlan()));
  }
  if (!localStorage.getItem(GROCERY_CHECKS_KEY)) {
    localStorage.setItem(GROCERY_CHECKS_KEY, JSON.stringify({}));
  }
};

export const getRecipes = () => {
  initData();
  return readJson(RECIPES_KEY, mockData);
};

export const saveRecipe = (recipe) => {
  const recipes = getRecipes();
  const index = recipes.findIndex((item) => item.id === recipe.id);
  if (index >= 0) {
    recipes[index] = recipe;
  } else {
    recipes.unshift(recipe);
  }
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));

  // Sync with SQL backend if logged in
  const token = getAuthToken();
  if (token) {
    fetch('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(recipe),
    }).catch((err) => console.warn('Sync recipe to SQL failed:', err));
  }

  window.dispatchEvent(new CustomEvent('bepnha_data_updated'));
  return recipes;
};

export const deleteRecipe = (recipeId) => {
  const recipes = getRecipes().filter((item) => item.id !== recipeId);
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));

  // Remove this recipe from meal plan if it was assigned
  const plan = getMealPlan();
  let planChanged = false;
  Object.keys(plan).forEach((dayKey) => {
    Object.keys(plan[dayKey]).forEach((mealKey) => {
      if (plan[dayKey][mealKey] === recipeId) {
        plan[dayKey][mealKey] = '';
        planChanged = true;
      }
    });
  });
  if (planChanged) {
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
  }

  // Dispatch event so active pages refresh immediately
  window.dispatchEvent(new CustomEvent('bepnha_data_updated', { detail: { recipes, mealPlan: plan } }));

  // Sync with SQL backend if logged in
  const token = getAuthToken();
  if (token) {
    fetch(`/api/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch((err) => console.warn('Delete recipe from SQL failed:', err));
  }

  return recipes;
};

export const getMealPlan = () => {
  initData();
  return { ...emptyMealPlan(), ...readJson(MEAL_PLAN_KEY, {}) };
};

export const saveMealPlan = (plan) => {
  localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));

  // Sync with SQL backend if logged in
  const token = getAuthToken();
  if (token) {
    fetch('/api/meal-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(plan),
    }).catch((err) => console.warn('Sync meal plan to SQL failed:', err));
  }

  return plan;
};

export const getGroceryChecks = () => {
  initData();
  return readJson(GROCERY_CHECKS_KEY, {});
};

export const saveGroceryChecks = (checks) => {
  localStorage.setItem(GROCERY_CHECKS_KEY, JSON.stringify(checks));

  // Sync with SQL backend if logged in
  const token = getAuthToken();
  if (token) {
    fetch('/api/grocery-checks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(checks),
    }).catch((err) => console.warn('Sync grocery checks to SQL failed:', err));
  }

  return checks;
};

