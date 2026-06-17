package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.CartItemDTO;
import mundo_maquillaje.ecommerce.Services.CartService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final ProfileService profileService;

    @GetMapping
    public List<CartItemDTO> getCart(Authentication authentication) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return cartService.getCartAsDTOs(userId);
    }

    @PostMapping
    public ResponseEntity<CartItemDTO> addToCart(
            Authentication authentication,
            @RequestBody Map<String, Object> payload
    ) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        UUID variationId = UUID.fromString((String) payload.get("variationId"));
        int quantity = ((Number) payload.get("quantity")).intValue();

        CartItemDTO dto = cartService.addToCartAsDTO(userId, variationId, quantity);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantity(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> payload
    ) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        int quantity = ((Number) payload.get("quantity")).intValue();

        CartItemDTO dto = cartService.updateQuantityAsDTO(userId, id, quantity);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(Authentication authentication, @PathVariable UUID id) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        cartService.removeFromCart(userId, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sync")
    public List<CartItemDTO> syncCart(
            Authentication authentication,
            @RequestBody List<Map<String, Object>> localItems
    ) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return cartService.syncCartAsDTO(userId, localItems);
    }
}
