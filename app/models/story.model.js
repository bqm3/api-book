const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Story = sequelize.define(
  "Story",
  {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    genre_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    cover_image: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.ENUM("Ongoing", "Completed", "Dropped"),
      defaultValue: "Ongoing",
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Story;
