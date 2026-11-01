import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { TopHeader } from '../../components/layout/TopHeader';
import { StatusBadge } from '../../components/common/Badge';
import {
  ArrowLeftIcon,
  LocationPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
} from '../../components/common/Icons';
import { courierService } from '../../services/courier/courierService';
import type { DeliveryDetails, ParcelStatus } from '../../types/courier';

export const DeliveryDetailPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState<DeliveryDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status Action Form State
  const [actionType, setActionType] = useState<'NONE' | 'ADVANCE' | 'CONFIRM' | 'FAIL'>('NONE');
  const [nextStatus, setNextStatus] = useState<ParcelStatus>('IN_TRANSIT');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [signName, setSignName] = useState<string>('');
  const [failureReason, setFailureReason] = useState<string>('RECIPIENT_UNAVAILABLE');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetails() {
      if (!trackingNumber) return;

      try {
        setLoading(true);
        const data = await courierService.getDeliveryDetails(trackingNumber);
        if (isMounted) {
          if (!data) {
            setError(`Parcel with tracking number "${trackingNumber}" was not found.`);
          } else {
            setDelivery(data);
            // Default next status
            if (data.status === 'CREATED' || data.status === 'PICKED_UP') {
              setNextStatus('IN_TRANSIT');
            } else if (data.status === 'IN_TRANSIT') {
              setNextStatus('OUT_FOR_DELIVERY');
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching delivery details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [trackingNumber]);

  const handleAdvanceStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery) return;

    try {
      setSubmitting(true);
      const updated = await courierService.updateDeliveryStatus(delivery.trackingNumber, {
        nextStatus,
        notes: actionNotes,
      });
      setDelivery(updated);
      setActionSuccess(`Status advanced to ${nextStatus.replace('_', ' ')}!`);
      setActionType('NONE');
      setActionNotes('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery) return;

    if (!signName.trim()) {
      alert('Recipient confirmation name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await courierService.confirmDelivery(delivery.trackingNumber, {
        recipientSignName: signName,
        deliveryNotes: actionNotes,
      });
      setDelivery(updated);
      setActionSuccess('Delivery confirmed successfully!');
      setActionType('NONE');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to confirm delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportFailure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery) return;

    if (!actionNotes.trim()) {
      alert('Detailed failure remarks are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await courierService.reportFailure(delivery.trackingNumber, {
        failureReason,
        failureRemarks: actionNotes,
      });
      setDelivery(updated);
      setActionSuccess('Delivery marked as failed.');
      setActionType('NONE');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to report failure.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
        <p>Loading parcel details...</p>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#DC2626', fontWeight: 700, marginBottom: '16px' }}>
          {error || 'Parcel not found.'}
        </p>
        <button
          type="button"
          className="btn-action"
          onClick={() => navigate('/courier/deliveries')}
        >
          <ArrowLeftIcon size={16} />
          <span>Back to My Deliveries</span>
        </button>
      </div>
    );
  }

  const isDelivered = delivery.status === 'DELIVERED';
  const isFailed = delivery.status === 'FAILED';
  const isCompleted = isDelivered || isFailed;

  return (
    <>
      <TopHeader
        title={`Parcel ${delivery.trackingNumber}`}
        subtitle={`Delivery assigned to ${delivery.recipientName}`}
      />

      {/* Back Button & Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Link
          to="/courier/deliveries"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <ArrowLeftIcon size={16} />
          <span>Back to My Deliveries</span>
        </Link>

        <StatusBadge status={delivery.status} />
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div
          style={{
            backgroundColor: '#F0FAF3',
            border: '1px solid #D6EFE0',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <span>✓ {actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Card 1: Recipient & Location */}
        <div className="content-card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>
            Recipient & Destination
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Recipient Name
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {delivery.recipientName}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Phone Number
              </span>
              <a
                href={`tel:${delivery.recipientPhone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#2563EB',
                  textDecoration: 'none',
                  marginTop: '2px',
                }}
              >
                <PhoneIcon size={14} />
                {delivery.recipientPhone}
              </a>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                Delivery Address
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px' }}>
                <LocationPinIcon size={16} color="#9E968E" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {delivery.deliveryAddress}, {delivery.city} ({delivery.postalCode})
                </span>
              </div>
            </div>

            {delivery.specialInstructions && (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FEF3C7',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  marginTop: '6px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', display: 'block' }}>
                  Delivery Instructions
                </span>
                <p style={{ fontSize: '13px', color: '#78350F', marginTop: '4px' }}>
                  {delivery.specialInstructions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Actions & Proof */}
        <div className="content-card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>
            Delivery Actions
          </h2>

          {!isCompleted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Current status is <strong>{delivery.status.replace('_', ' ')}</strong>. You can advance progress, confirm delivery, or document a failure.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-action primary"
                  style={{ flex: 1, minHeight: '44px', justifyContent: 'center' }}
                  onClick={() => setActionType('ADVANCE')}
                >
                  Advance Status
                </button>

                <button
                  type="button"
                  className="btn-action"
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    justifyContent: 'center',
                    backgroundColor: '#F0FAF3',
                    borderColor: '#D6EFE0',
                    color: '#166534',
                  }}
                  onClick={() => setActionType('CONFIRM')}
                >
                  <CheckCircleIcon size={16} />
                  <span>Confirm Delivered</span>
                </button>

                <button
                  type="button"
                  className="btn-action"
                  style={{
                    minHeight: '44px',
                    backgroundColor: '#FEF2F2',
                    borderColor: '#FCDDD7',
                    color: '#DC2626',
                  }}
                  onClick={() => setActionType('FAIL')}
                >
                  <AlertCircleIcon size={16} />
                  <span>Report Failed</span>
                </button>
              </div>

              {/* Form 1: Advance Status */}
              {actionType === 'ADVANCE' && (
                <form
                  onSubmit={handleAdvanceStatus}
                  style={{
                    backgroundColor: '#FAF7F2',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Advance Parcel Status</h3>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Next Status:
                    </label>
                    <select
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value as ParcelStatus)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: '#FFFFFF',
                        fontSize: '13.5px',
                      }}
                    >
                      <option value="PICKED_UP">PICKED_UP</option>
                      <option value="IN_TRANSIT">IN_TRANSIT</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Status Notes (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dispatched from sorting center"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        fontSize: '13.5px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => setActionType('NONE')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-action primary"
                    >
                      {submitting ? 'Saving...' : 'Save Status Update'}
                    </button>
                  </div>
                </form>
              )}

              {/* Form 2: Confirm Delivered */}
              {actionType === 'CONFIRM' && (
                <form
                  onSubmit={handleConfirmDelivery}
                  style={{
                    backgroundColor: '#F0FAF3',
                    border: '1px solid #D6EFE0',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>
                    Confirm Successful Delivery
                  </h3>
                  <div>
                    <label style={{ fontSize: '12px', color: '#166534', display: 'block', marginBottom: '4px' }}>
                      Recipient Sign Name *:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Name of person receiving the package"
                      value={signName}
                      onChange={(e) => setSignName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #D6EFE0',
                        fontSize: '13.5px',
                        background: '#FFFFFF',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#166534', display: 'block', marginBottom: '4px' }}>
                      Delivery Note (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Handed over at front door"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #D6EFE0',
                        fontSize: '13.5px',
                        background: '#FFFFFF',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => setActionType('NONE')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-action"
                      style={{ backgroundColor: '#22A04A', color: 'white', borderColor: '#22A04A' }}
                    >
                      {submitting ? 'Confirming...' : 'Confirm Delivery'}
                    </button>
                  </div>
                </form>
              )}

              {/* Form 3: Report Failure */}
              {actionType === 'FAIL' && (
                <form
                  onSubmit={handleReportFailure}
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCDDD7',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>
                    Report Delivery Failure
                  </h3>
                  <div>
                    <label style={{ fontSize: '12px', color: '#991B1B', display: 'block', marginBottom: '4px' }}>
                      Failure Reason *:
                    </label>
                    <select
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #FCDDD7',
                        background: '#FFFFFF',
                        fontSize: '13.5px',
                      }}
                    >
                      <option value="RECIPIENT_UNAVAILABLE">Recipient Unavailable / Phone Unreachable</option>
                      <option value="INCORRECT_ADDRESS">Incorrect Delivery Address</option>
                      <option value="CUSTOMER_REJECTED">Customer Refused Package</option>
                      <option value="DAMAGED_PARCEL">Damaged Parcel Packaging</option>
                      <option value="ACCESS_RESTRICTED">Premises Access Restricted / Gate Locked</option>
                      <option value="OTHER">Other Reason</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#991B1B', display: 'block', marginBottom: '4px' }}>
                      Detailed Remarks *:
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain the specific reason why this delivery could not be completed..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #FCDDD7',
                        fontSize: '13.5px',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => setActionType('NONE')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-action"
                      style={{ backgroundColor: '#DC2626', color: 'white', borderColor: '#DC2626' }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Failure Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {isDelivered && (
                <div style={{ backgroundColor: '#F0FAF3', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700 }}>
                    <CheckCircleIcon size={18} />
                    <span>Delivered & Verified</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#14532D' }}>
                    <p><strong>Signed by:</strong> {delivery.proof?.recipientSignName || delivery.recipientName}</p>
                    {delivery.proof?.deliveryNotes && <p style={{ marginTop: '4px' }}><strong>Note:</strong> {delivery.proof.deliveryNotes}</p>}
                    <p style={{ marginTop: '4px', fontSize: '12px', color: '#166534' }}>
                      Captured on: {delivery.proof?.capturedAt || 'Today'}
                    </p>
                  </div>
                </div>
              )}

              {isFailed && (
                <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontWeight: 700 }}>
                    <AlertCircleIcon size={18} />
                    <span>Delivery Attempt Failed</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#991B1B' }}>
                    <p><strong>Reason:</strong> {delivery.failure?.failureReason.replace('_', ' ')}</p>
                    <p style={{ marginTop: '4px' }}><strong>Remarks:</strong> {delivery.failure?.failureRemarks}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Status Audit History */}
      <div className="content-card" style={{ marginTop: '20px' }}>
        <h2 className="card-title" style={{ marginBottom: '16px' }}>
          Status Audit History
        </h2>

        {delivery.statusHistory.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No previous status changes logged.</p>
        ) : (
          <div className="timeline-list">
            {delivery.statusHistory.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-icon-badge gold">
                  <ClockIcon size={16} color="#1F1712" />
                </div>
                <div className="timeline-content">
                  <span className="timeline-title">
                    {item.fromStatus ? `${item.fromStatus} → ` : ''}{item.toStatus}
                  </span>
                  <span className="timeline-sub">
                    By {item.changedBy} • {item.timestamp}
                  </span>
                  {item.notes && (
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
