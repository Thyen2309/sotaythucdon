// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./config/db');

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const groceryRoutes = require('./routes/groceryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/grocery', groceryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Meal Planner API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
