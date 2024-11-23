import { useState } from "react";
import { useQuery } from "react-query";
import RepoStatsTable from "./RepoStatsTable";
import { fetchRepos, fetchCommits, calculateTotalChanges } from "./api";

const Stats = ({ username, token, privateRepos }) => {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const defaultStartDate = oneYearAgo.toISOString().split("T")[0];
  const defaultEndDate = today.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [totalAdditions, setTotalAdditions] = useState(0);
  const [totalDeletions, setTotalDeletions] = useState(0);
  const [totalCommits, setTotalCommits] = useState(0); // New state for total commits
  const [isButtonClicked, setIsButtonClicked] = useState(false); // State to track button click

  // Fetch repositories (public repos from the API)
  const { data: repos, isLoading: reposLoading, error: reposError } = useQuery(
    ["repos", username],
    () => fetchRepos(username, token)
  );

  // Only combine public repos with private repos once public repos are loaded
  const allRepos = repos ? [...repos, ...privateRepos.map((repoName) => ({ name: repoName }))] : [];

  // Fetch stats for each repository only once public repos are fetched and button is clicked
  const repoStatsQuery = useQuery(
    ["repoStats", username, startDate, endDate],
    async () => {
      if (!allRepos.length) return []; // Only proceed if repos are loaded

      let additionsSum = 0;
      let deletionsSum = 0;
      let commitsCount = 0; // Counter for total commits

      const repoStatsPromises = allRepos.map(async (repo) => {
        if (repo.size === 0) {
          console.warn(`Skipping empty repository: "${repo.name}"`);
          return { repoName: repo.name, totalChanges: { additions: 0, deletions: 0 }, commits: 0 };
        }

        // Fetch and filter commits by date range
        const commits = await fetchCommits(username, repo.name, token);
        const filteredCommits = commits.filter((commit) => {
          const commitDate = new Date(commit.commit.author.date);
          return (
            (!startDate || commitDate >= new Date(startDate)) &&
            (!endDate || commitDate <= new Date(endDate))
          );
        });

        // Count the commits for this repo in the date range
        commitsCount += filteredCommits.length;

        // Calculate total changes for filtered commits
        const totalChanges = await calculateTotalChanges(username, repo.name, filteredCommits, token);
        additionsSum += totalChanges.additions;
        deletionsSum += totalChanges.deletions;

        return { repoName: repo.name, totalChanges, commits: filteredCommits.length };
      });

      const repoStats = await Promise.all(repoStatsPromises);

      // Filter out repositories with no additions or deletions
      const filteredRepoStats = repoStats.filter(
        (repo) => repo.totalChanges.additions > 0 || repo.totalChanges.deletions > 0
      );

      setTotalAdditions(additionsSum);
      setTotalDeletions(deletionsSum);
      setTotalCommits(commitsCount); // Update total commits

      return filteredRepoStats; // Return the filtered repo stats
    },
    {
      enabled: isButtonClicked && !!startDate && !!endDate && !!repos, // Enable only if button clicked and dates set
    }
  );

  const handleFetchButtonClick = () => {
    setIsButtonClicked(true); // Set button click state to true
  };

  if (reposLoading) return <div>Loading repositories...</div>;
  if (reposError) return <div>Error loading repositories: {reposError.message}</div>;

  if (repoStatsQuery.isLoading) return <div>Loading commit stats...</div>;
  if (repoStatsQuery.error) return <div>Error fetching commit stats: {repoStatsQuery.error.message}</div>;

  return (
    <div>
      <h1>Repository Commit Stats</h1>
      {/* Date Range Inputs */}
      <div>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>
      {/* Fetch Button */}
      <button onClick={handleFetchButtonClick}>Fetch Stats</button>

      {/* Total Metrics */}
      <div>
        <h3>Total Modifications: {totalAdditions + totalDeletions}</h3>
        <h3>Total Additions: {totalAdditions}</h3>
        <h3>Total Deletions: {totalDeletions}</h3>
        <h3>Total Commits: {totalCommits}</h3> {/* Display total commits */}
      </div>
      <RepoStatsTable repoStats={repoStatsQuery.data || []} />
    </div>
  );
};

export default Stats;
