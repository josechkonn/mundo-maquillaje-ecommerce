package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Banner;
import mundo_maquillaje.ecommerce.Services.BannerService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;
    private final ProfileService profileService;

    @GetMapping
    public List<Banner> getActiveBanners() {
        return bannerService.getActiveBanners();
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllBanners(Authentication authentication) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can list all banners");
        }
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @PostMapping
    public ResponseEntity<?> createBanner(Authentication authentication, @RequestBody Banner banner) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage banners");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(bannerService.createBanner(banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(Authentication authentication, @PathVariable UUID id, @RequestBody Banner banner) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage banners");
        }
        return ResponseEntity.ok(bannerService.updateBanner(id, banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage banners");
        }
        bannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }
}
