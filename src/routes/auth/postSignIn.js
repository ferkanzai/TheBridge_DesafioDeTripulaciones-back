const bcrypt = require("bcrypt");

const { generateAccessToken } = require("../../middlewares/authMiddlewares");
const { getUserByEmail } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      const error = new Error("email required");
      error.code = 400;
      throw error;
    }

    const foundUser = (await getUserByEmail(db, email)).rows;

    if (
      !foundUser.length ||
      // !foundUser2 ||
      !bcrypt.compareSync(password, foundUser[0].password)
    )
      throw new Error("Bad credentials");

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
