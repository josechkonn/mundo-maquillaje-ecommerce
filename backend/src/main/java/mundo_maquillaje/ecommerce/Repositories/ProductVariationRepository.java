package mundo_maquillaje.ecommerce.Repositories;

import jakarta.persistence.LockModeType;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariationRepository extends JpaRepository<ProductVariation, UUID> {
    List<ProductVariation> findByProductId(UUID productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariation v WHERE v.id = :id")
    Optional<ProductVariation> findByIdWithLock(UUID id);
}
