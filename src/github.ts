export interface GithubProfile {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
}

export interface GithubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  updated_at: string;
  topics: string[];
}

export interface ContributionDay {
  date: string;   // "YYYY-MM-DD"
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubData {
  profile: GithubProfile | null;
  repos: GithubRepo[];
  contributions: ContributionDay[];
}

const mapRepo = (r: any): GithubRepo => ({
  name: r.name,
  description: r.description || '',
  stargazers_count: r.stargazers_count,
  forks_count: r.forks_count,
  language: r.language || '',
  html_url: r.html_url,
  updated_at: r.updated_at,
  topics: r.topics || [],
});

/** Fetch ALL repos across all pages to ensure no repo is missed */
const fetchAllRepos = async (): Promise<GithubRepo[]> => {
  const allRepos: GithubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/PatilSharvil/repos?per_page=${perPage}&page=${page}&sort=created&direction=desc`
    );
    if (!res.ok) break;

    const batch: any[] = await res.json();
    if (batch.length === 0) break;

    allRepos.push(...batch.map(mapRepo));

    // If we got fewer than perPage, this is the last page
    if (batch.length < perPage) break;
    page++;
  }

  return allRepos;
};

export const getGithubData = async (): Promise<GithubData> => {
  const cacheKey = 'github-data-cache-v4';
  const cacheTimeKey = 'github-data-cache-time-v4';
  const cacheDuration = 15 * 60 * 1000; // 15 minutes cache

  try {
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cachedData && cachedTime && Date.now() - Number(cachedTime) < cacheDuration) {
      return JSON.parse(cachedData);
    }

    // Fetch Profile
    const profileRes = await fetch('https://api.github.com/users/PatilSharvil');
    let profile: GithubProfile | null = null;
    if (profileRes.ok) {
      profile = await profileRes.json();
    }

    // Fetch ALL repositories (all pages)
    const repos = await fetchAllRepos();

    // Fetch real contribution calendar from public proxy
    let contributions: ContributionDay[] = [];
    try {
      const contribRes = await fetch(
        'https://github-contributions-api.jogruber.de/v4/PatilSharvil?y=last'
      );
      if (contribRes.ok) {
        const contribJson = await contribRes.json();
        contributions = (contribJson.contributions || []).map((d: any) => ({
          date: d.date,
          count: d.count,
          level: Math.min(4, Math.max(0, d.level)) as 0 | 1 | 2 | 3 | 4,
        }));
      }
    } catch (contribErr) {
      console.warn('Could not fetch contributions:', contribErr);
    }

    const data: GithubData = { profile, repos, contributions };
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheTimeKey, String(Date.now()));
    return data;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    // Fallback to expired cache if available
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return { profile: null, repos: [], contributions: [] };
  }
};
