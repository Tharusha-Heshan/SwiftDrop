package com.swiftdrop.backend.courier.controller;

import com.swiftdrop.backend.courier.dto.CourierDashboardResponse;
import com.swiftdrop.backend.courier.dto.CourierDeliveryDetailResponse;
import com.swiftdrop.backend.courier.dto.CourierDeliverySummaryResponse;
import com.swiftdrop.backend.courier.dto.CourierProfileResponse;
import com.swiftdrop.backend.courier.dto.CourierStatusUpdateRequest;
import com.swiftdrop.backend.courier.dto.DeliveryConfirmationRequest;
import com.swiftdrop.backend.courier.dto.DeliveryFailureRequest;
import com.swiftdrop.backend.courier.service.CourierService;
import com.swiftdrop.backend.customer.dto.PageResponse;
import com.swiftdrop.backend.customer.entity.DeliveryStatus;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Courier REST API for dashboard metrics, assigned deliveries, delivery execution, and profile.
 * All endpoints require the caller to possess the COURIER role or delivery permissions, and resolve
 * the authenticated courier ID directly from the validated JWT token subject.
 */
@RestController
@RequestMapping({"/api/courier", "/api/couriers/me"})
@PreAuthorize("hasRole('COURIER') or hasAuthority('delivery:read-own')")
public class CourierController {

    private final CourierService courierService;

    public CourierController(CourierService courierService) {
        this.courierService = courierService;
    }

    /**
     * Retrieves current authenticated courier's operational profile.
     */
    @GetMapping({"", "/profile"})
    public CourierProfileResponse getProfile(@AuthenticationPrincipal Jwt user) {
        return courierService.getProfile(CurrentUser.id(user));
    }

    /**
     * Retrieves today's operational summary statistics for the courier dashboard.
     */
    @GetMapping("/dashboard")
    public CourierDashboardResponse getDashboard(@AuthenticationPrincipal Jwt user) {
        return courierService.getDashboardStats(CurrentUser.id(user));
    }

    /**
     * Retrieves assigned deliveries with optional status filtering, search keyword, and pagination.
     */
    @GetMapping("/deliveries")
    public PageResponse<CourierDeliverySummaryResponse> getAssignedDeliveries(
            @RequestParam(required = false) DeliveryStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal Jwt user) {
        return courierService.getAssignedDeliveries(CurrentUser.id(user), status, search, PageRequest.of(page, size));
    }

    /**
     * Retrieves complete details of an assigned delivery including tracking timeline, proof, and failure history.
     */
    @GetMapping("/deliveries/{trackingNumber}")
    public CourierDeliveryDetailResponse getDeliveryDetails(
            @PathVariable String trackingNumber,
            @AuthenticationPrincipal Jwt user) {
        return courierService.getDeliveryDetails(CurrentUser.id(user), trackingNumber);
    }

    /**
     * Updates an assigned delivery's lifecycle status (e.g. PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY).
     * Supports both PATCH and PUT for HTTP client compatibility.
     */
    @RequestMapping(value = "/deliveries/{trackingNumber}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasRole('COURIER') or hasAuthority('delivery:update-status')")
    public CourierDeliveryDetailResponse updateDeliveryStatus(
            @PathVariable String trackingNumber,
            @Valid @RequestBody CourierStatusUpdateRequest request,
            @AuthenticationPrincipal Jwt user) {
        return courierService.updateDeliveryStatus(CurrentUser.id(user), trackingNumber, request);
    }

    /**
     * Confirms successful delivery with recipient signature and optional proof notes/media.
     */
    @PostMapping("/deliveries/{trackingNumber}/confirm")
    @PreAuthorize("hasRole('COURIER') or hasAuthority('delivery:update-status')")
    public CourierDeliveryDetailResponse confirmDelivery(
            @PathVariable String trackingNumber,
            @Valid @RequestBody DeliveryConfirmationRequest request,
            @AuthenticationPrincipal Jwt user) {
        return courierService.confirmDelivery(CurrentUser.id(user), trackingNumber, request);
    }

    /**
     * Records an unsuccessful delivery attempt with failure reason and remarks.
     */
    @PostMapping("/deliveries/{trackingNumber}/fail")
    @PreAuthorize("hasRole('COURIER') or hasAuthority('delivery:update-status')")
    public CourierDeliveryDetailResponse reportDeliveryFailure(
            @PathVariable String trackingNumber,
            @Valid @RequestBody DeliveryFailureRequest request,
            @AuthenticationPrincipal Jwt user) {
        return courierService.reportDeliveryFailure(CurrentUser.id(user), trackingNumber, request);
    }
}
