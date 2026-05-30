package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Order;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Models.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {
    List<Order> findByProfileOrderByCreatedAtDesc(Profile profile);
    
    Page<Order> findByProfile(Profile profile, Pageable pageable);

    Page<Order> findByProfileAndId(Profile profile, UUID id, Pageable pageable);

    Optional<Order> findByIdAndProfile(UUID id, Profile profile);

    @EntityGraph(attributePaths = {"paymentMethod", "paymentMethod.currency", "currency", "shippingAddress"})
    @Query("SELECT o FROM Order o WHERE o.id = :id AND o.profile = :profile")
    Optional<Order> findByIdAndProfileWithDetails(@Param("id") UUID id, @Param("profile") Profile profile);

    @Query("SELECT o FROM Order o WHERE o.profile = :profile AND " +
           "(LOWER(o.status) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.paymentMethod.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Order> findByProfileAndSearchFields(@Param("profile") Profile profile, @Param("search") String search, Pageable pageable);

    Page<Order> findByProfileAndStatus(Profile profile, OrderStatus status, Pageable pageable);

    Page<Order> findByProfileAndStatusAndId(Profile profile, OrderStatus status, UUID id, Pageable pageable);

    @EntityGraph(attributePaths = {"paymentMethod", "paymentMethod.currency", "currency", "shippingAddress"})
    @Override
    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o JOIN o.currency c WHERE c.code = :currencyCode AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED') AND o.createdAt BETWEEN :start AND :end")
    double sumSalesByCurrencyAndDate(@Param("currencyCode") String currencyCode, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("SELECT COALESCE(SUM(op.subtotal), 0) FROM OrderProduct op JOIN op.order o JOIN o.currency c WHERE c.code = :currencyCode AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED') AND o.createdAt BETWEEN :start AND :end")
    double sumOrderProductsByCurrencyAndDate(@Param("currencyCode") String currencyCode, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    long countOrdersByDate(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("""
        SELECT cat.name, COALESCE(SUM(op.subtotal), 0)
        FROM OrderProduct op
        JOIN op.order o
        JOIN o.currency c
        JOIN op.variation pv
        JOIN pv.product p
        JOIN p.category cat
        WHERE c.code = :currencyCode
          AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o.createdAt BETWEEN :start AND :end
        GROUP BY cat.name
        ORDER BY SUM(op.subtotal) DESC
        """)
    List<Object[]> findTopCategoriesByCurrency(@Param("currencyCode") String currencyCode, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("""
        SELECT DATE(o.createdAt) as date, COALESCE(SUM(o.totalAmount), 0) as revenue
        FROM Order o JOIN o.currency c
        WHERE c.code = :currencyCode
          AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o.createdAt BETWEEN :start AND :end
        GROUP BY DATE(o.createdAt)
        ORDER BY date
        """)
    List<Object[]> findRevenueOverTime(@Param("currencyCode") String currencyCode, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    @Query("""
        SELECT DATE(o.createdAt) as date, COUNT(o) as orders
        FROM Order o JOIN o.currency c
        WHERE c.code = :currencyCode
          AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o.createdAt BETWEEN :start AND :end
        GROUP BY DATE(o.createdAt)
        ORDER BY date
        """)
    List<Object[]> findOrdersOverTime(@Param("currencyCode") String currencyCode, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
