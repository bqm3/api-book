const fs = require("fs");
const express = require("express");
const multer = require("multer");
const path = require("path");
const { Story } = require("../models/setup.model");

const router = express.Router();

// 🟢 Tạo thư mục `public/story_covers` nếu chưa có
const uploadDir = path.join(__dirname, "../public/story_covers");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu ảnh vào `public/story_covers`
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Đường dẫn thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/stories", upload.single("cover_image"), async (req, res) => {
  try {
    const { title, author, genre_id, description, status } = req.body;
    const cover_image = req.file
      ? `${req.protocol}://${req.get("host")}/public/story_covers/${
          req.file.filename
        }`
      : null;

    const storyId = `ST${Date.now().toString().slice(-8)}`;

    const newStory = await Story.create({
      id: storyId,
      title,
      author,
      genre_id,
      description,
      cover_image,
      status,
    });
    return res.status(201).json(newStory);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo story", error: error.message });
  }
});
// 🟢 API Cập nhật Story với file upload
router.put("/stories/:id", upload.single("cover_image"), async (req, res) => {
  try {
    const { title, author, genre_id, description, status } = req.body;
    const story = await Story.findByPk(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Truyện không tồn tại" });
    }

    // Cập nhật dữ liệu
    story.title = title;
    story.author = author;
    story.genre_id = genre_id;
    story.description = description;
    story.status = status;

    // Kiểm tra nếu có file ảnh mới thì cập nhật đường dẫn ảnh
    if (req.file) {
      story.cover_image = `${req.protocol}://${req.get(
        "host"
      )}/public/story_covers/${req.file.filename}`;
    }

    await story.save();

    res.status(200).json({ message: "Cập nhật truyện thành công", story });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật truyện", error: error.message });
  }
});

module.exports = router;
