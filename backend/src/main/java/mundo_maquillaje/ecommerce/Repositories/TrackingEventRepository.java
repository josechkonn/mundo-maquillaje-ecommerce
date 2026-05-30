package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public interface TrackingEventRepository extends JpaRepository<TrackingEvent, UUID> {

    @Query("SELECT COUNT(DISTINCT t.ipAddress) FROM TrackingEvent t WHERE t.eventType = 'PAGE_VIEW' AND t.createdAt BETWEEN :start AND :end")
    long countUniqueVisitors(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT t.eventType, COUNT(t) FROM TrackingEvent t WHERE t.eventType IN ('PRODUCT_VIEW', 'ADD_TO_CART', 'CHECKOUT_START', 'PURCHASE') AND t.createdAt BETWEEN :start AND :end GROUP BY t.eventType")
    List<Object[]> countConversionEvents(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(t) FROM TrackingEvent t WHERE t.eventType = 'PRODUCT_VIEW' AND t.productId = :productId AND t.createdAt BETWEEN :start AND :end")
    long countProductViews(@Param("productId") UUID productId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
