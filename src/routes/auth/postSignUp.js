const bcrypt = require("bcrypt");

const { generateAccessToken } = require("../../middlewares/authMiddlewares");
const { getUserByEmail, insertUser } = require("../../queries/users");

module.exports = (db) => async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const userExists = (await getUserByEmail(db, email)).rowCount;

    if (userExists !== 0) {
      const error = new Error("Email already in use");
      error.code = 403;
      throw error;
    }

    const newUser = {
      email,
      password: bcrypt.hashSync(password, 12),
      username: username || `${email.split("@")[0]} user`,
      hasCar: false,
    };

    const userFromDb = await insertUser(db, newUser);

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
