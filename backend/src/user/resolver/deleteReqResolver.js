const User = require("../model/UserModel");
const DeleteRequest = require("../model/deleteRequestModel");

const deleteRequestResolvers = {
  Query: {
  getAllDeleteRequests: async () => {
    const requests = await DeleteRequest.findAll({
      order: [["createdAt", "DESC"]],
    });
    return requests;
  },
},

  Mutation: {
    createDeleteRequest: async (_, { userId }) => {
      const existing = await DeleteRequest.findOne({
        where: { userId, status: "pending" },
      });
      if (existing) throw new Error("Delete request already pending");
      const request = await DeleteRequest.create({ userId });
      return request;
    },

    approveDeleteRequest: async (_, { id }) => {
      const request = await DeleteRequest.findByPk(id);
      if (!request) throw new Error("Request not found");
      request.status = "approved";
      await request.save();
      await User.destroy({ where: { id: request.userId } });
      return request;
    },

    rejectDeleteRequest: async (_, { id }) => {
      const request = await DeleteRequest.findByPk(id);
      if (!request) throw new Error("Request not found");
      request.status = "rejected";
      await request.save();
      return request;
    },
  },
};

module.exports = deleteRequestResolvers;