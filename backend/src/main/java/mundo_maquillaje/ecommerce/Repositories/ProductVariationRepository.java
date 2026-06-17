package mundo_maquillaje.ecommerce.Repositories;

import jakarta.persistence.LockModeType;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariationRepository extends JpaRepository<ProductVariation, UUID> {
    @Query("SELECT v FROM ProductVariation v WHERE v.product.id = :productId AND v.isActive = true ORDER BY v.createdAt ASC")
    List<ProductVariation> findByProductId(@Param("productId") UUID productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariation v WHERE v.id = :id")
    Optional<ProductVariation> findByIdWithLock(UUID id);

    @Query("""
        SELECT p.name, v.name, v.attributeName, v.attributeValue, v.sku, v.stock, COALESCE(v.alertQuantity, 5), v.price, c.code, c.symbol, v.isActive
        FROM ProductVariation v
        JOIN v.product p
        JOIN p.currency c
        ORDER BY p.name, v.name
        """)
    List<Object[]> findStockReportAll();

    @Query("""
        SELECT p.name, v.name, v.attributeName, v.attributeValue, v.sku, v.stock, COALESCE(v.alertQuantity, 5), v.price, c.code, c.symbol, v.isActive
        FROM ProductVariation v
        JOIN v.product p
        JOIN p.currency c
        WHERE c.code = :currencyCode
        ORDER BY p.name, v.name
        """)
    List<Object[]> findStockReportByCurrency(@Param("currencyCode") String currencyCode);
}
