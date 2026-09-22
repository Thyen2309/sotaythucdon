import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import {
  createUser,
  findUserByUsername,
  findUserById,
  getUserRecipes,
  saveUserRecipe,
  deleteUserRecipe,
  getUserMealPlan,
  saveUserMealPlan,
  getUserGroceryChecks,
  saveUserGroceryChecks,
  seedDefaultRecipesForUser,
} from './db.js';
import { initialRecipes } from '../src/data/mockData.js';
import { emptyMealPlan } from '../src/data/constants.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'bepnha-secret-salt-key-2026';

app.use(cors());
app.use(express.json());

// Password Hashing with crypto (Pure Node.js built-in)
const hashPassword = (password) => {
  const salt = 'bepnha_salt_salt';
  return crypto.scryptSync(password, salt, 32).toString('hex');
};

// Signed Token Helpers
const createToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    createdAt: Date.now(),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(body)
    .digest('base64url');
  return `${body}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(body)
    .digest('base64url');
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload;
  } catch {
    return null;
  }
};

// Auth Middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
  }

  const user = findUserById(payload.id);
  if (!user) {
    return res.status(401).json({ error: 'Không tìm thấy thông tin tài khoản' });
  }

  req.user = user;
  next();
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Tên đăng nhập phải có ít nhất 3 ký tự' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const existing = findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Tên đăng nhập này đã được sử dụng' });
    }

    const passwordHash = hashPassword(password);
    const user = createUser(username, passwordHash, displayName || username);

    // Seed default recipes and initial empty plan for new user in SQL
    seedDefaultRecipesForUser(user.id, initialRecipes);
    saveUserMealPlan(user.id, emptyMealPlan());
    saveUserGroceryChecks(user.id, {});

    const token = createToken(user);

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi tạo tài khoản' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const user = findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác' });
    }

    const token = createToken(user);

    return res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng nhập' });
  }
});

// Current User profile
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// --- DATA SYNC ROUTES (SQL) ---

// Get all user data
app.get('/api/user-data', requireAuth, (req, res) => {
  try {
    let recipes = getUserRecipes(req.user.id);
    if (recipes.length === 0) {
      seedDefaultRecipesForUser(req.user.id, initialRecipes);
      recipes = getUserRecipes(req.user.id);
    }

    let mealPlan = getUserMealPlan(req.user.id);
    if (!mealPlan) {
      mealPlan = emptyMealPlan();
      saveUserMealPlan(req.user.id, mealPlan);
    }

    const groceryChecks = getUserGroceryChecks(req.user.id) || {};

    return res.json({
      recipes,
      mealPlan,
      groceryChecks,
    });
  } catch (err) {
    console.error('Fetch data error:', err);
    return res.status(500).json({ error: 'Lỗi tải dữ liệu người dùng từ CSDL' });
  }
});

// Save recipe
app.post('/api/recipes', requireAuth, (req, res) => {
  try {
    const recipe = req.body;
    if (!recipe || !recipe.id || !recipe.name) {
      return res.status(400).json({ error: 'Dữ liệu món ăn không hợp lệ' });
    }

    saveUserRecipe(req.user.id, recipe);
    const updatedRecipes = getUserRecipes(req.user.id);
    return res.json({ recipes: updatedRecipes });
  } catch (err) {
    console.error('Save recipe error:', err);
    return res.status(500).json({ error: 'Lỗi lưu món ăn vào CSDL' });
  }
});

// Delete recipe
app.delete('/api/recipes/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    deleteUserRecipe(req.user.id, id);
    const updatedRecipes = getUserRecipes(req.user.id);
    return res.json({ recipes: updatedRecipes });
  } catch (err) {
    console.error('Delete recipe error:', err);
    return res.status(500).json({ error: 'Lỗi xóa món ăn khỏi CSDL' });
  }
});

// Save meal plan
app.post('/api/meal-plan', requireAuth, (req, res) => {
  try {
    const plan = req.body;
    saveUserMealPlan(req.user.id, plan);
    return res.json({ mealPlan: plan });
  } catch (err) {
    console.error('Save meal plan error:', err);
    return res.status(500).json({ error: 'Lỗi lưu lịch tuần vào CSDL' });
  }
});

// Save grocery checks
app.post('/api/grocery-checks', requireAuth, (req, res) => {
  try {
    const checks = req.body;
    saveUserGroceryChecks(req.user.id, checks);
    return res.json({ groceryChecks: checks });
  } catch (err) {
    console.error('Save checks error:', err);
    return res.status(500).json({ error: 'Lỗi lưu danh sách đi chợ vào CSDL' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API Server running with SQLite on http://localhost:${PORT}`);
});
