const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/config");

class UserDetails extends Model {}

UserDetails.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    mobile: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pan_card: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    modelName: "UserDetails",
    tableName: "userDetails",
    timestamps: true,
  }
);

UserDetails.createDetail = async function (data) {
  try {
    const createdAt = new Date();
    const updatedAt = new Date();
    const sql = `
      INSERT INTO userDetails (userId, mobile, address, pan_card, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await sequelize.query(sql, {
      replacements: [data.userId, data.mobile, data.address, data.pan_card, createdAt, updatedAt],
    });
    return result;
  } catch (err) {
    throw err;
  }
};

UserDetails.getDetailById = async function (id) {
  try {
    const sql = `
      SELECT d.userId, d.mobile, d.address, d.pan_card, u.name, u.email
      FROM userDetails d
      JOIN users u ON d.userId = u.id
      WHERE d.userId = ?
    `;
    const [rows] = await sequelize.query(sql, { replacements: [id] });
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};

UserDetails.updateDetail = async function (userId, data) {
  try {
    const checkUser = await this.getDetailById(userId);
    if (!checkUser) {
      return await this.createDetail({ userId, ...data });
    }

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return checkUser;

    const sql = `UPDATE userDetails SET ${fields.join(", ")}, updatedAt = NOW() WHERE userId = ?`;
    values.push(userId);

    await sequelize.query(sql, { replacements: values });
    return await this.getDetailById(userId);
  } catch (err) {
    throw err;
  }
};

module.exports = UserDetails;