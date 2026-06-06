import dotenv from "dotenv";

dotenv.config();

// ─── App ──────────────────────────────────────────────────────────────────────
export const PORT = process.env.PORT || 5000;

// ─── Database ─────────────────────────────────────────────────────────────────
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "github_analyzer";

// ─── GitHub API ───────────────────────────────────────────────────────────────
export const GITHUB_API = process.env.GITHUB_API || "https://api.github.com/users";
