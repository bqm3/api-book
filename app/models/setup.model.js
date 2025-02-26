const Category = require("./category.model");
const Story = require("./story.model");
const Chapter = require("./chapter.model");
const ChapterImage = require("./chapterImage.model");
const Tag = require("./tag.model");
const StoryTag = require("./storyTag.model");

// 🔹 Quan hệ 1-N: Category -> Stories
Category.hasMany(Story, { foreignKey: "genre_id", as: "stories" });
Story.belongsTo(Category, { foreignKey: "genre_id", as: "category" });

// 🔹 Quan hệ 1-N: Story -> Chapters
Story.hasMany(Chapter, { foreignKey: "story_id", as: "chapters" });
Chapter.belongsTo(Story, { foreignKey: "story_id", as: "story" });

// 🔹 Quan hệ 1-N: Chapter -> ChapterImages
Chapter.hasMany(ChapterImage, {
  foreignKey: "chapter_id",
  as: "chapterImages",
});
ChapterImage.belongsTo(Chapter, { foreignKey: "chapter_id", as: "chapter" });

// 🔹 Quan hệ N-N: Stories <-> Tags (bảng trung gian StoryTag)
Story.belongsToMany(Tag, {
  through: StoryTag,
  foreignKey: "story_id",
  as: "tags",
});
Tag.belongsToMany(Story, {
  through: StoryTag,
  foreignKey: "tag_id",
  as: "stories",
});

module.exports = { Category, Story, Chapter, ChapterImage, Tag, StoryTag };
