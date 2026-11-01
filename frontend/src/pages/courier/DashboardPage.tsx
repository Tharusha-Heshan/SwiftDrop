import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TopHeader } from '../../components/layout/TopHeader';
import { StatCard } from '../../components/common/StatCard';
import { ProgressCard } from '../../components/courier/ProgressCard';
import { ActivityTimeline } from '../../components/courier/ActivityTimeline';
import { DeliveryTable } from '../../components/courier/DeliveryTable';
import { DeliveryCardMobile } from '../../components/courier/DeliveryCardMobile';
import {
  PackageIcon,
  TruckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ParcelHeroGraphic,
} from '../../components/common/Icons';
import { courierService } from '../../services/courier/courierService';
import type {
  DashboardStats,
  DeliverySummary,
  ActivityUpdate,
  CourierProfile,
  StatusFilterOption,
} from '../../types/courier';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deliveries, setDeliveries] = useState<DeliverySummary[]>([]);
  const [updates, setUpdates] = useState<ActivityUpdate[]>([]);
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsData, deliveriesData, updatesData, profileData] = await Promise.all([
          courierService.getDashboardStats(),
          courierService.getAssignedDeliveries({ status: statusFilter }),
          courierService.getRecentUpdates(),
          courierService.getCourierProfile(),
        ]);

        if (isMounted) {
          setStats(statsData);
          setDeliveries(deliveriesData.slice(0, 5)); // Show preview of 5 items on dashboard
          setUpdates(updatesData);
          setProfile(profileData);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#746C65' }}>
        <p style={{ fontSize: '16px', fontWeight: 600 }}>Loading Courier Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontWeight: 700, marginBottom: '12px' }}>
          {error || 'Unable to retrieve courier data.'}
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

  return (
    <>
      {/* Top Header */}
      <TopHeader
        title={`Good morning, ${profile?.fullName.split(' ')[0] || 'Courier'}!`}
        subtitle="Track your tasks and keep every parcel moving."
        courierName={profile?.fullName}
        courierZone={profile?.assignedZone}
      />

      {/* Welcome Banner */}
      <section className="welcome-banner" aria-label="Welcome announcement">
        <div className="welcome-content">
          <div className="welcome-badge">
            <PackageIcon size={14} color="#795514" />
            <span>SwiftDrop Courier</span>
          </div>
          <h2 className="welcome-title">Ready for today’s deliveries?</h2>
          <p className="welcome-subtitle">
            You have {stats.assignedToday} parcels scheduled for delivery today. {stats.delivered} have been completed successfully.
          </p>
        </div>
        <div className="banner-illustration" aria-hidden="true">
          <ParcelHeroGraphic />
        </div>
      </section>

      {/* 4 Statistics Cards */}
      <section className="stats-grid" aria-label="Key delivery statistics">
        <StatCard
          label="Assigned Today"
          value={stats.assignedToday}
          variant="gold"
          icon={<PackageIcon size={24} color="#8C6418" />}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          variant="blue"
          icon={<TruckIcon size={24} color="#2563EB" />}
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          variant="green"
          icon={<CheckCircleIcon size={24} color="#22A04A" />}
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          variant="red"
          icon={<AlertCircleIcon size={24} color="#DC2626" />}
        />
      </section>

      {/* Dashboard Content Split Grid */}
      <div className="dashboard-content-grid">
        {/* Left Column: My Deliveries Preview */}
        <section className="dashboard-left-col">
          <div className="content-card">
            <div className="card-header-row">
              <h2 className="card-title">My Deliveries</h2>
              <Link to="/courier/deliveries" className="card-link">
                View All →
              </Link>
            </div>

            {/* Horizontal Filter Tabs */}
            <div className="filter-tabs-wrapper" role="tablist" aria-label="Status filters">
              {(['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED'] as StatusFilterOption[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === tab}
                  className={`filter-tab ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Desktop Table View */}
            <DeliveryTable deliveries={deliveries} />

            {/* Mobile Stacked Cards View */}
            <div className="mobile-delivery-list">
              {deliveries.map((delivery) => (
                <DeliveryCardMobile key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Progress Card & Activity Timeline */}
        <aside className="dashboard-right-col">
          <ProgressCard stats={stats} />
          <ActivityTimeline updates={updates} />
        </aside>
      </div>
    </>
  );
};
