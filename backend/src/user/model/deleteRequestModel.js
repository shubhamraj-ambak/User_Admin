const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/config");

class DeleteRequest extends Model {}

DeleteRequest.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "DeleteRequest",
    tableName: "deleteRequests",
    timestamps: true,
  }
);

module.exports = DeleteRequest;