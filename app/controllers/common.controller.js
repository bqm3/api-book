const {
  Category,
  Story,
  Chapter,
  ChapterImage,
  Tag,
  StoryTag,
} = require("../models/setup.model");

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

    // 🟢 Tìm story theo ID
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

    // 🟢 Chuyển `story` thành JSON thuần
    const storyData = story.toJSON();

    // 🟢 Lấy danh sách chapters của story
    const chapters = await Chapter.findAll({
      where: { story_id: storyId },
      attributes: ["id", "chapter_number", "title", "release_date"], // 🟢 Chỉ lấy các trường cần thiết
      order: [["chapter_number", "ASC"]], // 🟢 Sắp xếp theo thứ tự chapter
    });

    res.json({
      success: true,
      // story: {
      //   ...storyData, // 🟢 Trả về toàn bộ thông tin story
      //   tags: storyData.tags.map((tag) => tag.name), // 🟢 Chỉ lấy tên tags
      // },
      story,
      chapters,
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
