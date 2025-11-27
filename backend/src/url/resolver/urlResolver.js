const Url = require("../model/urlModel");
const User = require("../../user/model/UserModel");
const crypto = require("crypto");

const generateShortCode = (length = 7) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};

const urlResolvers = {
  Query: {
    getAllUrls: async () => {
      return await Url.findAll({ include: { model: User, as: "user" } });
    },
    getUrlByShortCode: async (_, { shortCode }) => {
      return await Url.findOne({
        where: { shortCode },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      });
    },
  },

  Mutation: {
    createUrl: async (_, { originalUrl, userId }) => {
      try {
        const whereClause = userId ? { originalUrl, userId } : { originalUrl };

        const existingUrl = await Url.findOne({
          where: whereClause,
          include: [{ model: User, attributes: ["name", "email"] }],
        });

        if (existingUrl) {
          return existingUrl;
        }

        const shortCode = generateShortCode(6);
        const shortUrl = `http://localhost:7000/u/${shortCode}`;
        const createdAt = Date.now();

        const newUrl = await Url.create({
          originalUrl,
          shortCode,
          shortUrl,
          userId: userId || null,
          createdAt,
          clicks: 0,
        });

        const savedUrl = await Url.findByPk(newUrl.id, {
          include: [{ model: User, attributes: ["name", "email"] }],
        });

        return savedUrl;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};

module.exports = urlResolvers;