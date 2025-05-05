const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Category, Story, StoryTag, Tag } = require("../models/setup.model");

// Tạo mới một Category
router.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tên thể loại là bắt buộc" });
    }

    // Lấy tất cả các id đã có trong bảng Category
    const categories = await Category.findAll({ attributes: ["id"] });

    // Tìm số lớn nhất hiện tại
    let maxNumber = 0;
    categories.forEach((cat) => {
      const match = cat.id.match(/^CAT0*(\d+)$/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });

    // Sinh id mới
    const newId = "CAT" + (maxNumber + 1).toString().padStart(3, "0"); // Ví dụ CAT001, CAT002,...

    // Tạo Category mới
    const newCategory = await Category.create({
      id: newId,
      name,
      description,
      icon_url: null,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
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
