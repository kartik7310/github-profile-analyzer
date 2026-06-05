import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import profileRoutes from "./routes/profile.routes";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GitHub Profile Analyzer API is running",
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/profiles", profileRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;