const User = require("../model/UserModel");
const UserDetails = require("../model/userDetailsModel");
const { hashData, compareData } = require("../../utils/utils");
const jwt = require("jsonwebtoken");

const userResolvers = {
  Query: {
    getAllUsers: async () => await User.findAll(),
    getUserById: async (_, { id }) => await User.findByPk(id),
  },

  Mutation: {
    createUser: async (_, { name, email, password }) => {
      const decoded = Buffer.from(password, "base64").toString("utf8");
      const hashed = await hashData(decoded);
      return await User.create({ name, email, password: hashed });
    },

    updateUser: async (_, { id, name, password }) => {
      const updateData = {};
      if (name) updateData.name = name;
      if (password) {
        const decoded = Buffer.from(password, "base64").toString("utf8");
        updateData.password = await hashData(decoded);
      }

      await User.update(updateData, { where: { id } });
      return await User.findByPk(id);
    },

    deleteUser: async (_, { id }) => {
      await User.destroy({ where: { id } });
      return "User deleted successfully!";
    },

    loginUser: async (_, { email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("Invalid credentials");

      const decoded = Buffer.from(password, "base64").toString("utf8");
      const valid = await compareData(decoded, user.password);
      if (!valid) throw new Error("Invalid credentials");

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { token, user };
    },

    logoutUser: () => "Logout Successfully!",
  },

  User: {
    userDetails: async (parent) => {
      const details = await UserDetails.findOne({ where: { userId: parent.id } });
      return details || null;
    },
  },
};

module.exports = userResolvers;