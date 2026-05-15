package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.CartProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartProductRepository extends JpaRepository<CartProduct, UUID> {
    Optional<CartProduct> findByCartIdAndVariationId(UUID cartId, UUID variationId);
}
