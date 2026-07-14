package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.ProductCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CollectionRepository extends JpaRepository<ProductCollection, UUID> {
    List<ProductCollection> findAllByIsActiveOrderByDisplayOrderAsc(Boolean isActive);
    void deleteAllByProductId(UUID productId);
}
