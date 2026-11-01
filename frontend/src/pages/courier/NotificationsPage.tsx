import { TopHeader } from '../../components/layout/TopHeader';
import { PackageIcon, AlertCircleIcon } from '../../components/common/Icons';

export const NotificationsPage: React.FC = () => {
  const notifications = [
    {
      id: '1',
      title: 'New Delivery Assigned',
      message: 'Dispatcher assigned parcel SD-1048-7296 to your route in Ibbagamuwa zone.',
      time: '1 hour ago',
      type: 'INFO',
    },
    {
      id: '2',
      title: 'Priority Dispatch Update',
      message: 'Parcel SD-1048-7291 has requested expedited morning delivery. Please prioritize.',
      time: '2 hours ago',
      type: 'ALERT',
    },
    {
      id: '3',
      title: 'Daily Shift Assigned',
      message: 'Good morning Sachin! 12 deliveries have been assigned to your shift for today.',
      time: 'Today, 07:15 AM',
      type: 'INFO',
    },
  ];

  return (
    <>
      <TopHeader
        title="Notifications"
        subtitle="Operational updates, priority requests, and dispatcher announcements."
      />

      <div className="content-card">
        <div className="card-header-row">
          <h2 className="card-title">Recent Alerts</h2>
          <span style={{ fontSize: '12px', color: '#A36A00', fontWeight: 600 }}>
            Events & Notifications Integration Boundary
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                gap: '14px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: n.type === 'ALERT' ? '#FFFBEB' : '#FAF7F2',
                border: `1px solid ${n.type === 'ALERT' ? '#FEF3C7' : 'var(--border)'}`,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: n.type === 'ALERT' ? '#FDE68A' : 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {n.type === 'ALERT' ? (
                  <AlertCircleIcon size={18} color="#92400E" />
                ) : (
                  <PackageIcon size={18} color="#1F1712" />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
