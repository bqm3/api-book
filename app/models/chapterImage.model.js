const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const ChapterImage = sequelize.define(
  "ChapterImage",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    chapter_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = ChapterImage;
