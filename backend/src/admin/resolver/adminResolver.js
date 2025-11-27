const Admin = require("../model/AdminModel");
const { hashData, compareData } = require("../../utils/utils");
const jwt = require("jsonwebtoken");

const adminResolvers = {
  Query: {
    getAllAdmins: async () => await Admin.findAll(),
  },

  Mutation: {
    createAdmin: async (_, { name, email, password }) => {
      const decodedPassword = Buffer.from(password, "base64").toString("utf8");
      const hashedPassword = await hashData(decodedPassword);

      const admin = await Admin.create({ name, email, password: hashedPassword });
      return admin;
    },

    updateAdmin: async (_, { id, name, password }) => {
      const updateData = {};
      if (name) updateData.name = name;
      if (password) {
        const decodedPassword = Buffer.from(password, "base64").toString("utf8");
        updateData.password = await hashData(decodedPassword);
      }

      await Admin.update(updateData, { where: { id } });
      return await Admin.findByPk(id);
    },

    deleteAdmin: async (_, { id }) => {
      await Admin.destroy({ where: { id } });
      return "Admin deleted successfully!";
    },

    loginAdmin: async (_, { email, password }) => {
      const admin = await Admin.findOne({ where: { email } });
      if (!admin) throw new Error("Invalid credentials!");

      const decodedPassword = Buffer.from(password, "base64").toString("utf8");
      const valid = await compareData(decodedPassword, admin.password);
      if (!valid) throw new Error("Invalid credentials!");

      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );

      return { token, admin };
    },

    logoutAdmin: () => "Logout Successfully!",
  },
};

module.exports = adminResolvers;