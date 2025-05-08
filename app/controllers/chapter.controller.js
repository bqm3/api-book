const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const {
  Chapter,
  ChapterImage,
  Story,
  Category,
  Comment,
} = require("../models/setup.model");
const router = express.Router();
const IP = require("../utils/config");
const PORT = process.env.PORT || 3232;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: "dftxlzy81",
  api_key: "741613966722548",
  api_secret: "Wdw-Kuna92IBGb9w6WDIcNYhy_I",
});

// Cấu hình Multer để lưu trữ ảnh
const CHAPTER_IMAGES_DIR = path.join(__dirname, "../public/chapter_images");

const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectoryExists(CHAPTER_IMAGES_DIR); // luôn lưu vào thư mục gốc
    cb(null, CHAPTER_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[-T:\.Z]/g, "") // bỏ ký tự không hợp lệ
      .slice(0, 14); // YYYYMMDDHHMMSS
    const uniqueName = `${timestamp}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Hàm tạo đường dẫn URL cho ảnh
const createImageUrl = (filename) => {
  return `http://${IP}:${PORT}/public/chapter_images/${filename}`;
};

// Route tạo chapter mới
router.post("/chapters", upload.array("images", 20), async (req, res) => {
  try {
    const { story_id, chapter_number, title, release_date, views, chapter_id } =
      req.body;

    const newChapter = await Chapter.create({
      id: chapter_id,
      story_id,
      chapter_number,
      title,
      release_date,
      views: views || 0,
    });

    const imageRecords = req.files.map((file, index) => ({
      id: `${Date.now().toString().slice(-6)}${index}`,
      chapter_id: chapter_id,
      image_url: createImageUrl(file.filename), // CHỈ truyền tên file
      order: index + 1,
      description: "",
    }));

    if (imageRecords.length > 0) {
      await ChapterImage.bulkCreate(imageRecords);
    }

    res.status(201).json({
      message: "Chapter và ảnh đã được tạo thành công!",
      chapter: newChapter,
      images: imageRecords,
    });
  } catch (error) {
    console.error("Lỗi khi tạo chapter:", error);
    res.status(500).json({
      message: "Lỗi khi tạo chapter",
      error: error.message,
    });
  }
});

// Route cập nhật chapter
router.put("/chapters/:id", upload.array("images", 20), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, chapter_number, release_date, views } = req.body;

    const chapter = await Chapter.findByPk(id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter không tồn tại" });
    }

    chapter.title = title ?? chapter.title;
    chapter.chapter_number = chapter_number ?? chapter.chapter_number;
    chapter.release_date = release_date ?? chapter.release_date;
    chapter.views = views ?? chapter.views;
    await chapter.save();
    console.log("req.files", req.files);

    const imageRecords = req.files.map((file, index) => ({
      id: `${Date.now().toString().slice(-6)}${index}`,
      chapter_id: id,
      image_url: createImageUrl(file.filename),
      order: index + 1,
      description: "",
    }));
    console.log("imageRecords", imageRecords);

    if (imageRecords.length > 0) {
      await ChapterImage.bulkCreate(imageRecords);
    }

    res.status(200).json({
      message: "✅ Chapter đã được cập nhật!",
      chapter,
      images: imageRecords,
    });
  } catch (error) {
    console.error("❌ Chapter update error:", error);
    res.status(500).json({
      message: "❌ Lỗi khi cập nhật chapter",
      error: error.message,
    });
  }
});

router.delete("/chapters/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    const deleted = await Comment.destroy({
      where: { id: commentId }, // ✅ Cần có `where`
    });

    if (deleted === 0) {
      return res.status(404).json({
        message: "Comment không tồn tại hoặc đã bị xóa",
      });
    }

    res.json({ message: "🗑️ Đã xóa comment thành công!" });
  } catch (err) {
    console.error("Lỗi khi xóa comment:", err);
    res
      .status(500)
      .json({ message: "❌ Lỗi khi xóa comment", error: err.message });
  }
});

router.get("/chapters/:id/images", async (req, res) => {
  try {
    const images = await ChapterImage.findAll({
      where: { chapter_id: req.params.id },
    });
    res.status(200).json(images);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy ảnh chapter", error: error.message });
  }
});

router.get("/stories/:id", async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id, {
      include: { model: Category, as: "category" },
    });

    if (!story) {
      return res.status(404).json({ message: "Truyện không tồn tại" });
    }

    res.status(200).json(story);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy dữ liệu truyện", error: error.message });
  }
});

router.get("/chapters/:id/detail", async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy thông tin chương
    const chapter = await Chapter.findByPk(id);
    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương" });
    }

    // Lấy danh sách ảnh chương
    const images = await ChapterImage.findAll({
      where: { chapter_id: id },
      order: [["order", "ASC"]],
    });

    // Lấy danh sách comment
    const comments = await Comment.findAll({
      where: { chapterId: id },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      chapter,
      images,
      comments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết chương:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết chương",
      error: error.message,
    });
  }
});

// POST: /api/common/chapter/:chapterId/comment
router.post("/common/chapter/:chapterId/comment", async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).json({ message: "Thiếu nội dung hoặc userId" });
    }

    // Tạo comment mới
    const newComment = await Comment.create({
      content,
      userId,
      chapterId,
    });

    // Trả về danh sách comment mới nhất nếu cần
    const comments = await Comment.findAll({
      where: { chapterId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(201).json({
      message: "Đã bình luận thành công",
      comments,
    });
  } catch (err) {
    console.error("❌ Lỗi khi gửi comment:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
