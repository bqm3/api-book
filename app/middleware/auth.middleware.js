const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.middlewareAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - Missing Token" });
  }

  try {
    const token = authHeader.split(" ")[1]; // Lấy token từ header
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra user có tồn tại không
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - User not found" });
    }

    req.user = user; // Gán user vào request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};
