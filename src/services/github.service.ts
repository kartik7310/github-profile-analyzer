import axios from "axios";
import { GITHUB_API } from "../config/env";

export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  avatar_url: string;
  html_url: string;
  created_at: string;
}

export async function fetchGitHubProfile(username: string): Promise<GitHubUser> {
  try {
    const response = await axios.get<GitHubUser>(
      `${GITHUB_API}/${username}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "github-profile-analyzer",
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        const notFound = new Error("GitHub user not found") as Error & { statusCode: number };
        notFound.statusCode = 404;
        throw notFound;
      }
      const apiError = new Error("GitHub API error") as Error & { statusCode: number };
      apiError.statusCode = 502;
      throw apiError;
    }
    throw new Error("Unexpected error while fetching GitHub profile");
  }
}
