
const DateRangeInputs = ({ startDate, endDate, setStartDate, setEndDate }) => (
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
);

export default DateRangeInputs;
