const express = require("express");
const {
  getAllStories,
  getAllCategory,
  getStoriesByCategory,
  getStoriesByTag,
  getChapterDetailHTML,
  getChaptersByStory,
} = require("../controllers/common.controller");

const router = express.Router();

router.get("/stories", getAllStories);
router.get("/categories", getAllCategory);
// danh sách truyện theo cate
router.get("/stories/category/:categoryId", getStoriesByCategory);
// danh sách truyện theo tag
router.get("/stories/tag/:tagId", getStoriesByTag);
// danh sách chapter theo truyện
router.get("/story/:storyId/chapters", getChaptersByStory);
// chi tiết truyện theo chapter
router.get("/chapter/:chapterId", getChapterDetailHTML);

module.exports = router;
