package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {
    List<PaymentMethod> findByIsActiveTrueOrderByDisplayOrderAsc();
}
