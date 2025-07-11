"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
require("dotenv").config();
const db = new pg_1.Client({
    //   connectionString: process.env.DATABASE_URL,
    //   ssl:{
    //   rejectUnauthorized: false
    // },
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : undefined,
});
db.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => console.log("Failed to connect to PostgreSQL"));
module.exports = db;
