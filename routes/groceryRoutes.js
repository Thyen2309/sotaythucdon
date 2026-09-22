// routes/groceryRoutes.js
const express = require('express');
const router = express.Router();
const { generateList } = require('../controllers/groceryController');

router.post('/generate', generateList);

module.exports = router;
