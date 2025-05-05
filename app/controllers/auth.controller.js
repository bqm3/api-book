const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const UserChapterLike = require("../models/userchapterlike.model");
const Story = require("../models/story.model");

exports.register = async (req, res) => {
  try {
    let { UserName, Password, Fullname, Age, role } = req.body;
    console.log("Register request body:", req.body); // Debug

    // Validate input
    if (!UserName || !Password) {
      return res
        .status(400)
        .json({ message: "Tên đăng nhập và mật khẩu là bắt buộc" });
    }

    Password = Password.trim();
    console.log("Trimmed password:", Password); // Debug
    role = role || "user";

    const existingUser = await User.findOne({ where: { UserName } });
    if (existingUser) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    const salt = genSaltSync(10);
    const hashedPassword = hashSync(Password, salt);
    console.log("Hashed Password:", hashedPassword); // Debug

    const newUser = await User.create({
      UserName,
      Password: hashedPassword,
      FullName: Fullname,
      Age,
      role,
    });

    console.log("Stored Password:", newUser.Password); // Debug
    return res
      .status(201)
      .json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

exports.login = async (req, res) => {
  try {
    const { UserName, Password } = req.body;

    // Validate input
    if (!UserName || !Password) {
      return res
        .status(400)
        .json({ message: "Tên đăng nhập và mật khẩu là bắt buộc" });
    }

    const trimmedPassword = Password.trim();

    const user = await User.findOne({ where: { UserName } });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    const isMatch = compareSync(trimmedPassword, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }

    const token = jwt.sign(
      { id: user.id, UserName: user.UserName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ message: "Đăng nhập thành công", token, user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
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
