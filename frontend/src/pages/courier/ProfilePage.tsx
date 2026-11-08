import React, { useEffect, useState } from 'react';
import { TopHeader } from '../../components/layout/TopHeader';
import { courierService } from '../../services/courier/courierService';
import type { CourierProfile, DashboardStats } from '../../types/courier';
import { TruckIcon, PhoneIcon } from '../../components/common/Icons';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      courierService.getCourierProfile(),
      courierService.getDashboardStats(),
    ])
      .then(([p, s]) => {
        if (isMounted) {
          setProfile(p);
          setStats(s);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve profile data.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#746C65' }}>
        <p style={{ fontSize: '16px', fontWeight: 600 }}>Loading Courier Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontWeight: 700, marginBottom: '12px' }}>
          {error || 'Unable to retrieve courier profile.'}
        </p>
        <button
          type="button"
          className="btn-action primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const initials = profile.fullName
    ? profile.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CP';

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
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {profile.fullName || 'Authorized Courier'}
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
              <span style={{ fontWeight: 600 }}>{profile.email || 'Not provided'}</span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Contact Number
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <PhoneIcon size={14} color="#746C65" />
                {profile.phoneNumber || 'Not provided'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Assigned Delivery Zone
              </span>
              <span style={{ fontWeight: 600 }}>{profile.assignedZone || 'Not assigned'}</span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Assigned Vehicle
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <TruckIcon size={14} color="#746C65" />
                {profile.vehicleType || 'Standard'}
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
              <strong style={{ fontSize: '16px' }}>{stats?.assignedToday ?? 0}</strong>
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
              <strong style={{ fontSize: '16px' }}>{stats?.delivered ?? 0}</strong>
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
              <strong style={{ fontSize: '16px' }}>{stats?.failed ?? 0}</strong>
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
              <strong style={{ fontSize: '16px' }}>{stats?.completionPercentage ?? 0}%</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
