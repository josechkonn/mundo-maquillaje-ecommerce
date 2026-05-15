package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.OrderDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface OrderDirectionRepository extends JpaRepository<OrderDirection, UUID> {
}
