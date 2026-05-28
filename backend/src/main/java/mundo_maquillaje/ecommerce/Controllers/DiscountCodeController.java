package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.DiscountCode;
import mundo_maquillaje.ecommerce.Services.DiscountCodeService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/discount-codes")
@RequiredArgsConstructor
public class DiscountCodeController {

    private final DiscountCodeService discountCodeService;
    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getAllDiscountCodes(Authentication authentication) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can view discount codes");
        }
        return ResponseEntity.ok(discountCodeService.getAllDiscountCodes());
    }

    @PostMapping
    public ResponseEntity<?> createDiscountCode(Authentication authentication, @RequestBody DiscountCode discountCode) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can create discount codes");
        }
        return ResponseEntity.ok(discountCodeService.createDiscountCode(discountCode));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiscountCode(Authentication authentication, @PathVariable UUID id, @RequestBody DiscountCode discountCode) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can update discount codes");
        }
        return ResponseEntity.ok(discountCodeService.updateDiscountCode(id, discountCode));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiscountCode(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can delete discount codes");
        }
        discountCodeService.deleteDiscountCode(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint público para validar un código de descuento.
     * Recibe { code, subtotal, currencyCode } y devuelve el resultado de validación.
     * Si el usuario está autenticado, se verifica el límite de usos por usuario.
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateDiscountCode(Authentication authentication, @RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        Double subtotal = payload.get("subtotal") instanceof Integer
                ? ((Integer) payload.get("subtotal")).doubleValue()
                : ((Number) payload.get("subtotal")).doubleValue();
        String currencyCode = payload.get("currencyCode") != null ? payload.get("currencyCode").toString() : null;

        UUID userId = null;
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof Jwt jwt) {
            userId = UUID.fromString(jwt.getSubject());
        }

        Map<String, Object> result = discountCodeService.validateDiscountCode(code, subtotal, currencyCode, userId);
        return ResponseEntity.ok(result);
    }
}
