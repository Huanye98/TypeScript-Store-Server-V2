require("dotenv").config();
require("./db");

import express from "express";
const app = express();

require("./config")(app);

const indexRoutes = require("./API/routes/index.routes").default;
app.use("/api", indexRoutes);

const webhooks = require("./API/Webhooks/index").default;
app.use("/webhooks", webhooks);

require("./error-handling").default(app);


module.exports = app;
