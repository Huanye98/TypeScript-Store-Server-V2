"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
require("./db");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
require("./config")(app);
const indexRoutes = require("./API/routes/index.routes").default;
app.use("/api", indexRoutes);
const webhooks = require("./API/Webhooks/index").default;
app.use("/webhooks", webhooks);
require("./error-handling").default(app);
module.exports = app;
