const express = require("express");
const router = express.Router();
const { Tag } = require("../models");

// Tạo mới một Tag
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Tên tag là bắt buộc" });
    }

    const newTag = await Tag.create({ name });
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo tag", error: error.message });
  }
});

// Cập nhật một Tag
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag không tồn tại" });
    }

    tag.name = name;
    await tag.save();
    res.status(200).json(tag);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật tag", error: error.message });
  }
});

// Xóa một Tag
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag không tồn tại" });
    }

    await tag.destroy();
    res.status(200).json({ message: "Tag đã bị xóa" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa tag", error: error.message });
  }
});

// Lấy danh sách tất cả các Tag
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.status(200).json(tags);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách tag", error: error.message });
  }
});

module.exports = router;
