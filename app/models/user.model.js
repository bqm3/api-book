const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    UserName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    FullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        user.Password = await bcrypt.hash(user.Password, 10);
      },
    },
  }
);

module.exports = User;
