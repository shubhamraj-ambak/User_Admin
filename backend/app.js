require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { merge } = require("lodash");
const Url = require("./src/url/model/urlModel")

const sequelize = require("./src/config/config");

const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./src/graphQL/typeDefs");
const detailResolvers = require("./src/user/resolver/detailResolver");
const adminResolvers = require("./src/admin/resolver/adminResolver");
const userResolvers = require("./src/user/resolver/userResolver");
const urlResolvers = require("./src/url/resolver/urlResolver");
const deleteRequestResolvers = require("./src/user/resolver/deleteReqResolver");


const app = express();
const PORT = process.env.PORT || 5077;

app.use(cors());
app.use(express.json());

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers: merge(
      {},
      userResolvers,
      adminResolvers,
      detailResolvers,
      urlResolvers,
      deleteRequestResolvers
    ),

    context: ({ req }) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace("Bearer ", "");

      let user = null;
      if (token) {
        try {
          user = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
        } catch (err) {
          console.log("Invalid token");
        }
      }
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  sequelize
    .authenticate()
    .then(() => console.log("MySQL Connected with Sequelize..."))
    .catch((err) => console.error("DB Connection error:", err));

  sequelize
    .sync()
    .then(() => console.log("Models synchronized"))
    .catch((err) => console.error("Sync error:", err));

  app.listen(PORT, () => {
    console.log(
      `Server running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });

  app.get("/u/:shortCode", async (req, res) => {
    try {
      const { shortCode } = req.params;
      const url = await Url.findOne({ where: { shortCode } });
  
      if (url) {
        url.clicks += 1;
        await url.save();
        return res.redirect(url.originalUrl);
      } else {
        return res.status(404).send("Short URL not found");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
}

startApolloServer();