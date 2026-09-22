import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.sqlite');

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys for high performance and integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize SQL Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_recipes (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    tag TEXT,
    category TEXT,
    meal_style TEXT,
    time TEXT,
    difficulty TEXT,
    servings TEXT,
    description TEXT,
    image TEXT,
    ingredients_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_meal_plans (
    user_id INTEGER PRIMARY KEY,
    plan_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_grocery_checks (
    user_id INTEGER PRIMARY KEY,
    checks_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export const createUser = (username, passwordHash, displayName) => {
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, display_name)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(username.trim().toLowerCase(), passwordHash, displayName.trim());
  return {
    id: Number(result.lastInsertRowid),
    username: username.trim().toLowerCase(),
    displayName: displayName.trim(),
  };
};

export const findUserByUsername = (username) => {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, display_name, created_at
    FROM users
    WHERE username = ?
  `);
  const row = stmt.get(username.trim().toLowerCase());
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
};

export const findUserById = (id) => {
  const stmt = db.prepare(`
    SELECT id, username, display_name, created_at
    FROM users
    WHERE id = ?
  `);
  const row = stmt.get(id);
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
};

export const getUserRecipes = (userId) => {
  const stmt = db.prepare(`
    SELECT id, name, tag, category, meal_style, time, difficulty, servings, description, image, ingredients_json, updated_at
    FROM user_recipes
    WHERE user_id = ?
    ORDER BY updated_at DESC
  `);
  const rows = stmt.all(userId);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    tag: r.tag,
    category: r.category,
    mealStyle: r.meal_style,
    time: r.time,
    difficulty: r.difficulty,
    servings: r.servings,
    description: r.description,
    image: r.image,
    ingredients: JSON.parse(r.ingredients_json || '[]'),
  }));
};

export const saveUserRecipe = (userId, recipe) => {
  const stmt = db.prepare(`
    INSERT INTO user_recipes (id, user_id, name, tag, category, meal_style, time, difficulty, servings, description, image, ingredients_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      tag = excluded.tag,
      category = excluded.category,
      meal_style = excluded.meal_style,
      time = excluded.time,
      difficulty = excluded.difficulty,
      servings = excluded.servings,
      description = excluded.description,
      image = excluded.image,
      ingredients_json = excluded.ingredients_json,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(
    recipe.id,
    userId,
    recipe.name,
    recipe.tag || recipe.category,
    recipe.category,
    recipe.mealStyle || 'com-nha',
    recipe.time || '',
    recipe.difficulty || 'Dễ',
    recipe.servings || '',
    recipe.description || '',
    recipe.image || '',
    JSON.stringify(recipe.ingredients || [])
  );
  return recipe;
};

export const deleteUserRecipe = (userId, recipeId) => {
  const stmt = db.prepare(`
    DELETE FROM user_recipes
    WHERE id = ? AND user_id = ?
  `);
  stmt.run(recipeId, userId);
  return true;
};

export const getUserMealPlan = (userId) => {
  const stmt = db.prepare(`
    SELECT plan_json FROM user_meal_plans WHERE user_id = ?
  `);
  const row = stmt.get(userId);
  return row ? JSON.parse(row.plan_json) : null;
};

export const saveUserMealPlan = (userId, plan) => {
  const stmt = db.prepare(`
    INSERT INTO user_meal_plans (user_id, plan_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      plan_json = excluded.plan_json,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, JSON.stringify(plan));
  return plan;
};

export const getUserGroceryChecks = (userId) => {
  const stmt = db.prepare(`
    SELECT checks_json FROM user_grocery_checks WHERE user_id = ?
  `);
  const row = stmt.get(userId);
  return row ? JSON.parse(row.checks_json) : {};
};

export const saveUserGroceryChecks = (userId, checks) => {
  const stmt = db.prepare(`
    INSERT INTO user_grocery_checks (user_id, checks_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      checks_json = excluded.checks_json,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, JSON.stringify(checks));
  return checks;
};

export const seedDefaultRecipesForUser = (userId, recipes) => {
  const existing = getUserRecipes(userId);
  if (existing.length === 0) {
    recipes.forEach((r) => {
      saveUserRecipe(userId, r);
    });
  }
};
