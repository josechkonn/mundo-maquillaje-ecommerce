package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Order;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Models.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByProfileOrderByCreatedAtDesc(Profile profile);
    
    Page<Order> findByProfile(Profile profile, Pageable pageable);

    Page<Order> findByProfileAndId(Profile profile, UUID id, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.profile = :profile AND " +
           "(LOWER(o.status) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.paymentMethod.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Order> findByProfileAndSearchFields(@Param("profile") Profile profile, @Param("search") String search, Pageable pageable);

    Page<Order> findByProfileAndStatus(Profile profile, OrderStatus status, Pageable pageable);

    Page<Order> findByProfileAndStatusAndId(Profile profile, OrderStatus status, UUID id, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.profile = :profile AND o.status = :status AND " +
           "(LOWER(o.paymentMethod.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Order> findByProfileAndStatusAndSearchFields(@Param("profile") Profile profile, @Param("status") OrderStatus status, @Param("search") String search, Pageable pageable);

    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
