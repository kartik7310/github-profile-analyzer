import { type Request, type Response, type NextFunction } from "express";
import { type RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import pool from "../config/db";
import { fetchGitHubProfile } from "../services/github.service";
import { calculateInsights } from "../utils/calculateInsights";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const analyzeSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(1, "Username cannot be empty")
    .max(39, "Username too long")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "Invalid GitHub username"
    ),
});

// ─── DB Row Type ──────────────────────────────────────────────────────────────

interface ProfileRow extends RowDataPacket {
  id: number;
  username: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  avatar_url: string;
  profile_url: string;
  account_created_at: string;
  account_age_days: number;
  followers_following_ratio: number;
  popularity_score: number;
  analyzed_at: string;
}

// ─── POST /api/profiles/analyze ───────────────────────────────────────────────

export async function analyzeProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0].message,
      });
      return;
    }

    const { username } = parsed.data;

    // Fetch from GitHub
    const githubData = await fetchGitHubProfile(username);

    // Calculate insights
    const insights = calculateInsights(
      githubData.created_at,
      githubData.followers,
      githubData.following,
      githubData.public_repos
    );

    const analyzed_at = new Date();

    // Upsert — insert or update if username already exists (UNIQUE constraint)
    const upsertSql = `
      INSERT INTO profiles (
        username, name, bio, location, company,
        followers, following, public_repos, public_gists,
        avatar_url, profile_url, account_created_at,
        account_age_days, followers_following_ratio, popularity_score,
        analyzed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name                      = VALUES(name),
        bio                       = VALUES(bio),
        location                  = VALUES(location),
        company                   = VALUES(company),
        followers                 = VALUES(followers),
        following                 = VALUES(following),
        public_repos              = VALUES(public_repos),
        public_gists              = VALUES(public_gists),
        avatar_url                = VALUES(avatar_url),
        profile_url               = VALUES(profile_url),
        account_created_at        = VALUES(account_created_at),
        account_age_days          = VALUES(account_age_days),
        followers_following_ratio = VALUES(followers_following_ratio),
        popularity_score          = VALUES(popularity_score),
        analyzed_at               = VALUES(analyzed_at)
    `;

    await pool.execute(upsertSql, [
      githubData.login,
      githubData.name,
      githubData.bio,
      githubData.location,
      githubData.company,
      githubData.followers,
      githubData.following,
      githubData.public_repos,
      githubData.public_gists,
      githubData.avatar_url,
      githubData.html_url,
      githubData.created_at,
      insights.account_age_days,
      insights.followers_following_ratio,
      insights.popularity_score,
      analyzed_at,
    ]);

    // Fetch the saved record to return it
    const [rows] = await pool.execute<ProfileRow[]>(
      "SELECT * FROM profiles WHERE username = ?",
      [githubData.login]
    );

    res.status(200).json({
      success: true,
      message: "Profile analyzed successfully",
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/profiles ────────────────────────────────────────────────────────

export async function getAllProfiles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit ?? "10"), 10))
    );
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      "SELECT * FROM profiles ORDER BY analyzed_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    const [[countRow]] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM profiles"
    );

    const total = (countRow as { total: number }).total;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Profiles fetched successfully",
      data: rows,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/profiles/top ────────────────────────────────────────────────────

export async function getTopProfiles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit ?? "10"), 10))
    );

    const [rows] = await pool.execute(
      "SELECT * FROM profiles ORDER BY popularity_score DESC LIMIT ?",
      [limit]
    );

    res.status(200).json({
      success: true,
      message: "Top profiles fetched successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/profiles/:id ────────────────────────────────────────────────────

export async function getProfileById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid profile ID",
      });
      return;
    }

    const [rows] = await pool.execute<ProfileRow[]>(
      "SELECT * FROM profiles WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Profile not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
}
