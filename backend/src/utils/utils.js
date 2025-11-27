const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY);
const IV = Buffer.from(process.env.IV);
const ALGORITHM = "aes-256-cbc";

function encryptData(data) {
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

function decryptData(encrypted) {
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const hashData = async (data) => {
  const saltRounds = 10;
  const hashedData = await bcrypt.hash(data, saltRounds);
  return hashedData;
};

const compareData = async (data, hashedData) => {
  const comparedData = await bcrypt.compare(data, hashedData);
  return comparedData;
};

module.exports = { hashData, compareData, encryptData, decryptData };