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
      try {
        if (err) {
          const error = new Error("No creds stored or token expired");
          error.code = 401;
          throw error;
        }

        const userFromDb = await getUserById(db, user.id);

        if (!userFromDb.rowCount) {
          const error = new Error("Not user");
          error.code = 401;
          throw error;
        }

        req.user = {
          id: userFromDb.rows[0].id,
        };
      } catch (error) {
        next(error);
      }

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
