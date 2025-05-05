const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const UserChapterLike = sequelize.define(
  "UserChapterLike",
  {
    user_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    story_id: {
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

module.exports = UserChapterLike;
