const {
  Category,
  Story,
  Chapter,
  ChapterImage,
  Tag,
  StoryTag,
  Comment,
} = require("../models/setup.model");
const User = require("../models/user.model");
const UserChapterView = require("../models/userchapter.model");

exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.findAll({
      include: [
        { model: Category, as: "category" },
        {
          model: Chapter,
          as: "chapters",
          include: [{ model: ChapterImage, as: "chapterImages" }],
        },
        { model: Tag, as: "tags" },
      ],
      // order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách Stories:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const data = await Category.findAll({
      // include: [{ model: Story }],
      // order: [["name", "ASC"]],
    });

    res.json({ success: true, data: data });
  } catch (error) {
    console.error("Lỗi lấy danh sách Category:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// 🟢 Lấy danh sách Stories theo ID Category
exports.getStoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const stories = await Story.findAll({
      where: { genre_id: categoryId },
      include: [
        { model: Category, as: "category" }, // Đảm bảo "as" đúng với model setup
        {
          model: Chapter,
          as: "chapters",
          include: [{ model: ChapterImage, as: "chapterImages" }],
        },
        { model: Tag, as: "tags" }, // Đảm bảo alias đúng với setup
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error("❌ Lỗi lấy Stories theo Category:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// 🟢 Lấy danh sách Stories theo ID Tag
exports.getStoriesByTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    const stories = await Story.findAll({
      include: [
        { model: Category, as: "category" },
        {
          model: Chapter,
          as: "chapters",
          include: [{ model: ChapterImage, as: "chapterImages" }],
        },
        {
          model: Tag,
          as: "tags",
          where: { id: tagId }, // Lọc theo Tag ID
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error("❌ Lỗi lấy Stories theo Tag:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

exports.getChaptersByStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    // const userId = req.user.id;

    const story = await Story.findOne({
      where: { id: storyId },
      include: [
        { model: Category, as: "category" },
        { model: Tag, as: "tags" },
      ],
    });

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story không tồn tại!" });
    }

    const storyData = story.toJSON();

    const chapters = await Chapter.findAll({
      where: { story_id: storyId },
      attributes: ["id", "chapter_number", "title", "release_date"],
      order: [["chapter_number", "ASC"]],
    });

    const viewedChapters = await UserChapterView.findAll({
      // where: { user_id: userId },
      attributes: ["chapter_id"],
    });

    const viewedSet = new Set(viewedChapters.map((vc) => vc.chapter_id));

    const chaptersWithStatus = chapters.map((chapter) => ({
      ...chapter.toJSON(),
      is_viewed: viewedSet.has(chapter.id),
    }));

    res.json({
      success: true,
      story,
      chapters: chaptersWithStatus,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách chapters:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

exports.getChaptersByStoryDif = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findOne({
      where: { id: storyId },
      include: [
        { model: Category, as: "category" },
        { model: Tag, as: "tags" },
      ],
    });

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story không tồn tại!" });
    }

    const chapters = await Chapter.findAll({
      where: { story_id: storyId },
      attributes: ["id", "chapter_number", "title", "release_date"],
      order: [["chapter_number", "ASC"]],
    });

    res.json({
      success: true,
      story,
      chapters: chapters,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách chapters:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

exports.getChapterDetailHTML = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // 🟢 Tìm chapter theo ID
    const chapter = await Chapter.findOne({
      where: { id: chapterId },
      include: [
        {
          model: Story,
          as: "story",
          include: [
            { model: Category, as: "category" },
            { model: Tag, as: "tags" },
          ],
        },
        {
          model: ChapterImage,
          as: "chapterImages",
          order: [["order", "ASC"]], // 🟢 Sắp xếp ảnh theo thứ tự
        },
      ],
    });

    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter không tồn tại!" });
    }

    // 🟢 Render HTML
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
        <title>${chapter.story.title} - ${chapter.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 10px;
            text-align: center;
          }
          h1 {
            font-size: 20px;
            color: #222;
            margin-bottom: 10px;
          }
          p {
            font-size: 14px;
            margin: 5px 0;
          }
          .container {
            max-width: 480px;
            margin: auto;
            background: #fff;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          img {
            width: 100%;
            height: auto;
            border-radius: 5px;
            margin-bottom: 10px;
          }
          .divider {
            border-top: 2px solid #ddd;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${chapter.story.title} - ${chapter.title}</h1>
          <p><strong>Thể loại:</strong> ${chapter.story.category.name}</p>
          <p><strong>Tags:</strong> ${chapter.story.tags
            .map((tag) => tag.name)
            .join(", ")}</p>
          <p><strong>Ngày phát hành:</strong> ${chapter.release_date}</p>
          <div class="divider"></div>
    `;

    // 🟢 Thêm ảnh của chapter vào HTML
    chapter.chapterImages.forEach((img) => {
      htmlContent += `<img src="${img.image_url}" alt="Page ${img.order}">`;
    });

    htmlContent += `
        </div>
      </body>
      </html>
    `;

    return res
      .status(200)
      .json({ success: true, message: "Thành công", content: htmlContent });
  } catch (error) {
    console.error("❌ Lỗi lấy chi tiết chapter:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

exports.postCommentChapter = async (req, res) => {
  try {
    // Kiểm tra xem req.user có tồn tại không
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Missing user data" });
    }

    const { chapterId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !chapterId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu nội dung hoặc chapterId" });
    }

    // Kiểm tra chương có tồn tại không
    const chapter = await Chapter.findByPk(chapterId);
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chương không tồn tại" });
    }

    // Tạo bình luận mới
    const comment = await Comment.create({ userId, chapterId, content });

    return res.status(201).json({
      success: true,
      message: "Bình luận đã được đăng",
      comment: comment,
    });
  } catch (error) {
    console.error("Lỗi khi đăng bình luận:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

exports.getCommentChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Lấy danh sách bình luận của chương, sắp xếp theo thời gian tạo (mới nhất trước)
    const comments = await Comment.findAll({
      where: { chapterId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "UserName"], // Chỉ lấy ID & tên user
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bình luận thành công",
      comments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bình luận:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

exports.markChapterAsRead = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;

    const chapter = await Chapter.findOne({ where: { id: chapterId } });
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter không tồn tại!" });
    }

    const [record, created] = await UserChapterView.findOrCreate({
      where: { user_id: userId, chapter_id: chapterId },
      defaults: { viewed_at: new Date() },
    });

    res.json({
      success: true,
      message: created
        ? "Đã đánh dấu đã đọc"
        : "User đã đọc chapter này trước đó",
    });
  } catch (error) {
    console.error("❌ Lỗi đánh dấu đã đọc:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};
