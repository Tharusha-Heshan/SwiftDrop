package com.swiftdrop.backend.courier.repository;

import com.swiftdrop.backend.courier.entity.CourierProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourierProfileRepository extends JpaRepository<CourierProfile, Long> {

    /** Finds the courier profile by the associated AppUser authentication UUID. */
    @Query("SELECT c FROM CourierProfile c WHERE c.user.id = :userId")
    Optional<CourierProfile> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT count(c) > 0 FROM CourierProfile c WHERE c.user.id = :userId")
    boolean existsByUserId(@Param("userId") UUID userId);

    /** All currently active couriers in the system. */
    List<CourierProfile> findByActiveTrue();

    Page<CourierProfile> findByActiveTrue(Pageable pageable);

    /** Couriers active in a specific delivery zone (used by Dispatcher for assignments). */
    List<CourierProfile> findByAssignedZoneIgnoreCaseAndActiveTrue(String assignedZone);
}
