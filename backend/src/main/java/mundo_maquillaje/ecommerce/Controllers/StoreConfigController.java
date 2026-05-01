package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.StoreConfig;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import mundo_maquillaje.ecommerce.Services.StoreConfigService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class StoreConfigController {

    private final StoreConfigService storeConfigService;
    private final ProfileService profileService;

    @GetMapping
    public StoreConfig getConfig() {
        return storeConfigService.getConfig();
    }

    @PutMapping
    public ResponseEntity<?> updateConfig(Authentication authentication, @RequestBody StoreConfig config) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage store configuration");
        }
        return ResponseEntity.ok(storeConfigService.saveConfig(config));
    }
}
