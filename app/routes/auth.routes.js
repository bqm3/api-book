const express = require("express");
const {
  register,
  login,
  getProfile,
} = require("../controllers/auth.controller");
const { middlewareAuth } = require("../middleware/auth.middleware");

const bcrypt = require("bcryptjs");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", middlewareAuth, getProfile);
router.post("/debug-hash", async (req, res) => {
  const { plain, hash } = req.body;

  const isMatch = await bcrypt.compare(plain, hash);

  return res.json({
    plain,
    hash,
    isMatch,
  });
});
module.exports = router;
