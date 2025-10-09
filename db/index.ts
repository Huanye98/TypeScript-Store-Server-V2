import { Client } from "pg";
require("dotenv").config();

const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl:{
    rejectUnauthorized: false
  },
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT? parseInt(process.env.PGPORT) : undefined,
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err:unknown) => console.log("Failed to connect to PostgreSQL"));

module.exports = db;
