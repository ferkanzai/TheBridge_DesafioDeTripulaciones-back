const { generateAccessToken } = require("../../middlewares/authMiddlewares");
const { getUserByUsername, getUserByEmail } = require("../../queries/users");

module.exports = (db) => async (req, res, _) => {
  try {
    res.status(200).json({ data: true });
  } catch (err) {
    res.status(401).send(err.message);
  }
};
