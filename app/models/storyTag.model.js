const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const StoryTag = sequelize.define(
  "StoryTag",
  {
    story_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    tag_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    primaryKey: ["story_id", "tag_id"], // Composite Key
  }
);

module.exports = StoryTag;
