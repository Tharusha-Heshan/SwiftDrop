import React, { useEffect, useState } from 'react';
import { TopHeader } from '../../components/layout/TopHeader';
import { DeliveryTable } from '../../components/courier/DeliveryTable';
import { DeliveryCardMobile } from '../../components/courier/DeliveryCardMobile';
import { courierService } from '../../services/courier/courierService';
import type { DeliverySummary } from '../../types/courier';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<DeliverySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courierService.getDeliveryHistory().then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <TopHeader
        title="Delivery History"
        subtitle="Archive of completed deliveries and past execution records."
      />

      <div className="content-card">
        <div className="card-header-row">
          <h2 className="card-title">Completed & Closed Shipments</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Total: <strong>{history.length}</strong> records
          </span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Loading delivery history...
          </p>
        ) : history.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No past deliveries found.
          </p>
        ) : (
          <>
            <DeliveryTable deliveries={history} />
            <div className="mobile-delivery-list">
              {history.map((delivery) => (
                <DeliveryCardMobile key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
