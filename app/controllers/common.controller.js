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
const UserChapterLike = require("../models/userchapterlike.model");

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
    // const userId = req.user.id; // Mở nếu dùng user cụ thể

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

    // Lấy tất cả lượt xem (nếu cần user cụ thể thì thêm where: { user_id: userId })
    const viewedChapters = await UserChapterView.findAll({
      // where: { user_id: userId },
      attributes: ["chapter_id", "user_id", "viewed_at"],
    });

    // Dùng Map để lấy cả viewed_at
    const viewedMap = new Map();
    viewedChapters.forEach((vc) => {
      viewedMap.set(vc.chapter_id, vc.viewed_at);
    });

    // Lấy tất cả các chương đã được yêu thích
    const likedStory = await UserChapterLike.findOne({
      where: { story_id: storyId },
      // where: { user_id: userId }, // Mở nếu muốn lấy dữ liệu của user cụ thể
      attributes: ["story_id", "user_id", "viewed_at"],
    });

    // Gộp thông tin vào danh sách chapter
    const chaptersWithStatus = chapters.map((chapter) => {
      const chapterJson = chapter.toJSON();
      return {
        ...chapterJson,
        is_viewed: viewedMap.has(chapter.id),
        viewed_at: viewedMap.get(chapter.id) || null,
      };
    });

    res.json({
      success: true,
      story: {
        ...storyData,
        isLiked: likedStory ? true : false, // Thêm thông tin "is_liked"
        liked_at: likedStory ? likedStory.view_at : null, // Thêm thời gian yêu thích
      },
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

exports.toggleLikeChapterUser = async (req, res) => {
  try {
    const user_id = req.user.id; // Lấy từ middleware sau khi verify token
    const { story_id } = req.body;

    const existingLike = await UserChapterLike.findOne({
      where: { user_id, story_id },
    });

    if (existingLike) {
      await existingLike.destroy();
      return res.status(200).json({
        message: "Chapter unfavorited successfully",
        favorited: false,
      });
    }

    const newLike = await UserChapterLike.create({
      user_id,
      story_id,
    });

    res.status(201).json({
      message: "Chapter favorited successfully",
      data: newLike,
      favorited: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error toggling favorite",
      error: error.message,
    });
  }
};

exports.getFavoriteStories = async (req, res) => {
  try {
    const userId = req.user.id; // Giả sử thông tin người dùng được xác thực qua middleware

    // Lấy các truyện yêu thích của người dùng, thực hiện JOIN với các bảng khác
    const favoriteStories = await UserChapterLike.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Story,
          as: "story", // Tên alias của bảng Story trong model UserChapterLike
          include: [
            { model: Category, as: "category" },
            {
              model: Chapter,
              as: "chapters",
              include: [{ model: ChapterImage, as: "chapterImages" }],
            },
            { model: Tag, as: "tags" },
          ],
        },
      ],
    });

    // Nếu không có truyện yêu thích, trả về thông báo lỗi
    if (favoriteStories.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không có truyện yêu thích" });
    }

    // Trả về kết quả truyện yêu thích đã được join các bảng
    const stories = favoriteStories.map((fav) => fav.story); // Chỉ lấy thông tin truyện từ kết quả JOIN

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error("❌ Lỗi lấy truyện yêu thích:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};
