package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface OrderProductRepository extends JpaRepository<OrderProduct, UUID> {
    List<OrderProduct> findByOrderIdIn(List<UUID> orderIds);

    @Query("SELECT op FROM OrderProduct op LEFT JOIN FETCH op.variation v LEFT JOIN FETCH v.images WHERE op.id = :id")
    OrderProduct findByIdWithVariationAndImages(@Param("id") UUID id);

    @Query("UPDATE OrderProduct op SET op.variation = NULL WHERE op.variation.id IN :variationIds")
    @Modifying
    void detachVariationsByIds(@Param("variationIds") List<UUID> variationIds);
}
