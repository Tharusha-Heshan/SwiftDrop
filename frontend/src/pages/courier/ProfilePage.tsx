import React, { useEffect, useState } from 'react';
import { TopHeader } from '../../components/layout/TopHeader';
import { courierService } from '../../services/courier/courierService';
import type { CourierProfile, DashboardStats } from '../../types/courier';
import { TruckIcon, PhoneIcon } from '../../components/common/Icons';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    Promise.all([
      courierService.getCourierProfile(),
      courierService.getDashboardStats(),
    ]).then(([p, s]) => {
      setProfile(p);
      setStats(s);
    });
  }, []);

  return (
    <>
      <TopHeader
        title="Courier Profile"
        subtitle="Operational shift details, assigned vehicle, and service zone."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Profile Card */}
        <div className="content-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: '#8C6418',
                fontSize: '22px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              SM
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {profile?.fullName || 'Sachin Maleesha'}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Authorized Courier Personnel
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Email Address
              </span>
              <span style={{ fontWeight: 600 }}>{profile?.email}</span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Contact Number
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <PhoneIcon size={14} color="#746C65" />
                {profile?.phoneNumber}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Assigned Delivery Zone
              </span>
              <span style={{ fontWeight: 600 }}>{profile?.assignedZone}</span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Assigned Vehicle
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <TruckIcon size={14} color="#746C65" />
                {profile?.vehicleType}
              </span>
            </div>
          </div>
        </div>

        {/* Shift Summary Card */}
        <div className="content-card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>
            Today's Shift Performance
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#FAF7F2',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>Total Assigned</span>
              <strong style={{ fontSize: '16px' }}>{stats?.assignedToday ?? 12}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#F0FAF3',
                borderRadius: 'var(--radius-lg)',
                color: '#166534',
              }}
            >
              <span style={{ fontSize: '13.5px' }}>Successful Deliveries</span>
              <strong style={{ fontSize: '16px' }}>{stats?.delivered ?? 6}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#FEF2F2',
                borderRadius: 'var(--radius-lg)',
                color: '#991B1B',
              }}
            >
              <span style={{ fontSize: '13.5px' }}>Reported Failures</span>
              <strong style={{ fontSize: '16px' }}>{stats?.failed ?? 1}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#FFFBEB',
                borderRadius: 'var(--radius-lg)',
                color: '#92400E',
              }}
            >
              <span style={{ fontSize: '13.5px' }}>Completion Rate</span>
              <strong style={{ fontSize: '16px' }}>{stats?.completionPercentage ?? 50}%</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
