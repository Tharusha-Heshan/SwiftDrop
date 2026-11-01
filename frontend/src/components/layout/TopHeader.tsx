import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '../common/Icons';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  courierName?: string;
  courierZone?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'Courier Dashboard',
  subtitle = 'Manage assigned parcels and update delivery progress.',
  courierName = 'Sachin Maleesha',
  courierZone = 'Kurunegala North',
}) => {
  const navigate = useNavigate();

  return (
    <header className="top-header">
      <div className="header-left">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        {/* Notification Bell */}
        <button
          type="button"
          className="icon-btn"
          aria-label="Notifications"
          onClick={() => navigate('/courier/notifications')}
        >
          <BellIcon size={20} color="#241913" />
          <span className="notification-badge-dot" />
        </button>

        {/* Profile Chip */}
        <div
          className="profile-chip"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/courier/profile')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/courier/profile')}
        >
          <div className="avatar">SM</div>
          <div className="profile-info">
            <span className="profile-name">{courierName}</span>
            <span className="profile-role">{courierZone}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
