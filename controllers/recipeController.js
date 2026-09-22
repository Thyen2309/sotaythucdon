// controllers/recipeController.js
const { sql, poolPromise } = require('../config/db');

const getRecipes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        r.recipe_id,
        r.name AS recipe_name,
        r.description,
        r.image_url,
        r.created_by,
        r.created_at,
        ri.ingredient_id,
        i.name AS ingredient_name,
        i.category AS ingredient_category,
        ri.quantity,
        ri.unit
      FROM Recipes r
      LEFT JOIN Recipe_Ingredients ri ON r.recipe_id = ri.recipe_id
      LEFT JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
      ORDER BY r.recipe_id DESC
    `);

    const recipesMap = new Map();

    result.recordset.forEach((row) => {
      if (!recipesMap.has(row.recipe_id)) {
        recipesMap.set(row.recipe_id, {
          recipe_id: row.recipe_id,
          name: row.recipe_name,
          description: row.description,
          image_url: row.image_url,
          created_by: row.created_by,
          created_at: row.created_at,
          ingredients: [],
        });
      }

      if (row.ingredient_id) {
        recipesMap.get(row.recipe_id).ingredients.push({
          ingredient_id: row.ingredient_id,
          name: row.ingredient_name,
          category: row.ingredient_category,
          quantity: row.quantity,
          unit: row.unit,
        });
      }
    });

    const recipes = Array.from(recipesMap.values());
    return res.status(200).json(recipes);
  } catch (err) {
    console.error('Lỗi getRecipes:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};

const createRecipe = async (req, res) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    const { name, description, image_url, created_by, ingredients } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Tên món ăn là bắt buộc' });
    }

    await transaction.begin();

    const recipeRequest = new sql.Request(transaction);
    const recipeResult = await recipeRequest
      .input('name', sql.NVarChar(150), name)
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('image_url', sql.VarChar(255), image_url || null)
      .input('created_by', sql.Int, created_by || null)
      .query(`
        INSERT INTO Recipes (name, description, image_url, created_by)
        OUTPUT INSERTED.recipe_id, INSERTED.name, INSERTED.description, INSERTED.image_url, INSERTED.created_by, INSERTED.created_at
        VALUES (@name, @description, @image_url, @created_by)
      `);

    const newRecipe = recipeResult.recordset[0];
    const recipeId = newRecipe.recipe_id;

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      for (const item of ingredients) {
        let ingredientId = item.ingredient_id;

        if (!ingredientId && item.name) {
          const ingReq = new sql.Request(transaction);
          const findIng = await ingReq
            .input('name', sql.NVarChar(100), item.name)
            .query('SELECT ingredient_id FROM Ingredients WHERE name = @name');

          if (findIng.recordset.length > 0) {
            ingredientId = findIng.recordset[0].ingredient_id;
          } else {
            const createIngReq = new sql.Request(transaction);
            const createdIng = await createIngReq
              .input('name', sql.NVarChar(100), item.name)
              .input('category', sql.NVarChar(50), item.category || 'Khác')
              .input('default_unit', sql.NVarChar(20), item.unit || item.default_unit || '')
              .query(`
                INSERT INTO Ingredients (name, category, default_unit)
                OUTPUT INSERTED.ingredient_id
                VALUES (@name, @category, @default_unit)
              `);
            ingredientId = createdIng.recordset[0].ingredient_id;
          }
        }

        if (ingredientId) {
          const riReq = new sql.Request(transaction);
          await riReq
            .input('recipe_id', sql.Int, recipeId)
            .input('ingredient_id', sql.Int, ingredientId)
            .input('quantity', sql.Decimal(10, 2), item.quantity || 1)
            .input('unit', sql.NVarChar(20), item.unit || '')
            .query(`
              INSERT INTO Recipe_Ingredients (recipe_id, ingredient_id, quantity, unit)
              VALUES (@recipe_id, @ingredient_id, @quantity, @unit)
            `);
        }
      }
    }

    await transaction.commit();

    return res.status(201).json({
      message: 'Tạo món ăn thành công',
      recipe: {
        ...newRecipe,
        ingredients: ingredients || [],
      },
    });
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Lỗi createRecipe:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};

module.exports = {
  getRecipes,
  createRecipe,
};
