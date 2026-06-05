export interface Insights {
  account_age_days: number;
  followers_following_ratio: number;
  popularity_score: number;
}

export function calculateInsights(
  created_at: string,
  followers: number,
  following: number,
  public_repos: number
): Insights {
  // Account age in days
  const createdDate = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const account_age_days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Followers/Following ratio
  // If following = 0, ratio = followers
  const followers_following_ratio =
    following === 0 ? followers : parseFloat((followers / following).toFixed(2));

  // Popularity score
  const popularity_score = followers * 2 + public_repos * 5;

  return {
    account_age_days,
    followers_following_ratio,
    popularity_score,
  };
}
