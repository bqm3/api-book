const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Chapter = sequelize.define(
  "Chapter",
  {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
    },
    story_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    chapter_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    release_date: {
      type: DataTypes.DATE,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Chapter;
