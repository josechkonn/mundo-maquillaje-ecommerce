package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrderProductRepository extends JpaRepository<OrderProduct, UUID> {
    List<OrderProduct> findByOrderIdIn(List<UUID> orderIds);
}
