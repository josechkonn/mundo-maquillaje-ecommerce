package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.ShippingMethod;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import mundo_maquillaje.ecommerce.Services.ShippingMethodService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipping-methods")
@RequiredArgsConstructor
public class ShippingMethodController {

    private final ShippingMethodService shippingMethodService;
    private final PermissionService permissionService;

    @GetMapping
    public List<ShippingMethod> getAllShippingMethods() {
        return shippingMethodService.getAllShippingMethods();
    }

    @PostMapping
    public ResponseEntity<?> createShippingMethod(Authentication authentication, @RequestBody ShippingMethod shippingMethod) {
        permissionService.requirePermission(authentication, "manage.settings");
        return ResponseEntity.status(HttpStatus.CREATED).body(shippingMethodService.createShippingMethod(shippingMethod));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShippingMethod(Authentication authentication, @PathVariable UUID id, @RequestBody ShippingMethod shippingMethod) {
        permissionService.requirePermission(authentication, "manage.settings");
        return ResponseEntity.ok(shippingMethodService.updateShippingMethod(id, shippingMethod));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShippingMethod(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.settings");
        shippingMethodService.deleteShippingMethod(id);
        return ResponseEntity.noContent().build();
    }
}
