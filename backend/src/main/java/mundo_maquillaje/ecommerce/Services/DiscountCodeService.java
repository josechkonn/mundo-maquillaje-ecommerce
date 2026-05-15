package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.DiscountCode;
import mundo_maquillaje.ecommerce.Models.DiscountType;
import mundo_maquillaje.ecommerce.Repositories.DiscountCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiscountCodeService {

    private final DiscountCodeRepository discountCodeRepository;

    public List<DiscountCode> getAllDiscountCodes() {
        return discountCodeRepository.findAll();
    }

    public DiscountCode getDiscountCodeById(UUID id) {
        return discountCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Código de descuento no encontrado"));
    }

    @Transactional
    public DiscountCode createDiscountCode(DiscountCode discountCode) {
        // Forzar el código a mayúsculas
        discountCode.setCode(discountCode.getCode().toUpperCase().trim());
        return discountCodeRepository.save(discountCode);
    }

    @Transactional
    public DiscountCode updateDiscountCode(UUID id, DiscountCode updated) {
        DiscountCode existing = getDiscountCodeById(id);
        existing.setCode(updated.getCode().toUpperCase().trim());
        existing.setType(updated.getType());
        existing.setValue(updated.getValue());
        existing.setCurrency(updated.getCurrency());
        existing.setMinPurchase(updated.getMinPurchase());
        existing.setMaxDiscount(updated.getMaxDiscount());
        existing.setUsageLimit(updated.getUsageLimit());
        existing.setStartsAt(updated.getStartsAt());
        existing.setExpiresAt(updated.getExpiresAt());
        existing.setIsActive(updated.getIsActive());
        return discountCodeRepository.save(existing);
    }

    @Transactional
    public void deleteDiscountCode(UUID id) {
        discountCodeRepository.deleteById(id);
    }

    /**
     * Valida un código de descuento y calcula el monto del descuento.
     * El subtotal viene en moneda base (plano, sin conversión).
     */
    public Map<String, Object> validateDiscountCode(String code, Double subtotal) {
        Map<String, Object> result = new HashMap<>();

        DiscountCode discount = discountCodeRepository.findByCodeIgnoreCase(code.trim())
                .orElse(null);

        if (discount == null) {
            result.put("valid", false);
            result.put("message", "El código no existe");
            return result;
        }

        if (!discount.getIsActive()) {
            result.put("valid", false);
            result.put("message", "Este código está desactivado");
            return result;
        }

        LocalDateTime now = LocalDateTime.now();
        if (discount.getStartsAt() != null && now.isBefore(discount.getStartsAt())) {
            result.put("valid", false);
            result.put("message", "Este código aún no es válido");
            return result;
        }

        if (discount.getExpiresAt() != null && now.isAfter(discount.getExpiresAt())) {
            result.put("valid", false);
            result.put("message", "Este código ha expirado");
            return result;
        }

        if (discount.getUsageLimit() != null && discount.getTimesUsed() >= discount.getUsageLimit()) {
            result.put("valid", false);
            result.put("message", "Este código ha alcanzado su límite de usos");
            return result;
        }

        if (discount.getMinPurchase() != null && subtotal < discount.getMinPurchase()) {
            result.put("valid", false);
            result.put("message", "El monto mínimo de compra es " + discount.getMinPurchase());
            return result;
        }

        // Calcular el monto del descuento
        double discountAmount;
        if (discount.getType() == DiscountType.PERCENTAGE) {
            discountAmount = subtotal * (discount.getValue() / 100.0);
            // Aplicar tope máximo si existe
            if (discount.getMaxDiscount() != null && discountAmount > discount.getMaxDiscount()) {
                discountAmount = discount.getMaxDiscount();
            }
        } else {
            // FLAT_AMOUNT: el valor es el monto directo del descuento
            discountAmount = discount.getValue();
        }

        // Nunca descontar más que el subtotal
        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }

        result.put("valid", true);
        result.put("discountId", discount.getId().toString());
        result.put("code", discount.getCode());
        result.put("type", discount.getType().name());
        result.put("value", discount.getValue());
        result.put("discountAmount", discountAmount);
        result.put("message", "Código aplicado correctamente");

        return result;
    }
}
