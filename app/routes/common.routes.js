const express = require("express");
const {
  getAllStories,
  getAllCategory,
  getStoriesByCategory,
  getStoriesByTag,
  getChapterDetailHTML,
  getChaptersByStory,
  postCommentChapter,
  getCommentChapter,
  getChaptersByStoryDif,
  markChapterAsRead,
  toggleLikeChapterUser,
  getFavoriteStories,
} = require("../controllers/common.controller");
const { middlewareAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/stories", getAllStories);
router.get("/categories", getAllCategory);
// danh sách truyện theo cate
router.get("/stories/category/:categoryId", getStoriesByCategory);
// danh sách truyện theo tag
router.get("/stories/tag/:tagId", getStoriesByTag);
// danh sách chapter theo truyện
router.get("/story/:storyId/chapters", getChaptersByStory);
router.get("/story/:storyId", getChaptersByStoryDif);
// chi tiết truyện theo chapter
router.get("/chapter/:chapterId", getChapterDetailHTML);
router.get("/stories/favorite_stories", [middlewareAuth], getFavoriteStories);
router.post("/chapter/:chapterId", [middlewareAuth], markChapterAsRead);
router.post("/toggle-favorite", [middlewareAuth], toggleLikeChapterUser);
router.post(
  "/chapter/:chapterId/comment",
  [middlewareAuth],
  postCommentChapter
);

router.get("/chapter/:chapterId/comments", [middlewareAuth], getCommentChapter);

module.exports = router;
