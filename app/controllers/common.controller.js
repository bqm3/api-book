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

    // 🟢 Lấy danh sách chapters của story
    const chapters = await Chapter.findAll({
      where: { story_id: storyId },
      attributes: ["id", "chapter_number", "title", "release_date"], // 🟢 Chỉ lấy các trường cần thiết
      order: [["chapter_number", "ASC"]], // 🟢 Sắp xếp theo thứ tự chapter
    });

    res.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        author: story.author,
        category: story.category.name,
        tags: story.tags.map((tag) => tag.name),
      },
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
      <html>
      <head>
        <title>${chapter.story.title} - ${chapter.title}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; }
          h1 { color: #333; }
          img { width: 80%; max-width: 800px; }
        </style>
      </head>
      <body>
        <h1>${chapter.story.title} - ${chapter.title}</h1>
        <p><strong>Thể loại:</strong> ${chapter.story.category.name}</p>
        <p><strong>Tags:</strong> ${chapter.story.tags
          .map((tag) => tag.name)
          .join(", ")}</p>
        <p><strong>Ngày phát hành:</strong> ${chapter.release_date}</p>
        <hr>
    `;

    // 🟢 Thêm ảnh của chapter vào HTML
    chapter.chapterImages.forEach((img) => {
      htmlContent += `<img src="${img.image_url}" alt="Page ${img.order}"><br>`;
    });

    // 🟢 Trả về HTML
    res.send(htmlContent);
  } catch (error) {
    console.error("❌ Lỗi lấy chi tiết chapter:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};
