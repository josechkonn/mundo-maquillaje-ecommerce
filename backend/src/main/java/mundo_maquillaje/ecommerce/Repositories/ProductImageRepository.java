package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    List<ProductImage> findByVariationId(UUID variationId);
}
