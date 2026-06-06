// One-time script to create the profiles table in Aiven MySQL
// Run with: npx ts-node database/migrate.ts

import mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  console.log("✅ Connected to database");

  await connection.query(sql);
  console.log("✅ Schema applied — profiles table is ready");

  await connection.end();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
