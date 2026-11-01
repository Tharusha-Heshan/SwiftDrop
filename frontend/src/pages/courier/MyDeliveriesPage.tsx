import React, { useEffect, useState } from 'react';
import { TopHeader } from '../../components/layout/TopHeader';
import { DeliveryTable } from '../../components/courier/DeliveryTable';
import { DeliveryCardMobile } from '../../components/courier/DeliveryCardMobile';
import { SearchIcon } from '../../components/common/Icons';
import { courierService } from '../../services/courier/courierService';
import type { DeliverySummary, StatusFilterOption } from '../../types/courier';

export const MyDeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliverySummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDeliveries() {
      try {
        setLoading(true);
        const data = await courierService.getAssignedDeliveries({
          status: statusFilter,
          search: searchQuery,
        });

        if (isMounted) {
          setDeliveries(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve deliveries.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      fetchDeliveries();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [statusFilter, searchQuery]);

  return (
    <>
      <TopHeader
        title="My Deliveries"
        subtitle="Review, filter, and execute deliveries assigned to your route today."
      />

      <div className="content-card">
        {/* Controls Bar: Search & Filter Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#FAF7F2',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 14px',
              maxWidth: '480px',
            }}
          >
            <SearchIcon size={18} color="#9E968E" />
            <input
              type="text"
              placeholder="Search by tracking number, recipient, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '13.5px',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#9E968E',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs-wrapper" role="tablist" aria-label="Status filters">
            {(['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'] as StatusFilterOption[]).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === tab}
                  className={`filter-tab ${statusFilter === tab ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab === 'ALL' ? 'All Deliveries' : tab.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '12px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>
            Showing <strong>{deliveries.length}</strong> assigned parcel{deliveries.length === 1 ? '' : 's'}
          </span>
          {statusFilter !== 'ALL' && (
            <span style={{ fontSize: '12px', color: '#A36A00', fontWeight: 600 }}>
              Filtered by: {statusFilter.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            <p>Loading assigned deliveries...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#DC2626' }}>
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && deliveries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No deliveries found
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              No parcels match your current filter or search criteria.
            </p>
          </div>
        )}

        {/* Desktop View: Full Table */}
        {!loading && !error && deliveries.length > 0 && (
          <>
            <DeliveryTable deliveries={deliveries} />

            {/* Mobile View: Stacked Cards */}
            <div className="mobile-delivery-list">
              {deliveries.map((delivery) => (
                <DeliveryCardMobile key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
