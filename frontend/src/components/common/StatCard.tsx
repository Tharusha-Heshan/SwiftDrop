import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  variant: 'gold' | 'blue' | 'green' | 'red';
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, variant, icon }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper ${variant}`}>
        {icon}
      </div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
};
