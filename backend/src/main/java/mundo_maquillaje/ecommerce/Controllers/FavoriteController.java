package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Services.FavoriteService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final ProfileService profileService;

    @GetMapping
    public List<Product> getFavorites(Authentication authentication) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return favoriteService.getFavoritesByProfileId(userId);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addFavorite(Authentication authentication, @PathVariable UUID productId) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        favoriteService.addFavorite(userId, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(Authentication authentication, @PathVariable UUID productId) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.noContent().build();
    }
}
