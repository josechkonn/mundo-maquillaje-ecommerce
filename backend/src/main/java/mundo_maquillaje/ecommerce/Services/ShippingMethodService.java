package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.ShippingMethod;
import mundo_maquillaje.ecommerce.Repositories.ShippingMethodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShippingMethodService {

    private final ShippingMethodRepository shippingMethodRepository;

    public List<ShippingMethod> getAllShippingMethods() {
        return shippingMethodRepository.findAll();
    }

    public ShippingMethod getShippingMethodById(UUID id) {
        return shippingMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Método de envío no encontrado"));
    }

    @Transactional
    public ShippingMethod createShippingMethod(ShippingMethod shippingMethod) {
        return shippingMethodRepository.save(shippingMethod);
    }

    @Transactional
    public ShippingMethod updateShippingMethod(UUID id, ShippingMethod updated) {
        ShippingMethod existing = getShippingMethodById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setFreeShippingThreshold(updated.getFreeShippingThreshold());
        existing.setIsActive(updated.getIsActive());
        existing.setIsCod(updated.getIsCod());
        return shippingMethodRepository.save(existing);
    }

    @Transactional
    public void deleteShippingMethod(UUID id) {
        shippingMethodRepository.deleteById(id);
    }
}
