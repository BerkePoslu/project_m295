const express = require("express");
const session = require("express-session");
const swaggerUi = require("swagger-ui-express");

const tasks = require("./routes/tasks.js");
const auth = require("./routes/auth.js");

const swaggerDocument = require("./swagger.json");

const app = express();
const port = 3000;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);

app.use(express.json());

app.use("/", tasks);
app.use("/", auth);

app.use("/", (req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`Tasks app listening on port ${port}`);
});
