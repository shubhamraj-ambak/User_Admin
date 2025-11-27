const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/config");
const User = require("../../user/model/UserModel")

class Url extends Model {}

Url.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    originalUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    shortUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    clicks: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 0 
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdAt: { 
      type: DataTypes.DATE, 
      defaultValue: Sequelize.NOW },
    
  },
  {
    sequelize,
    modelName: "Url",
    tableName: "urls",
    timestamps: true,
  }
);

Url.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Url, { foreignKey: "userId" });

module.exports = Url;