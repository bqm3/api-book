const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { UserName, Password, FullName, Age, role } = req.body;

    const existingUser = await User.findOne({ where: { UserName } });
    if (existingUser)
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

    const newUser = await User.create({
      UserName,
      Password,
      FullName,
      Age,
      role,
    });

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

exports.login = async (req, res) => {
  try {
    const { UserName, Password } = req.body;

    const user = await User.findOne({ where: { UserName } });
    if (!user)
      return res.status(400).json({ message: "Tài khoản không tồn tại" });

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không chính xác" });

    const token = jwt.sign(
      { id: user.id, UserName: user.UserName },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({ message: "Đăng nhập thành công", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["Password"] },
    });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
