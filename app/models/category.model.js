const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    icon_url: {
      type: DataTypes.STRING(255),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Category;
