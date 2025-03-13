module.exports = {
  mongoUri: "mongodb://localhost:27017",
  dbName: "freelancePlartform",
  emailCredentials: {
    user: "",
    pass: "",
  },
  jwtConfig: {
    secret: process.env.JWT_SECRET || "default_secret_key",
    expiresIn: "15m",
  },
};
