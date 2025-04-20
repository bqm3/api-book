const express = require("express");
const {
  register,
  login,
  getProfile,
} = require("../controllers/auth.controller");
const { middlewareAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", middlewareAuth, getProfile);

module.exports = router;
