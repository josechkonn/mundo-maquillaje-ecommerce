package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiscountCodeRepository extends JpaRepository<DiscountCode, UUID> {
    Optional<DiscountCode> findByCodeIgnoreCase(String code);
}
