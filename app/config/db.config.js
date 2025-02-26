const { Sequelize } = require("sequelize");
require("dotenv").config(); // Đảm bảo đã load .env

const sequelize = new Sequelize(
  process.env.DB_DATABASE_NAME, // Kiểm tra biến này
  process.env.DB_USERNAME, // Kiểm tra biến này
  process.env.DB_PASSWORD, // Kiểm tra biến này
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ Kết nối MySQL thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MySQL:", err));

module.exports = sequelize;
