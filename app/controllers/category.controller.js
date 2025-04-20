const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Category, Story, StoryTag, Tag } = require("../models/setup.model");

// Cấu hình Multer để lưu trữ file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/icon");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Tạo mới một Category
router.post("/categories", upload.single("icon"), async (req, res) => {
  try {
    const { id, name, description } = req.body;
    const icon_url = req.file ? `/public/icon/${req.file.filename}` : null;

    if (!id || !name) {
      return res
        .status(400)
        .json({ message: "ID và tên category là bắt buộc" });
    }

    const newCategory = await Category.create({
      id,
      name,
      description,
      icon_url,
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo category", error: error.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const newCategory = await Category.findAll();
    res.status(201).json(newCategory);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo category", error: error.message });
  }
});

router.get("/tags", async (req, res) => {
  try {
    const newCategory = await Tag.findAll();
    res.status(201).json(newCategory);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo category", error: error.message });
  }
});

// CRUD cho Story

// router.put("/stories/:id", upload.single("cover_image"), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, author, genre_id, description, status } = req.body;
//     const story = await Story.findByPk(id);
//     if (!story) {
//       return res.status(404).json({ message: "Story không tồn tại" });
//     }
//     story.title = title;
//     story.author = author;
//     story.genre_id = genre_id;
//     story.description = description;
//     story.status = status;
//     if (req.file) {
//       story.cover_image = `/public/icon/${req.file.filename}`;
//     }
//     await story.save();
//     res.status(200).json(story);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Lỗi khi cập nhật story", error: error.message });
//   }
// });

router.delete("/stories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findByPk(id);
    if (!story) {
      return res.status(404).json({ message: "Story không tồn tại" });
    }
    await story.destroy();
    res.status(200).json({ message: "Story đã bị xóa" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa story", error: error.message });
  }
});

// Thêm tag vào Story
router.post("/stories/:story_id/tags/:tag_id", async (req, res) => {
  try {
    const { story_id, tag_id } = req.params;
    await StoryTag.create({ story_id, tag_id });
    res.status(201).json({ message: "Tag đã được thêm vào Story" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi thêm tag vào story", error: error.message });
  }
});

// Xóa tag khỏi Story
router.delete("/stories/:story_id/tags/:tag_id", async (req, res) => {
  try {
    const { story_id, tag_id } = req.params;
    await StoryTag.destroy({ where: { story_id, tag_id } });
    res.status(200).json({ message: "Tag đã bị xóa khỏi story" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa tag khỏi story", error: error.message });
  }
});

// Lấy danh sách tất cả các Story với Tag
router.get("/stories", async (req, res) => {
  try {
    const stories = await Story.findAll({
      // include: [{ model: Tag, through: StoryTag }],
    });
    res.status(200).json(stories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách story", error: error.message });
  }
});

module.exports = router;
