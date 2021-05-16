const bcrypt = require("bcrypt");

const { generateAccessToken } = require("../../middlewares/authMiddlewares");
const { getUserByEmail, postInsertUser } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username) {
      const error = new Error("email and username required");
      error.code = 400;
      throw error;
    }

    const userExists = (await getUserByEmail(db, email)).rowCount;

    if (userExists !== 0) {
      const error = new Error("Email already in use");
      error.code = 403;
      throw error;
    }

    const newUser = {
      email,
      password: bcrypt.hashSync(password, 12),
      username: username,
      hasCar: false,
    };

    const userFromDb = await postInsertUser(db, newUser);

    const token = generateAccessToken(userFromDb.rows[0]);

    res.status(201).json({
      data: userFromDb.rows,
      token: `Bearer ${token}`,
    });
  } catch (err) {
    // console.error(err);
    next(err);
  }
};
