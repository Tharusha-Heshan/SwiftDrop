package com.swiftdrop.backend.courier.controller;

import com.swiftdrop.backend.courier.entity.CourierProfile;
import com.swiftdrop.backend.courier.entity.DeliveryFailureReason;
import com.swiftdrop.backend.courier.service.CourierService;
import com.swiftdrop.backend.customer.entity.AddressType;
import com.swiftdrop.backend.customer.entity.Customer;
import com.swiftdrop.backend.customer.entity.Delivery;
import com.swiftdrop.backend.customer.entity.DeliveryAddress;
import com.swiftdrop.backend.customer.entity.DeliveryStatus;
import com.swiftdrop.backend.customer.entity.DeliveryType;
import com.swiftdrop.backend.customer.entity.Parcel;
import com.swiftdrop.backend.customer.entity.TrackingEvent;
import com.swiftdrop.backend.identity.AppUser;
import com.swiftdrop.backend.identity.TestPeople;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CourierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager em;

    private AppUser courier1;
    private AppUser courier2;
    private AppUser customerUser;
    private Customer customer;
    private Delivery delivery1;

    private static RequestPostProcessor courierToken(UUID userId) {
        return jwt().jwt(token -> token.subject(userId.toString()).claim("name", "Test Courier")
                        .claim("roles", List.of("COURIER")))
                .authorities(new SimpleGrantedAuthority("ROLE_COURIER"),
                        new SimpleGrantedAuthority("delivery:read-own"),
                        new SimpleGrantedAuthority("delivery:update-status"));
    }

    private static RequestPostProcessor customerToken(UUID userId) {
        return jwt().jwt(token -> token.subject(userId.toString()).claim("name", "Test Customer")
                        .claim("roles", List.of("CUSTOMER")))
                .authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"),
                        new SimpleGrantedAuthority("parcel:read-own"),
                        new SimpleGrantedAuthority("parcel:create"));
    }

    @BeforeEach
    void setUp() {
        courier1 = TestPeople.saved(em, "Sachin Silva", "COURIER");
        courier2 = TestPeople.saved(em, "Nimal Perera", "COURIER");
        customerUser = TestPeople.saved(em, "Alice Fernando", "CUSTOMER");

        CourierProfile profile1 = new CourierProfile(courier1, "+94771234567", "MOTORCYCLE", "Colombo Central");
        em.persist(profile1);

        customer = new Customer(customerUser, "Alice", "Fernando", "alice@example.com", "0771234567");
        em.persist(customer);

        DeliveryAddress pickup = new DeliveryAddress(AddressType.PICKUP, "Sender Alice", "0771111111", "10 Galle Rd", "Colombo", "Colombo", "00300");
        DeliveryAddress dest = new DeliveryAddress(AddressType.DESTINATION, "Recipient Bob", "0772222222", "45 Havelock Rd", "Colombo", "Colombo", "00500");

        delivery1 = new Delivery(customer, "SD-20261108-001", "tok-001", DeliveryType.EXPRESS);
        delivery1.assignCourier(courier1);
        delivery1.setAddress(pickup);
        delivery1.setAddress(dest);
        delivery1.addParcel(new Parcel("Documents", new BigDecimal("0.5"), new BigDecimal("30"), new BigDecimal("20"), new BigDecimal("2")));
        delivery1.addTrackingEvent(new TrackingEvent(DeliveryStatus.PICKED_UP, "Package picked up by courier", "Colombo Hub", Instant.now(), courier1));
        em.persist(delivery1);

        em.flush();
    }

    @Test
    @DisplayName("1. Unauthenticated request is rejected with 401 Unauthorized")
    void unauthenticatedRequestIsRejected() throws Exception {
        mockMvc.perform(get("/api/courier/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. Non-courier access is rejected with 403 Forbidden")
    void nonCourierAccessIsRejected() throws Exception {
        mockMvc.perform(get("/api/courier/dashboard").with(customerToken(customerUser.getId())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. Valid courier retrieves dashboard statistics successfully")
    void validCourierDashboardAccess() throws Exception {
        mockMvc.perform(get("/api/courier/dashboard").with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedToday").isNumber())
                .andExpect(jsonPath("$.inProgress").value(1))
                .andExpect(jsonPath("$.delivered").value(0))
                .andExpect(jsonPath("$.failed").value(0));
    }

    @Test
    @DisplayName("4. Courier retrieves operational profile")
    void validCourierProfileAccess() throws Exception {
        mockMvc.perform(get("/api/courier/profile").with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleType").value("MOTORCYCLE"))
                .andExpect(jsonPath("$.assignedZone").value("Colombo Central"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("5. Courier retrieves assigned deliveries list with pagination")
    void courierOwnedDeliveriesListRetrieval() throws Exception {
        mockMvc.perform(get("/api/courier/deliveries")
                        .param("page", "0")
                        .param("size", "10")
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].trackingNumber").value("SD-20261108-001"))
                .andExpect(jsonPath("$.content[0].recipientName").value("Recipient Bob"))
                .andExpect(jsonPath("$.content[0].status").value("PICKED_UP"));
    }

    @Test
    @DisplayName("6. Courier retrieves individual delivery details")
    void courierDeliveryDetailRetrieval() throws Exception {
        mockMvc.perform(get("/api/courier/deliveries/" + delivery1.getTrackingNumber())
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trackingNumber").value("SD-20261108-001"))
                .andExpect(jsonPath("$.status").value("PICKED_UP"))
                .andExpect(jsonPath("$.statusHistory", hasSize(1)));
    }

    @Test
    @DisplayName("7. Cross-courier delivery detail access is rejected with 403 Forbidden")
    void crossCourierDeliveryAccessIsRejected() throws Exception {
        mockMvc.perform(get("/api/courier/deliveries/" + delivery1.getTrackingNumber())
                        .with(courierToken(courier2.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail", org.hamcrest.Matchers.containsString("not authorized")));
    }

    @Test
    @DisplayName("8. Cross-courier status update is rejected with 403 Forbidden")
    void crossCourierStatusUpdateIsRejected() throws Exception {
        String payload = """
                {
                    "nextStatus": "IN_TRANSIT",
                    "location": "Colombo 04",
                    "notes": "Attempting unauthorized status update"
                }
                """;

        mockMvc.perform(patch("/api/courier/deliveries/" + delivery1.getTrackingNumber() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(courierToken(courier2.getId())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("9. Valid delivery status transition (PICKED_UP -> IN_TRANSIT)")
    void validDeliveryStatusUpdate() throws Exception {
        String payload = """
                {
                    "nextStatus": "IN_TRANSIT",
                    "location": "Bambalapitiya Junction",
                    "notes": "On courier motorcycle"
                }
                """;

        mockMvc.perform(patch("/api/courier/deliveries/" + delivery1.getTrackingNumber() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_TRANSIT"))
                .andExpect(jsonPath("$.statusHistory", hasSize(2)));
    }

    @Test
    @DisplayName("10. Invalid status transition is rejected with 409 Conflict")
    void invalidStatusTransitionIsRejected() throws Exception {
        // Direct transition from PICKED_UP to DELIVERED is not allowed
        String payload = """
                {
                    "nextStatus": "DELIVERED",
                    "location": "Destination",
                    "notes": "Skipping intermediate transit"
                }
                """;

        mockMvc.perform(patch("/api/courier/deliveries/" + delivery1.getTrackingNumber() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").exists());
    }

    @Test
    @DisplayName("11. Successful delivery confirmation with proof of delivery")
    void successfulDeliveryConfirmation() throws Exception {
        // Advance to OUT_FOR_DELIVERY first
        delivery1.addTrackingEvent(new TrackingEvent(DeliveryStatus.IN_TRANSIT, "In transit", "Colombo Hub", Instant.now().minusSeconds(120), courier1));
        delivery1.addTrackingEvent(new TrackingEvent(DeliveryStatus.OUT_FOR_DELIVERY, "Out for delivery", "Colombo 05", Instant.now(), courier1));
        em.flush();

        String payload = """
                {
                    "recipientSignName": "Recipient Bob",
                    "proofType": "RECIPIENT_CONFIRMATION",
                    "deliveryNotes": "Signed and received at gate",
                    "proofMediaUrl": "https://storage.swiftdrop.com/proofs/test.jpg",
                    "location": "45 Havelock Rd"
                }
                """;

        mockMvc.perform(post("/api/courier/deliveries/" + delivery1.getTrackingNumber() + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.proof.recipientSignName").value("Recipient Bob"))
                .andExpect(jsonPath("$.proof.deliveryNotes").value("Signed and received at gate"));
    }

    @Test
    @DisplayName("12. Delivery failure reporting with reason and remarks")
    void deliveryFailureReporting() throws Exception {
        // Advance to OUT_FOR_DELIVERY first
        delivery1.addTrackingEvent(new TrackingEvent(DeliveryStatus.IN_TRANSIT, "In transit", "Colombo Hub", Instant.now().minusSeconds(120), courier1));
        delivery1.addTrackingEvent(new TrackingEvent(DeliveryStatus.OUT_FOR_DELIVERY, "Out for delivery", "Colombo 05", Instant.now(), courier1));
        em.flush();

        String payload = """
                {
                    "failureReason": "RECIPIENT_UNAVAILABLE",
                    "failureRemarks": "Gate locked, customer phone unanswered after 3 attempts",
                    "location": "45 Havelock Rd"
                }
                """;

        mockMvc.perform(post("/api/courier/deliveries/" + delivery1.getTrackingNumber() + "/fail")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FAILED"))
                .andExpect(jsonPath("$.latestFailure.failureReason").value("RECIPIENT_UNAVAILABLE"))
                .andExpect(jsonPath("$.latestFailure.failureRemarks").value("Gate locked, customer phone unanswered after 3 attempts"));
    }

    @Test
    @DisplayName("13. Missing delivery handling returns 404 Not Found")
    void missingDeliveryHandling() throws Exception {
        mockMvc.perform(get("/api/courier/deliveries/NON-EXISTENT-TRACKING-999")
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Delivery not found with tracking number: NON-EXISTENT-TRACKING-999"));
    }

    @Test
    @DisplayName("14. Request validation errors return 400 Bad Request with field errors")
    void requestValidationErrorsReturnBadRequest() throws Exception {
        // Empty payload for status update
        mockMvc.perform(patch("/api/courier/deliveries/" + delivery1.getTrackingNumber() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nextStatus").value("Next status is required"));

        // Blank recipientSignName for delivery confirmation
        mockMvc.perform(post("/api/courier/deliveries/" + delivery1.getTrackingNumber() + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"recipientSignName\":\"\"}")
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.recipientSignName").exists());

        // Missing failureReason for delivery failure
        mockMvc.perform(post("/api/courier/deliveries/" + delivery1.getTrackingNumber() + "/fail")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"failureRemarks\":\"\"}")
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.failureReason").value("Failure reason is required"));
    }

    @Test
    @DisplayName("15. Both path conventions (/api/courier and /api/couriers/me) are supported")
    void bothPathConventionsAreSupported() throws Exception {
        mockMvc.perform(get("/api/couriers/me/dashboard").with(courierToken(courier1.getId())))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/courier/dashboard").with(courierToken(courier1.getId())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("16. Courier provisions operational profile successfully")
    void courierProvisionsOperationalProfile() throws Exception {
        AppUser newCourier = TestPeople.saved(em, "Sunil Perera", "COURIER");
        em.flush();

        String payload = """
                {
                    "phoneNumber": "+94779998877",
                    "vehicleType": "VAN",
                    "assignedZone": "Kandy South"
                }
                """;

        mockMvc.perform(post("/api/couriers/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(courierToken(newCourier.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phoneNumber").value("+94779998877"))
                .andExpect(jsonPath("$.vehicleType").value("VAN"))
                .andExpect(jsonPath("$.assignedZone").value("Kandy South"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("17. Re-provisioning updates existing profile without duplicate records")
    void reProvisioningUpdatesExistingProfile() throws Exception {
        String updatePayload = """
                {
                    "phoneNumber": "+94770001122",
                    "vehicleType": "CAR",
                    "assignedZone": "Colombo North"
                }
                """;

        mockMvc.perform(post("/api/courier/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload)
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phoneNumber").value("+94770001122"))
                .andExpect(jsonPath("$.vehicleType").value("CAR"))
                .andExpect(jsonPath("$.assignedZone").value("Colombo North"));

        // Verify count remains 1 for courier1
        Long count = em.createQuery("SELECT count(c) FROM CourierProfile c WHERE c.user.id = :id", Long.class)
                .setParameter("id", courier1.getId())
                .getSingleResult();
        org.junit.jupiter.api.Assertions.assertEquals(1L, count);
    }

    @Test
    @DisplayName("18. Non-courier user attempting to provision courier profile is rejected")
    void nonCourierProvisioningIsRejected() throws Exception {
        String payload = """
                {
                    "phoneNumber": "+94771112233",
                    "vehicleType": "BICYCLE",
                    "assignedZone": "Galle"
                }
                """;

        mockMvc.perform(post("/api/courier/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload)
                        .with(customerToken(customerUser.getId())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("19. Eligible active couriers can be queried by Dispatcher")
    void queryEligibleCouriers() throws Exception {
        mockMvc.perform(get("/api/courier/eligible")
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(org.hamcrest.Matchers.greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("20. Eligible couriers can be filtered by operational zone")
    void queryEligibleCouriersFilteredByZone() throws Exception {
        mockMvc.perform(get("/api/couriers/me/eligible")
                        .param("zone", "Colombo Central")
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].assignedZone").value("Colombo Central"));

        // Zone with no couriers returns empty list
        mockMvc.perform(get("/api/couriers/me/eligible")
                        .param("zone", "NonExistentZone")
                        .with(courierToken(courier1.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(0)));
    }
}
