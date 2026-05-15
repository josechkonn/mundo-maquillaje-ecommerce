package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, UUID> {
    List<ShippingMethod> findByIsActiveTrue();
}
