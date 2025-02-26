const express = require("express");
const path = require("path");
require("dotenv").config(); // Load biến môi trường

const app = express();
const PORT = process.env.PORT || 3232;

// 🟢 Cho phép truy cập thư mục tĩnh 'public'
app.use("/public", express.static(path.join(__dirname, "app/public")));

// 🟢 Các route khác của API
const authRoutes = require("./app/routes/auth.routes");
const commonRoutes = require("./app/routes/common.routes");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/common", commonRoutes);

// 🟢 Chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
