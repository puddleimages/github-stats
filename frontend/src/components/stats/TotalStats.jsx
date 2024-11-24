const TotalStats = ({ totalAdditions, totalDeletions, totalCommits, totalRepos }) => (
  <div>
    <h3>Total Modifications: {totalAdditions + totalDeletions}</h3>
    <h3>Total Additions: {totalAdditions}</h3>
    <h3>Total Deletions: {totalDeletions}</h3>
    <h3>Total Commits: {totalCommits}</h3> {/* Display total commits */}
    <h3>Total Repos: {totalRepos}</h3> {/* Display total repos */}
  </div>
);

export default TotalStats;
