const app = require("./app");

const { PORT = 4000 } = process.env;

app.listen(PORT, () => {
  console.info(`> listening at http://localhost:${PORT}`);
});
