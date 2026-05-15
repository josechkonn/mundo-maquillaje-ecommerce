package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Order;
import mundo_maquillaje.ecommerce.Models.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByProfileOrderByCreatedAtDesc(Profile profile);
}
