import type { ParcelStatus } from '../../types/courier';

interface BadgeProps {
  status: ParcelStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  let label: string;
  let modifierClass: string;

  switch (normalized) {
    case 'CREATED':
    case 'PENDING':
    case 'CONFIRMED':
      modifierClass = 'created';
      label = normalized === 'CONFIRMED' ? 'Confirmed' : 'Pending';
      break;
    case 'PICKED_UP':
      modifierClass = 'picked-up';
      label = 'Picked Up';
      break;
    case 'IN_TRANSIT':
      modifierClass = 'in_transit';
      label = 'In Transit';
      break;
    case 'OUT_FOR_DELIVERY':
      modifierClass = 'out_for_delivery';
      label = 'Out for Delivery';
      break;
    case 'DELIVERED':
      modifierClass = 'delivered';
      label = 'Delivered';
      break;
    case 'FAILED':
      modifierClass = 'failed';
      label = 'Failed';
      break;
    case 'CANCELLED':
      modifierClass = 'failed';
      label = 'Cancelled';
      break;
    default:
      modifierClass = 'pending';
      label = status;
  }

  return (
    <span className={`status-badge ${modifierClass} ${className}`}>
      {label}
    </span>
  );
};
