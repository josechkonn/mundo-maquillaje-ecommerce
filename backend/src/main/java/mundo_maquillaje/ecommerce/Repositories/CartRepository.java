package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findTopByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status);
    List<Cart> findAllByUserIdAndStatus(UUID userId, String status);
}
