const RepoStatsTable = ({ repoStats = [] }) => {
  if (!repoStats.length) {
    return <p>No repository stats to display.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Repo Name</th>
          <th>Total Additions</th>
          <th>Total Deletions</th>
        </tr>
      </thead>
      <tbody>
        {repoStats.map((repoStat) => (
          <tr key={repoStat.repoName}>
            <td>{repoStat.repoName}</td>
            <td>{repoStat.totalChanges.additions}</td>
            <td>{repoStat.totalChanges.deletions}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RepoStatsTable;
