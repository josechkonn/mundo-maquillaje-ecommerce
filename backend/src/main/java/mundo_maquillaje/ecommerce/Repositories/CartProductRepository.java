package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.CartProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CartProductRepository extends JpaRepository<CartProduct, UUID> {
    List<CartProduct> findAllByCartIdAndVariationId(UUID cartId, UUID variationId);
    List<CartProduct> findAllByVariationIdIn(List<UUID> variationIds);
    void deleteAllByVariationIdIn(List<UUID> variationIds);
}
