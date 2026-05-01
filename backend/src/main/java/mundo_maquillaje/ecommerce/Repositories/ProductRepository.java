package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    @EntityGraph(attributePaths = {"category", "brand", "currency"})
    Page<Product> findAll(Pageable pageable);

    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySku(String sku);
}
