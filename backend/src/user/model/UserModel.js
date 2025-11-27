const { Sequelize, DataTypes, Model } =require('sequelize');
const sequelize = require("../../config/config");

class User extends Model {}

User.init(
    {
        id: { 
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: { 
            type: DataTypes.STRING,
            allowNull: false 
        },
        email: { 
            type: DataTypes.STRING,
            allowNull: false,
            unique: true 
        },
        password: { 
            type: DataTypes.STRING,
            allowNull: false 
        },
        createdAt: { 
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW
        },
        updatedAt: { 
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW
        },
    },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: true
        }
);

module.exports = User;