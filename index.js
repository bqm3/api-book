const express = require("express");
const path = require("path");
const os = require("os");
const cors = require("cors");
require("dotenv").config(); // Load biến môi trường

const app = express();
const PORT = process.env.PORT || 3232;

var corsOptions = {
  origin: ["*", "http://localhost:4000"],

  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(express.urlencoded({ extended: true })); // <-- cần dòng này nếu dùng @FormUrlEncoded

app.use(cors(corsOptions));
// 🟢 Cho phép truy cập thư mục tĩnh 'public'
app.use("/public", express.static(path.join(__dirname, "app/public")));

// 🟢 Các route khác của API
const authRoutes = require("./app/routes/auth.routes");
const commonRoutes = require("./app/routes/common.routes");
const categoryRoutes = require("./app/controllers/category.controller");
const chapterRoutes = require("./app/controllers/chapter.controller");
const storyRoutes = require("./app/controllers/story.controller");
const IP = require("./app/utils/config");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/common", commonRoutes);
app.use("/api", categoryRoutes);
app.use("/api", chapterRoutes);
app.use("/api", storyRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://${IP}:${PORT}`);
});
