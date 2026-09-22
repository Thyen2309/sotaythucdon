// controllers/groceryController.js
const { sql, poolPromise } = require('../config/db');

const generateList = async (req, res) => {
  try {
    const { recipe_ids } = req.body;

    if (!Array.isArray(recipe_ids) || recipe_ids.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp danh sách recipe_ids (mảng số nguyên)' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    const paramNames = recipe_ids.map((id, index) => {
      const name = `id_${index}`;
      request.input(name, sql.Int, id);
      return `@${name}`;
    });

    const query = `
      SELECT 
        i.ingredient_id,
        i.name,
        i.category,
        ri.unit,
        SUM(ri.quantity) AS total_quantity
      FROM Recipe_Ingredients ri
      JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
      WHERE ri.recipe_id IN (${paramNames.join(', ')})
      GROUP BY i.ingredient_id, i.name, i.category, ri.unit
      ORDER BY i.category, i.name
    `;

    const result = await request.query(query);

    const categorizedList = {};

    result.recordset.forEach((item) => {
      const category = item.category || 'Khác';
      if (!categorizedList[category]) {
        categorizedList[category] = [];
      }
      categorizedList[category].push({
        ingredient_id: item.ingredient_id,
        name: item.name,
        total_quantity: Number(item.total_quantity),
        unit: item.unit,
      });
    });

    return res.status(200).json({
      total_items: result.recordset.length,
      categories: categorizedList,
    });
  } catch (err) {
    console.error('Lỗi generateList:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};

module.exports = {
  generateList,
};
