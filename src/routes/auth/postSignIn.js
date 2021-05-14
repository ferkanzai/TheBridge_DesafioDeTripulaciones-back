const bcrypt = require("bcrypt");

const { generateAccessToken } = require("../../middlewares/authMiddlewares");
const { getUserByUsername, getUserByEmail } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email && !username) {
      const error = new Error("email or username required");
      error.code = 400;
      throw error;
    }

    const foundUser = !!email
      ? (await getUserByEmail(db, email)).rows
      : (await getUserByUsername(db, username)).rows;

    if (
      !foundUser.length ||
      // !foundUser2 ||
      !bcrypt.compareSync(password, foundUser[0].password)
    )
      throw new Error("Bad credentials");

    const payload = {
      id: foundUser[0].id,
      email: foundUser[0].email,
      username: foundUser[0].username,
      hasCar: foundUser[0].has_car,
      isActive: foundUser[0].is_active,
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
