package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.DiscountCode;
import mundo_maquillaje.ecommerce.Models.DiscountType;
import mundo_maquillaje.ecommerce.Repositories.CurrencyRepository;
import mundo_maquillaje.ecommerce.Repositories.DiscountCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiscountCodeService {

    private final DiscountCodeRepository discountCodeRepository;
    private final CurrencyRepository currencyRepository;

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
     * Convierte min_purchase y max_discount a la moneda del usuario antes de comparar.
     */
    public Map<String, Object> validateDiscountCode(String code, Double subtotal, String userCurrencyCode) {
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

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
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

        // Determinar la moneda de referencia del código (si no tiene, usar USD)
        Currency refCurrency = discount.getCurrency();
        if (refCurrency == null) {
            refCurrency = currencyRepository.findByCode("USD").orElse(null);
        }

        // Obtener la moneda del usuario
        Currency userCurrency = null;
        if (userCurrencyCode != null && !userCurrencyCode.trim().isEmpty()) {
            userCurrency = currencyRepository.findByCode(userCurrencyCode.trim().toUpperCase()).orElse(null);
        }

        // Convertir min_purchase a la moneda del usuario para comparar
        if (discount.getMinPurchase() != null) {
            double minPurchaseInUserCurrency = convertAmount(discount.getMinPurchase(), refCurrency, userCurrency);
            if (subtotal < minPurchaseInUserCurrency) {
                result.put("valid", false);
                result.put("message", "El monto mínimo de compra es " + formatAmount(minPurchaseInUserCurrency, userCurrency));
                return result;
            }
        }

        // Calcular el monto del descuento
        double discountAmount;
        if (discount.getType() == DiscountType.PERCENTAGE) {
            discountAmount = subtotal * (discount.getValue() / 100.0);
            // Aplicar tope máximo si existe (convertido a la moneda del usuario)
            if (discount.getMaxDiscount() != null) {
                double maxDiscountInUserCurrency = convertAmount(discount.getMaxDiscount(), refCurrency, userCurrency);
                if (discountAmount > maxDiscountInUserCurrency) {
                    discountAmount = maxDiscountInUserCurrency;
                }
            }
        } else {
            // FLAT_AMOUNT: convertir el valor a la moneda del usuario
            discountAmount = convertAmount(discount.getValue(), refCurrency, userCurrency);
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

    /**
     * Convierte un monto de una moneda origen a una destino.
     * Usa el sistema encadenado USD -> VES -> COP.
     */
    private double convertAmount(double amount, Currency sourceCurrency, Currency targetCurrency) {
        if (sourceCurrency == null || targetCurrency == null) return amount;
        if (sourceCurrency.getCode().equalsIgnoreCase(targetCurrency.getCode())) return amount;

        List<Currency> allCurrencies = currencyRepository.findAll();
        if (allCurrencies.isEmpty()) return amount;

        double rateVES = getRate("VES", allCurrencies);
        double rateCOP = getRate("COP", allCurrencies);

        String srcCode = sourceCurrency.getCode().toUpperCase().trim();
        String tgtCode = targetCurrency.getCode().toUpperCase().trim();

        if (srcCode.equals("USD")) {
            if (isVES(tgtCode)) return amount * rateVES;
            if (tgtCode.equals("COP")) return amount * rateVES * rateCOP;
        } else if (isVES(srcCode)) {
            if (tgtCode.equals("USD")) return amount / rateVES;
            if (tgtCode.equals("COP")) return amount * rateCOP;
        } else if (srcCode.equals("COP")) {
            if (tgtCode.equals("USD")) return amount / (rateVES * rateCOP);
            if (isVES(tgtCode)) return amount / rateCOP;
        } else {
            double baseValue = amount / (sourceCurrency.getExchangeRate() != null ? sourceCurrency.getExchangeRate() : 1);
            return baseValue * (targetCurrency.getExchangeRate() != null ? targetCurrency.getExchangeRate() : 1);
        }

        return amount;
    }

    private double getRate(String code, List<Currency> allCurrencies) {
        for (Currency c : allCurrencies) {
            String dbCode = c.getCode().toUpperCase().trim();
            if (dbCode.equals(code) ||
                (code.equals("VES") && (dbCode.equals("VEF") || dbCode.equals("BS") || dbCode.equals("VES")))) {
                return c.getExchangeRate() != null ? c.getExchangeRate() : 1;
            }
        }
        return 1;
    }

    private boolean isVES(String code) {
        return code.equals("VES") || code.equals("VEF") || code.equals("BS");
    }

    private String formatAmount(double amount, Currency currency) {
        if (currency == null) return String.valueOf(amount);
        return currency.getSymbol() + " " + String.format("%." + currency.getDecimalPlaces() + "f", amount);
    }
}
