import './BloodTypePieChart.css';

const CHART_COLORS = [
  '#c0392b',
  '#e74c3c',
  '#d35400',
  '#e67e22',
  '#8e44ad',
  '#9b59b6',
  '#2980b9',
  '#3498db',
];

function BloodTypePieChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + (item.availableUnits || 0), 0);

  if (total === 0) {
    return (
      <div className="blood-pie-chart blood-pie-chart--empty">
        <p>No available units in inventory yet.</p>
        <p className="blood-pie-chart__hint">Add stock from the Inventory page.</p>
      </div>
    );
  }

  let cumulative = 0;
  const segments = data
    .filter((item) => item.availableUnits > 0)
    .map((item, index) => {
      const start = cumulative;
      const slice = (item.availableUnits / total) * 100;
      cumulative += slice;
      return {
        color: CHART_COLORS[index % CHART_COLORS.length],
        start,
        end: cumulative,
      };
    });

  const gradient = segments
    .map((seg) => `${seg.color} ${seg.start}% ${seg.end}%`)
    .join(', ');

  return (
    <div className="blood-pie-chart">
      <div className="blood-pie-chart__visual">
        <div
          className="blood-pie-chart__ring"
          style={{ background: `conic-gradient(${gradient})` }}
          aria-hidden="true"
        />
        <div className="blood-pie-chart__hole">
          <strong>{total}</strong>
          <span>units</span>
        </div>
      </div>
      <ul className="blood-pie-chart__legend">
        {data.map((item, index) => (
          <li key={item.bloodGroup}>
            <span
              className="blood-pie-chart__swatch"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span>{item.bloodGroup}</span>
            <strong>{item.availableUnits}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BloodTypePieChart;
