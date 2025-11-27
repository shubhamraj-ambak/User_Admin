const UserDetails = require("../model/userDetailsModel");
const User = require("../model/UserModel");
const { encryptData, decryptData } = require("../../utils/utils");

const detailResolvers = {
  Query: {
    getAllDetails: async () => await UserDetails.findAll(),

    getDetailById: async (_, { id }) => {
      const detail = await UserDetails.findOne({ where: { userId: id } });
      return detail || null;
    },

    getPanCard: async (_, { id }) => {
      const pan = await UserDetails.findOne({ where: { userId: id } });
      if (!pan) throw new Error("PAN not found");
      const decrypted = await decryptData(pan.pan_card);
      return { userId: pan.userId, pan_card: decrypted };
    },
  },

  Mutation: {
    createUserDetail: async (_, { userId, mobile, address, pan_card }) => {
      const encryptedPan = await encryptData(pan_card);
      return await UserDetails.create({
        userId,
        mobile,
        address,
        pan_card: encryptedPan,
      });
    },

    updateUserDetail: async (_, { userId, mobile, address, pan_card }) => {
      try {
        if (!userId) throw new Error("User ID is required");

        const updateData = {};
        if (mobile) updateData.mobile = mobile;
        if (address) updateData.address = address;
        if (pan_card) updateData.pan_card = await encryptData(pan_card);

        const updatedUserDetail = await UserDetails.updateDetail(userId, updateData);
        if (!updatedUserDetail) throw new Error("Update failed");

        return updatedUserDetail;
      } catch (error) {
        console.error("Error in updateUserDetail:", error);
        throw new Error(error.message || "Failed to update user details");
      }
    },
  },

  UserDetails: {
    user: async (parent) => await User.findByPk(parent.userId),
  },
};

module.exports = detailResolvers;