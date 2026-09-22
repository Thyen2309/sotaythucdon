// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: full_name, email, password' });
    }

    const pool = await poolPromise;
    const checkUser = await pool
      .request()
      .input('email', sql.VarChar(100), email)
      .query('SELECT user_id FROM Users WHERE email = @email');

    if (checkUser.recordset.length > 0) {
      return res.status(409).json({ message: 'Email đã tồn tại trong hệ thống' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool
      .request()
      .input('full_name', sql.NVarChar(100), full_name)
      .input('email', sql.VarChar(100), email)
      .input('password_hash', sql.VarChar(255), password_hash)
      .query(`
        INSERT INTO Users (full_name, email, password_hash)
        OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.created_at
        VALUES (@full_name, @email, @password_hash)
      `);

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      user: result.recordset[0],
    });
  } catch (err) {
    console.error('Lỗi register:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và password' });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('email', sql.VarChar(100), email)
      .query('SELECT * FROM Users WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userProfile } = user;

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: userProfile,
    });
  } catch (err) {
    console.error('Lỗi login:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
};

module.exports = {
  register,
  login,
};
