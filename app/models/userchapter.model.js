const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const UserChapterView = sequelize.define(
  "UserChapterView",
  {
    user_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    chapter_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    viewed_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = UserChapterView;
