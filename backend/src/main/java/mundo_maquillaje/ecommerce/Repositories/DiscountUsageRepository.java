package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.DiscountUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DiscountUsageRepository extends JpaRepository<DiscountUsage, UUID> {

    int countByDiscountCodeIdAndProfileId(UUID discountCodeId, UUID profileId);
}
