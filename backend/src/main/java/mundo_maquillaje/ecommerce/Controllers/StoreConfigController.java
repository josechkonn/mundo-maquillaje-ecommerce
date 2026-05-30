package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.StoreConfig;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import mundo_maquillaje.ecommerce.Services.StoreConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class StoreConfigController {

    private final StoreConfigService storeConfigService;
    private final PermissionService permissionService;

    @GetMapping
    public StoreConfig getConfig() {
        return storeConfigService.getConfig();
    }

    @PutMapping
    public ResponseEntity<?> updateConfig(Authentication authentication, @RequestBody StoreConfig config) {
        permissionService.requirePermission(authentication, "manage.settings");
        return ResponseEntity.ok(storeConfigService.saveConfig(config));
    }
}
