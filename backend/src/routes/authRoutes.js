const express = require("express");
const { login } = require("../controllers/authController");

const router = express.Router();

// LOGIN ROUTE
router.post("/login", login);

module.exports = router;
