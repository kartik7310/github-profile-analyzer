import express, { type Application, type Request, type Response } from "express";
import cors from "cors";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "GitHub Profile Analyzer API is running",
    });
});



export default app;