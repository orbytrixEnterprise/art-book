const express = require('express');
const router = express.Router();
const { generateJson, generateFullJson } = require('../controllers/generateJsonController');

router.post('/generate-json', generateJson);
router.post('/generate-full-json', generateFullJson);

module.exports = router;
