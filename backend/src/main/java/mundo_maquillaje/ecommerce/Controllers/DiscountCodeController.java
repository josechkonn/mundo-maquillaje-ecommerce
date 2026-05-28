package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.DiscountCode;
import mundo_maquillaje.ecommerce.Services.DiscountCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/discount-codes")
@RequiredArgsConstructor
public class DiscountCodeController {

    private final DiscountCodeService discountCodeService;

    @GetMapping
    public List<DiscountCode> getAllDiscountCodes() {
        return discountCodeService.getAllDiscountCodes();
    }

    @PostMapping
    public ResponseEntity<DiscountCode> createDiscountCode(@RequestBody DiscountCode discountCode) {
        return ResponseEntity.ok(discountCodeService.createDiscountCode(discountCode));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountCode> updateDiscountCode(@PathVariable UUID id, @RequestBody DiscountCode discountCode) {
        return ResponseEntity.ok(discountCodeService.updateDiscountCode(id, discountCode));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscountCode(@PathVariable UUID id) {
        discountCodeService.deleteDiscountCode(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint público para validar un código de descuento.
     * Recibe { code, subtotal, currencyCode } y devuelve el resultado de validación.
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateDiscountCode(@RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        Double subtotal = payload.get("subtotal") instanceof Integer
                ? ((Integer) payload.get("subtotal")).doubleValue()
                : ((Number) payload.get("subtotal")).doubleValue();
        String currencyCode = payload.get("currencyCode") != null ? payload.get("currencyCode").toString() : null;

        Map<String, Object> result = discountCodeService.validateDiscountCode(code, subtotal, currencyCode);
        return ResponseEntity.ok(result);
    }
}
