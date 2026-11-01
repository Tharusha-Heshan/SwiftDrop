import React from 'react';
import { Link } from 'react-router-dom';
import type { DeliverySummary } from '../../types/courier';
import { StatusBadge } from '../common/Badge';
import { LocationPinIcon, EyeIcon, PencilIcon } from '../common/Icons';

interface DeliveryTableProps {
  deliveries: DeliverySummary[];
}

export const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries }) => {
  if (deliveries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '36px 16px', color: '#746C65' }}>
        No deliveries found matching the selected filter.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="deliveries-table">
        <thead>
          <tr>
            <th>Tracking Number</th>
            <th>Recipient</th>
            <th>Address</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery) => {
            const isCompleted = ['DELIVERED', 'FAILED'].includes(delivery.status);

            return (
              <tr key={delivery.id}>
                <td className="tracking-id">
                  <Link
                    to={`/courier/deliveries/${delivery.trackingNumber}`}
                    style={{ color: '#241913', textDecoration: 'none', fontWeight: 700 }}
                  >
                    {delivery.trackingNumber}
                  </Link>
                </td>
                <td>
                  <div className="recipient-col">
                    <span className="recipient-name">{delivery.recipientName}</span>
                    <span className="recipient-phone">{delivery.recipientPhone}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LocationPinIcon size={14} color="#9E968E" />
                    <span className="address-text">{delivery.deliveryAddress}</span>
                  </div>
                </td>
                <td>
                  <StatusBadge status={delivery.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link
                    to={`/courier/deliveries/${delivery.trackingNumber}`}
                    className={`btn-action ${!isCompleted ? 'primary' : ''}`}
                  >
                    {!isCompleted ? (
                      <>
                        <PencilIcon size={13} />
                        <span>Update</span>
                      </>
                    ) : (
                      <>
                        <EyeIcon size={13} />
                        <span>View</span>
                      </>
                    )}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
