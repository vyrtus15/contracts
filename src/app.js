const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");

const admin = require("./routes/admin");
const jobs = require("./routes/jobs");
const contracts = require("./routes/contracts");
const balances = require("./routes/balances");

const app = express();

app.use(helmet());
app.use(bodyParser.json());

app.set("sequelize", sequelize);
app.set("models", sequelize.models);

app.use("/admin", admin);
app.use("/jobs", jobs);
app.use("/contracts", contracts);
app.use("/balances", balances);

app.use((err, req, res, next) => {
  console.error("Endpoint error:", err);
  res.status(500).send(err.message ?? "Something went wrong!");
});

module.exports = app;
