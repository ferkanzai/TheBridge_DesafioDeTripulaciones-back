const jwt = require("jsonwebtoken");

const db = require("../../config/db");
const { getUserById } = require("../queries/users");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        const error = new Error("No creds stored or token expired");
        error.code = 401;
        throw error;
      }

      const userFromDb = (await getUserById(db, user.id)).rows[0].id;

      req.user = {
        id: userFromDb,
      };

      console.log(req.user);

      next();
    });
  } catch (err) {
    next(err);
  }
}

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600 * 24,
  });
}

module.exports = {
  authenticateToken,
  generateAccessToken,
};
