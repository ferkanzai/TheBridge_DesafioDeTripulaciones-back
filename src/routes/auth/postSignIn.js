const bcrypt = require("bcrypt");

const { generateAccessToken } = require("../../middlewares/authMiddlewares");
const { getUserByEmail } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("email and password required");
      error.code = 400;
      throw error;
    }

    const foundUser = (await getUserByEmail(db, email)).rows;

    if (
      !foundUser.length ||
      !bcrypt.compareSync(password, foundUser[0].password)
    ) {
      const error = new Error("Bad credentials");
      error.code = 403;
      throw error;
    }

    const payload = {
      id: foundUser[0].id,
    };

    const token = generateAccessToken(payload);

    res.status(200).json({
      data: payload,
      token: `Bearer ${token}`,
    });
  } catch (err) {
    next(err);
  }
};
