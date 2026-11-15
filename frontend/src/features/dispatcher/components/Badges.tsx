import type { CourierAvailability, DeliverySource, DeliveryStatus } from '../api/dispatcherTypes';
import { availabilityLabels, sourceLabels, statusLabels } from '../lib/format';
import styles from './Dispatcher.module.css';

export function StatusBadge({ status }: { status: DeliveryStatus }) {
  return <span className={styles.status} data-status={status}>{statusLabels[status]}</span>;
}

export function AvailabilityBadge({ availability }: { availability: CourierAvailability }) {
  return <span className={styles.availability} data-availability={availability}>{availabilityLabels[availability]}</span>;
}

export function SourceBadge({ source }: { source: DeliverySource }) {
  return <span className={styles.source}>{sourceLabels[source]}</span>;
}
