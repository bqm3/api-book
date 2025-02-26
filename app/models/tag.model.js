const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Tag = sequelize.define(
  "Tag",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Tag;
