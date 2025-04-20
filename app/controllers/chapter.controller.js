const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const retry = require("async-retry");
const {
  Chapter,
  ChapterImage,
  Story,
  Category,
  Comment,
} = require("../models/setup.model");
const router = express.Router();

// Cấu hình Multer để lưu trữ ảnh
const uploadDir = path.join(__dirname, "../public/chapter_images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: "dftxlzy81",
  api_key: "741613966722548",
  api_secret: "Wdw-Kuna92IBGb9w6WDIcNYhy_I",
});

// Cấu hình Multer để lưu trữ ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Tạo mới Chapter với ảnh

router.post("/chapters", upload.array("images", 20), async (req, res) => {
  try {
    const { story_id, chapter_number, title, release_date, views } = req.body;
    console.log("req.body", req.body);
    const chapterId = `CH${Date.now().toString().slice(-8)}`;

    // Create new chapter
    const newChapter = await Chapter.create({
      id: chapterId,
      story_id,
      chapter_number,
      title,
      release_date,
      views: views || 0,
    });

    // Upload images to Cloudinary if present
    if (req.files && req.files.length > 0) {
      if (!newChapter || !newChapter.id) {
        return res
          .status(500)
          .json({ message: "Không thể tạo chapter, ID không tồn tại" });
      }

      try {
        const uploadBatchSize = 5; // Process 5 images at a time
        const imageRecords = [];

        for (let i = 0; i < req.files.length; i += uploadBatchSize) {
          const batch = req.files.slice(i, i + uploadBatchSize);
          const batchResults = await Promise.all(
            batch.map(async (file, index) => {
              // Retry upload up to 3 times
              const result = await retry(
                async () => {
                  return await cloudinary.uploader.upload(file.path, {
                    folder: "chapter_images",
                    public_id: `${chapterId}_${Date.now()}_${i + index}`,
                    timeout: 60000, // 60-second timeout
                    transformation: [
                      { width: 800, crop: "scale" },
                      { quality: "auto" },
                    ],
                  });
                },
                {
                  retries: 3,
                  minTimeout: 1000,
                  onRetry: (err) => {
                    console.warn(
                      `Retrying upload for ${file.path}: ${err.message}`
                    );
                  },
                }
              );

              // Delete temporary file asynchronously
              await fs
                .unlink(file.path)
                .catch((err) =>
                  console.error(`Failed to delete ${file.path}: ${err.message}`)
                );

              return {
                id: `${Date.now().toString().slice(-6)}${i + index}`,
                chapter_id: newChapter.id,
                image_url: result.secure_url,
                order: i + index + 1,
                description: "",
              };
            })
          );
          imageRecords.push(...batchResults);
        }

        // Save image records to database
        await ChapterImage.bulkCreate(imageRecords);
      } catch (imageError) {
        console.error("Lỗi khi lưu ảnh:", imageError);
        return res.status(500).json({
          message: "Lỗi khi lưu ảnh chương",
          error: imageError.message,
        });
      }
    }

    res.status(201).json({
      message: "Chapter và ảnh đã được tạo thành công!",
      chapter: newChapter,
    });
  } catch (error) {
    console.error("Lỗi khi tạo chapter:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi tạo chapter", error: error.message });
  }
});

router.put("/chapters/:id", upload.array("images", 20), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, chapter_number, release_date, views } = req.body;

    // Find and update chapter
    const chapter = await Chapter.findByPk(id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter không tồn tại" });
    }

    // Update chapter fields
    chapter.title = title ?? chapter.title;
    chapter.chapter_number = chapter_number ?? chapter.chapter_number;
    chapter.release_date = release_date ?? chapter.release_date;
    chapter.views = views ?? chapter.views;
    await chapter.save();

    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadBatchSize = 5; // Process 5 images at a time
      const imageRecords = [];

      for (let i = 0; i < req.files.length; i += uploadBatchSize) {
        const batch = req.files.slice(i, i + uploadBatchSize);
        const batchResults = await Promise.all(
          batch.map(async (file, index) => {
            try {
              // Retry upload up to 3 times
              const result = await retry(
                async () => {
                  return await cloudinary.uploader.upload(file.path, {
                    folder: "chapter_images",
                    public_id: `${id}_${Date.now()}_${i + index}`,
                    timeout: 60000, // 60-second timeout
                    transformation: [
                      { width: 800, crop: "scale" },
                      { quality: "auto" },
                    ],
                  });
                },
                {
                  retries: 3,
                  minTimeout: 1000,
                  onRetry: (err) => {
                    console.warn(
                      `Retrying upload for ${file.path}: ${err.message}`
                    );
                  },
                }
              );

              // Delete temporary file asynchronously
              await fs
                .unlink(file.path)
                .catch((err) =>
                  console.error(`Failed to delete ${file.path}: ${err.message}`)
                );

              return {
                id: `${Date.now().toString().slice(-6)}${i + index}`,
                chapter_id: id,
                image_url: result.secure_url,
                order: i + index + 1,
                description: "",
              };
            } catch (uploadError) {
              console.error(
                `Upload failed for ${file.path}: ${uploadError.message}`
              );
              throw uploadError; // Rethrow to fail the batch
            }
          })
        );
        imageRecords.push(...batchResults);
      }

      console.timeEnd("ImageUploads");
      console.time("DatabaseInsert");

      // Save image records to database
      await ChapterImage.bulkCreate(imageRecords);

      console.timeEnd("DatabaseInsert");
    }

    return res.status(200).json({
      message: "✅ Chapter đã được cập nhật!",
      chapter,
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({
      message: "❌ Lỗi khi cập nhật chapter",
      error: error.message,
      stack: error.stack, // Include stack trace for debugging
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
