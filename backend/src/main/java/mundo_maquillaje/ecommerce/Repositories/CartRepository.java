package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findTopByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status);
    List<Cart> findAllByUserIdAndStatus(UUID userId, String status);

    @Query("SELECT COUNT(DISTINCT c) FROM Cart c JOIN c.products p WHERE c.status = 'ACTIVE' AND c.createdAt BETWEEN :start AND :end")
    long countUnpaidCarts(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
