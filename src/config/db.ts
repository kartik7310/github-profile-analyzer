import mysql from "mysql2/promise";
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from "./env";

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: { rejectUnauthorized: false }, // required for Aiven cloud MySQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
