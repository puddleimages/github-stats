// api.js
const API_BASE_URL = "https://api.github.com";

export const fetchRepos = async (username, token) => {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(`${API_BASE_URL}/users/${username}/repos?type=all&per_page=${perPage}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Authorization header with token
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching repos");
    }

    const data = await response.json();

    if (data.length === 0) break; // No more repos to fetch

    repos.push(...data); // Add fetched repos to the list
    page++; // Move to the next page
  }

  return repos;
};
export const fetchCommits = async (username, repoName, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${username}/${repoName}/commits`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 409) {
      console.warn(`Repository "${repoName}" has no commits.`);
      return [];
    }
    if (!response.ok) throw new Error(`Error fetching commits for ${repoName}`);
    return response.json();
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

export const calculateTotalChanges = async (username, repoName, commits, token) => {
  let additions = 0;
  let deletions = 0;

  for (const commit of commits) {
    const commitResponse = await fetch(
      `${API_BASE_URL}/repos/${username}/${repoName}/commits/${commit.sha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const commitData = await commitResponse.json();
    additions += commitData.stats.additions || 0;
    deletions += commitData.stats.deletions || 0;
  }

  return { additions, deletions };
};
