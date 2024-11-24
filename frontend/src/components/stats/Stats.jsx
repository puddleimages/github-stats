import { useState } from "react";
import { useQuery } from "react-query";
import RepoStatsTable from "./RepoStatsTable";
import DateRangeInputs from "./DateRangeInputs";
import TotalStats from "./TotalStats";
import FetchButton from "./FetchButton";
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
  const [totalCommits, setTotalCommits] = useState(0);
  const [totalRepos, setTotalRepos] = useState(0);
  const [fetchEnabled, setFetchEnabled] = useState(false); // State to control fetch behavior

  const { data: repos, isLoading: reposLoading, error: reposError } = useQuery(
    ["repos", username],
    () => fetchRepos(username, token)
  );

  const allRepos = repos ? [...repos, ...privateRepos.map((repoName) => ({ name: repoName }))] : [];

  const repoStatsQuery = useQuery(
    ["repoStats", username, startDate, endDate],
    async () => {
      if (!allRepos.length) return [];

      let additionsSum = 0;
      let deletionsSum = 0;
      let commitsCount = 0;

      const repoStatsPromises = allRepos.map(async (repo) => {
        if (repo.size === 0) {
          console.warn(`Skipping empty repository: "${repo.name}"`);
          return { repoName: repo.name, totalChanges: { additions: 0, deletions: 0 }, commits: 0 };
        }

        const commits = await fetchCommits(username, repo.name, token);
        const filteredCommits = commits.filter((commit) => {
          const commitDate = new Date(commit.commit.author.date);
          return (
            (!startDate || commitDate >= new Date(startDate)) &&
            (!endDate || commitDate <= new Date(endDate))
          );
        });

        commitsCount += filteredCommits.length;

        const totalChanges = await calculateTotalChanges(username, repo.name, filteredCommits, token);
        additionsSum += totalChanges.additions;
        deletionsSum += totalChanges.deletions;

        return { repoName: repo.name, totalChanges, commits: filteredCommits.length };
      });

      const repoStats = await Promise.all(repoStatsPromises);

      const filteredRepoStats = repoStats.filter(
        (repo) => repo.totalChanges.additions > 0 || repo.totalChanges.deletions > 0
      );

      setTotalRepos(filteredRepoStats.length);

      setTotalAdditions(additionsSum);
      setTotalDeletions(deletionsSum);
      setTotalCommits(commitsCount);

      return filteredRepoStats;
    },
    {
      enabled: fetchEnabled && !!startDate && !!endDate && !!repos, // Only enable the query after the button is clicked
    }
  );

  const handleFetchButtonClick = () => {
    setTotalAdditions(0);
    setTotalDeletions(0);
    setTotalCommits(0);
    setTotalRepos(0);

    setFetchEnabled(true); // Enable fetching after button click
  };

  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);

    // Reset stats when date changes
    setTotalAdditions(0);
    setTotalDeletions(0);
    setTotalCommits(0);
    setTotalRepos(0);

    // Disable fetching until button is clicked again
    setFetchEnabled(false);
  };

  if (reposLoading) return <div>Loading repositories...</div>;
  if (reposError) return <div>Error loading repositories: {reposError.message}</div>;

  if (repoStatsQuery.isLoading) return <div>Loading commit stats...</div>;
  if (repoStatsQuery.error) return <div>Error fetching commit stats: {repoStatsQuery.error.message}</div>;

  return (
    <div>
      <h1>GitHub Stats</h1>
      <DateRangeInputs
        startDate={startDate}
        endDate={endDate}
        setStartDate={(newStartDate) => handleDateChange(newStartDate, endDate)}
        setEndDate={(newEndDate) => handleDateChange(startDate, newEndDate)}
      />
      <FetchButton onClick={handleFetchButtonClick} />

      <TotalStats
        totalAdditions={totalAdditions}
        totalDeletions={totalDeletions}
        totalCommits={totalCommits}
        totalRepos={totalRepos}
      />

      <RepoStatsTable repoStats={repoStatsQuery.data || []} />
    </div>
  );
};

export default Stats;
