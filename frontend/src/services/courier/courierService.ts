import type {
  CourierDataService,
  DashboardStats,
  DeliverySummary,
  DeliveryDetails,
  CourierProfile,
  ActivityUpdate,
  StatusUpdateRequest,
  DeliveryConfirmationRequest,
  DeliveryFailureRequest,
} from '../../types/courier';
import {
  mockCourierProfile,
  initialMockDeliveries,
  initialMockUpdates,
} from '../../mocks/courier/mockData';

class MockCourierDataServiceImpl implements CourierDataService {
  private deliveries: DeliveryDetails[] = [...initialMockDeliveries];
  private updates: ActivityUpdate[] = [...initialMockUpdates];
  private profile: CourierProfile = { ...mockCourierProfile };

  private delay(ms = 120): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    await this.delay();
    const todayDeliveries = this.deliveries.filter((d) => d.isToday);
    const assignedToday = todayDeliveries.length;
    const delivered = todayDeliveries.filter((d) => d.status === 'DELIVERED').length;
    const failed = todayDeliveries.filter((d) => d.status === 'FAILED').length;
    const inProgress = todayDeliveries.filter((d) =>
      ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)
    ).length;

    const completionPercentage =
      assignedToday > 0 ? Math.round((delivered / assignedToday) * 100) : 0;

    return {
      assignedToday,
      inProgress,
      delivered,
      failed,
      completionPercentage,
    };
  }

  async getAssignedDeliveries(filter?: {
    status?: string;
    search?: string;
  }): Promise<DeliverySummary[]> {
    await this.delay();
    let result = [...this.deliveries];

    if (filter?.status && filter.status !== 'ALL') {
      const s = filter.status.toUpperCase();
      if (s === 'PENDING') {
        result = result.filter((d) => ['CREATED', 'PICKED_UP'].includes(d.status));
      } else if (s === 'IN_TRANSIT') {
        result = result.filter((d) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status));
      } else {
        result = result.filter((d) => d.status === s);
      }
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.trackingNumber.toLowerCase().includes(q) ||
          d.recipientName.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.deliveryAddress.toLowerCase().includes(q)
      );
    }

    // Map to summaries
    return result.map((d) => ({
      id: d.id,
      trackingNumber: d.trackingNumber,
      recipientName: d.recipientName,
      recipientPhone: d.recipientPhone,
      deliveryAddress: d.deliveryAddress,
      city: d.city,
      postalCode: d.postalCode,
      status: d.status,
      specialInstructions: d.specialInstructions,
      assignedAt: d.assignedAt,
      isToday: d.isToday,
    }));
  }

  async getDeliveryDetails(trackingNumber: string): Promise<DeliveryDetails | null> {
    await this.delay();
    const match = this.deliveries.find((d) => d.trackingNumber.toUpperCase() === trackingNumber.toUpperCase());
    return match ? { ...match } : null;
  }

  async getDeliveryHistory(): Promise<DeliverySummary[]> {
    await this.delay();
    return this.deliveries
      .filter((d) => ['DELIVERED', 'FAILED'].includes(d.status))
      .map((d) => ({
        id: d.id,
        trackingNumber: d.trackingNumber,
        recipientName: d.recipientName,
        recipientPhone: d.recipientPhone,
        deliveryAddress: d.deliveryAddress,
        city: d.city,
        postalCode: d.postalCode,
        status: d.status,
        specialInstructions: d.specialInstructions,
        assignedAt: d.assignedAt,
        isToday: d.isToday,
      }));
  }

  async getCourierProfile(): Promise<CourierProfile> {
    await this.delay();
    return { ...this.profile };
  }

  async getRecentUpdates(): Promise<ActivityUpdate[]> {
    await this.delay();
    return [...this.updates];
  }

  async updateDeliveryStatus(
    trackingNumber: string,
    request: StatusUpdateRequest
  ): Promise<DeliveryDetails> {
    await this.delay();
    const index = this.deliveries.findIndex(
      (d) => d.trackingNumber.toUpperCase() === trackingNumber.toUpperCase()
    );

    if (index === -1) {
      throw new Error(`Parcel with tracking number ${trackingNumber} not found.`);
    }

    const current = this.deliveries[index];
    const newHistoryItem = {
      id: `h-${Date.now()}`,
      fromStatus: current.status,
      toStatus: request.nextStatus,
      changedBy: this.profile.fullName,
      timestamp: 'Just now',
      notes: request.notes || `Status advanced to ${request.nextStatus}`,
    };

    const updated: DeliveryDetails = {
      ...current,
      status: request.nextStatus,
      statusHistory: [newHistoryItem, ...current.statusHistory],
    };

    this.deliveries[index] = updated;

    // Prepend to recent updates
    this.updates.unshift({
      id: `u-${Date.now()}`,
      trackingNumber: updated.trackingNumber,
      recipientName: updated.recipientName,
      status: updated.status,
      timestamp: 'Just now',
      location: updated.city,
    });

    return { ...updated };
  }

  async confirmDelivery(
    trackingNumber: string,
    request: DeliveryConfirmationRequest
  ): Promise<DeliveryDetails> {
    await this.delay();
    const index = this.deliveries.findIndex(
      (d) => d.trackingNumber.toUpperCase() === trackingNumber.toUpperCase()
    );

    if (index === -1) {
      throw new Error(`Parcel ${trackingNumber} not found.`);
    }

    const current = this.deliveries[index];
    const proof = {
      id: `p-${Date.now()}`,
      proofType: 'RECIPIENT_CONFIRMATION',
      recipientSignName: request.recipientSignName,
      deliveryNotes: request.deliveryNotes,
      capturedAt: 'Just now',
    };

    const newHistoryItem = {
      id: `h-${Date.now()}`,
      fromStatus: current.status,
      toStatus: 'DELIVERED' as const,
      changedBy: this.profile.fullName,
      timestamp: 'Just now',
      notes: `Delivered to ${request.recipientSignName}. ${request.deliveryNotes || ''}`,
    };

    const updated: DeliveryDetails = {
      ...current,
      status: 'DELIVERED',
      proof,
      statusHistory: [newHistoryItem, ...current.statusHistory],
    };

    this.deliveries[index] = updated;

    this.updates.unshift({
      id: `u-${Date.now()}`,
      trackingNumber: updated.trackingNumber,
      recipientName: updated.recipientName,
      status: 'DELIVERED',
      timestamp: 'Just now',
      location: updated.city,
    });

    return { ...updated };
  }

  async reportFailure(
    trackingNumber: string,
    request: DeliveryFailureRequest
  ): Promise<DeliveryDetails> {
    await this.delay();
    const index = this.deliveries.findIndex(
      (d) => d.trackingNumber.toUpperCase() === trackingNumber.toUpperCase()
    );

    if (index === -1) {
      throw new Error(`Parcel ${trackingNumber} not found.`);
    }

    const current = this.deliveries[index];
    const failure = {
      id: `f-${Date.now()}`,
      failureReason: request.failureReason,
      failureRemarks: request.failureRemarks,
      reportedAt: 'Just now',
    };

    const newHistoryItem = {
      id: `h-${Date.now()}`,
      fromStatus: current.status,
      toStatus: 'FAILED' as const,
      changedBy: this.profile.fullName,
      timestamp: 'Just now',
      notes: `Delivery failed: ${request.failureReason}. ${request.failureRemarks}`,
    };

    const updated: DeliveryDetails = {
      ...current,
      status: 'FAILED',
      failure,
      statusHistory: [newHistoryItem, ...current.statusHistory],
    };

    this.deliveries[index] = updated;

    this.updates.unshift({
      id: `u-${Date.now()}`,
      trackingNumber: updated.trackingNumber,
      recipientName: updated.recipientName,
      status: 'FAILED',
      timestamp: 'Just now',
      location: updated.city,
    });

    return { ...updated };
  }
}

// Export singleton instance of CourierDataService
export const courierService: CourierDataService = new MockCourierDataServiceImpl();
