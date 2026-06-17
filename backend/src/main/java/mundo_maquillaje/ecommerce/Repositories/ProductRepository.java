package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>,
              org.springframework.data.jpa.repository.JpaSpecificationExecutor<Product> {
        
       @EntityGraph(attributePaths = { "category", "category.parent", "brand", "currency", "variations" })
       @Query("SELECT DISTINCT p FROM Product p")
       Page<Product> findAllWithGraph(Pageable pageable);

       @Override
       @EntityGraph(attributePaths = { "category", "category.parent", "brand", "currency", "variations" })
       Page<Product> findAll(org.springframework.data.jpa.domain.Specification<Product> spec, Pageable pageable);

         @EntityGraph(attributePaths = { "category", "category.parent", "brand", "currency", "variations" })
         @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true " +
                "AND EXISTS (SELECT 1 FROM ProductVariation v WHERE v.product.id = p.id AND v.isActive = true)")
         Page<Product> findByCategoryId(@Param("categoryId") UUID categoryId, Pageable pageable);

         @EntityGraph(attributePaths = { "category", "category.parent", "brand", "currency", "variations" })
         @Query("SELECT p FROM Product p WHERE p.category.parent.id = :parentId AND p.isActive = true " +
                "AND EXISTS (SELECT 1 FROM ProductVariation v WHERE v.product.id = p.id AND v.isActive = true)")
         Page<Product> findByCategoryParentId(@Param("parentId") UUID parentId, Pageable pageable);

         @Query("SELECT p FROM Product p WHERE p.slug = :slug AND p.isActive = true " +
                "AND EXISTS (SELECT 1 FROM ProductVariation v WHERE v.product.id = p.id AND v.isActive = true)")
         Optional<Product> findBySlug(@Param("slug") String slug);

         @EntityGraph(attributePaths = { "category", "category.parent", "brand", "currency", "variations" })
         @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p FROM Product p JOIN p.variations v WHERE " +
                   "p.isActive = true AND v.isActive = true AND " +
                   "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(v.sku) LIKE LOWER(CONCAT('%', :query, '%')))")
         Page<Product> searchProducts(@org.springframework.data.repository.query.Param("query") String query,
                   Pageable pageable);

         @EntityGraph(attributePaths = { "category", "brand", "currency", "variations" })
         @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p FROM Product p JOIN p.variations v WHERE " +
                   "p.isActive = true AND v.isActive = true AND " +
                   "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(v.sku) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
                   "(:lastId IS NULL OR p.id > :lastId) " +
                   "ORDER BY p.id ASC")
         List<Product> findNextProducts(@org.springframework.data.repository.query.Param("query") String query,
                   @org.springframework.data.repository.query.Param("lastId") UUID lastId,
                   Pageable pageable);

       @org.springframework.data.jpa.repository.Query(value = "SELECT exchange_rate FROM currencies WHERE code = :code", nativeQuery = true)
       Double findExchangeRateByCode(@org.springframework.data.repository.query.Param("code") String code);

        @org.springframework.data.jpa.repository.Query(value = "SELECT " +
                       "MIN(CASE " +
                       "  WHEN c.exchange_rate = 1 THEN v.price " +
                       "  WHEN UPPER(c.code) IN ('VES', 'BS', 'VEF') THEN v.price / c.exchange_rate " +
                       "  WHEN UPPER(c.code) = 'COP' THEN v.price / (c.exchange_rate * (SELECT exchange_rate FROM currencies WHERE UPPER(code) IN ('VES', 'BS', 'VEF') LIMIT 1)) " +
                       "  ELSE v.price / c.exchange_rate " +
                       "END), " +
                       "MAX(CASE " +
                       "  WHEN c.exchange_rate = 1 THEN v.price " +
                       "  WHEN UPPER(c.code) IN ('VES', 'BS', 'VEF') THEN v.price / c.exchange_rate " +
                       "  WHEN UPPER(c.code) = 'COP' THEN v.price / (c.exchange_rate * (SELECT exchange_rate FROM currencies WHERE UPPER(code) IN ('VES', 'BS', 'VEF') LIMIT 1)) " +
                       "  ELSE v.price / c.exchange_rate " +
                       "END) " +
                        "FROM products_variations v " +
                        "JOIN products p ON v.id_product = p.id " +
                        "JOIN currencies c ON p.id_currency = c.id " +
                         "WHERE p.is_active = true AND v.is_active = true", nativeQuery = true)
          List<Object[]> getMinMaxPrices();

          @org.springframework.data.jpa.repository.Query(value = 
                        "SELECT p.id FROM products p " +
                        "INNER JOIN products_variations pv ON pv.id_product = p.id " +
                        "INNER JOIN order_products op ON op.id_variation = pv.id " +
                        "INNER JOIN orders o ON o.id = op.id_order " +
                        "WHERE p.is_active = true AND pv.is_active = true " +
                       "AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED') " +
                       "GROUP BY p.id " +
                       "ORDER BY SUM(op.quantity) DESC",
                       nativeQuery = true)
         List<java.util.UUID> findBestSellerIds(org.springframework.data.domain.Pageable pageable);

         @EntityGraph(attributePaths = { "category", "category.parent", "brand", "currency", "variations" })
         @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.id IN :ids")
         List<Product> findByIdsInWithGraph(@org.springframework.data.repository.query.Param("ids") List<java.util.UUID> ids);
}
