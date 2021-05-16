const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) throw new Error("No creds stored or token expired");
      req.user = user;
      next();
    });
  } catch (err) {
    next(err);
  }
}

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600,
  });
}

module.exports = {
  authenticateToken,
  generateAccessToken,
};
