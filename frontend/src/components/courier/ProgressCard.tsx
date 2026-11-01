import type { DashboardStats } from '../../types/courier';

interface ProgressCardProps {
  stats: DashboardStats;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ stats }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.completionPercentage / 100) * circumference;

  return (
    <div className="content-card">
      <div className="card-header-row">
        <h2 className="card-title">Today's Progress</h2>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#A36A00' }}>
          {stats.delivered} / {stats.assignedToday} parcels
        </span>
      </div>

      <div className="progress-card-inner">
        <div className="progress-visual-row">
          {/* Circular Donut Ring */}
          <div className="progress-donut">
            <svg width="104" height="104" viewBox="0 0 104 104">
              {/* Background Track */}
              <circle
                cx="52"
                cy="52"
                r={radius}
                fill="none"
                stroke="#F5EFE7"
                strokeWidth="10"
              />
              {/* Progress Arc */}
              <circle
                cx="52"
                cy="52"
                r={radius}
                fill="none"
                stroke="#F4B942"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 52 52)"
                style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
              />
            </svg>
            <div className="progress-donut-center">
              <span className="donut-pct">{stats.completionPercentage}%</span>
              <span className="donut-sub">DONE</span>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="progress-breakdown-list">
            <div className="progress-breakdown-item">
              <span className="breakdown-label">
                <span className="breakdown-dot" style={{ backgroundColor: '#22A04A' }} />
                Delivered
              </span>
              <span className="breakdown-count">{stats.delivered}</span>
            </div>

            <div className="progress-breakdown-item">
              <span className="breakdown-label">
                <span className="breakdown-dot" style={{ backgroundColor: '#2563EB' }} />
                In Progress
              </span>
              <span className="breakdown-count">{stats.inProgress}</span>
            </div>

            <div className="progress-breakdown-item">
              <span className="breakdown-label">
                <span className="breakdown-dot" style={{ backgroundColor: '#DC2626' }} />
                Failed
              </span>
              <span className="breakdown-count">{stats.failed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
