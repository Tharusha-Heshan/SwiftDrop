import React from 'react';
import { Link } from 'react-router-dom';
import type { DeliverySummary } from '../../types/courier';
import { StatusBadge } from '../common/Badge';
import { LocationPinIcon, EyeIcon, PencilIcon } from '../common/Icons';

interface DeliveryCardMobileProps {
  delivery: DeliverySummary;
}

export const DeliveryCardMobile: React.FC<DeliveryCardMobileProps> = ({ delivery }) => {
  const isCompleted = ['DELIVERED', 'FAILED'].includes(delivery.status);

  return (
    <article className="delivery-card-mobile">
      <div className="mobile-card-header">
        <span className="tracking-id" style={{ fontSize: '14px', color: '#241913' }}>
          {delivery.trackingNumber}
        </span>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="mobile-card-body">
        <div className="mobile-card-recipient">{delivery.recipientName}</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
          <LocationPinIcon size={14} color="#9E968E" style={{ marginTop: '3px', flexShrink: 0 }} />
          <span className="mobile-card-address">{delivery.deliveryAddress}</span>
        </div>
      </div>

      <div className="mobile-card-footer">
        <span style={{ fontSize: '12px', color: '#9E968E' }}>
          {delivery.assignedAt}
        </span>
        <Link
          to={`/courier/deliveries/${delivery.trackingNumber}`}
          className={`btn-action ${!isCompleted ? 'primary' : ''}`}
          style={{ minHeight: '38px', minWidth: '90px', justifyContent: 'center' }}
        >
          {!isCompleted ? (
            <>
              <PencilIcon size={14} />
              <span>Update</span>
            </>
          ) : (
            <>
              <EyeIcon size={14} />
              <span>View</span>
            </>
          )}
        </Link>
      </div>
    </article>
  );
};
