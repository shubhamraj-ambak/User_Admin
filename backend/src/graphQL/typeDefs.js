const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # Admin
  type Admin {
    id: ID!
    name: String!
    email: String!
    role: String
  }

  # User
  type User {
    id: ID!
    name: String!
    email: String!
    role: String
    userDetails: UserDetails
  }

  # UserDetails
  type UserDetails {
    id: ID!
    userId: ID!
    mobile: String
    address: String
    pan_card: String
    user: User
  }

  # PanCard
  type PanCard {
    userId: Int!
    pan_card: String
  }

  # DeleteRequest
  type DeleteRequest {
    id: ID!
    userId: ID!
    status: String!
    createdAt: String
    updatedAt: String
  }

  # URL Shortener
  type Url {
    id: ID!
    originalUrl: String
    shortCode: String
    shortUrl: String
    clicks: Int
    createdAt: String
    userId: ID
    user: User
  }

  # Auth Payload
  type AuthPayload {
    token: String
    user: User
    admin: Admin
  }

  # Queries
  type Query {
    getAllUsers: [User]
    getUserById(id: ID!): User
    getAllDetails: [UserDetails]
    getDetailById(id: ID!): UserDetails
    getPanCard(id: Int!): PanCard
    getAllAdmins: [Admin]
    getAllDeleteRequests: [DeleteRequest]
    getAllUrls: [Url]
    getUrlByShortCode(shortCode: String!): Url
  }

  # Mutations
  type Mutation {
    createUser(name: String!, email: String!, password: String!): User
    updateUser(id: ID!, name: String, password: String): User
    deleteUser(id: ID!): String
    loginUser(email: String!, password: String!): AuthPayload
    logoutUser: String

    createAdmin(name: String!, email: String!, password: String!): Admin
    updateAdmin(id: ID!, name: String, password: String): Admin
    deleteAdmin(id: ID!): String
    loginAdmin(email: String!, password: String!): AuthPayload
    logoutAdmin: String

    createUserDetail(
      userId: ID!
      mobile: String!
      address: String!
      pan_card: String!
    ): UserDetails

    updateUserDetail(
      userId: ID!
      mobile: String
      address: String
      pan_card: String
    ): UserDetails

    deleteUserDetail(userId: ID!): String

    createDeleteRequest(userId: ID!): DeleteRequest
    approveDeleteRequest(id: ID!): DeleteRequest
    rejectDeleteRequest(id: ID!): DeleteRequest

    createUrl(originalUrl: String!, userId: Int): Url
  }
`;

module.exports = typeDefs;