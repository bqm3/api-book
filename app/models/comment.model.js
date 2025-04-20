const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    chapterId: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

// Khóa ngoại

module.exports = Comment;
