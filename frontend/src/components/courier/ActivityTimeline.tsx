import React from 'react';
import { Link } from 'react-router-dom';
import type { ActivityUpdate } from '../../types/courier';
import { CheckCircleIcon, TruckIcon, PackageIcon } from '../common/Icons';

interface ActivityTimelineProps {
  updates: ActivityUpdate[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ updates }) => {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return {
          className: 'green',
          icon: <CheckCircleIcon size={16} color="#FFFFFF" />,
        };
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return {
          className: 'blue',
          icon: <TruckIcon size={16} color="#FFFFFF" />,
        };
      default:
        return {
          className: 'gold',
          icon: <PackageIcon size={16} color="#1F1712" />,
        };
    }
  };

  return (
    <div className="content-card">
      <div className="card-header-row">
        <h2 className="card-title">Recent Updates</h2>
        <Link to="/courier/history" className="card-link">
          View All →
        </Link>
      </div>

      <div className="timeline-list">
        {updates.map((item) => {
          const badge = getBadgeStyle(item.status);
          return (
            <div key={item.id} className="timeline-item">
              <div className={`timeline-icon-badge ${badge.className}`}>
                {badge.icon}
              </div>
              <div className="timeline-content">
                <span className="timeline-title">
                  {item.trackingNumber} — {item.status.replace('_', ' ')}
                </span>
                <span className="timeline-sub">
                  {item.recipientName} • {item.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
