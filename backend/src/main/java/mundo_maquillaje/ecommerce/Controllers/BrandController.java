package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Brand;
import mundo_maquillaje.ecommerce.Services.BrandService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;
    private final PermissionService permissionService;

    @GetMapping
    public List<Brand> getAllBrands() {
        return brandService.getAllBrands();
    }

    @GetMapping("/{id}")
    public Brand getBrandById(@PathVariable UUID id) {
        return brandService.getBrandById(id);
    }

    @PostMapping
    public ResponseEntity<?> createBrand(Authentication authentication, @RequestBody Brand brand) {
        permissionService.requirePermission(authentication, "manage.settings");
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(brand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(Authentication authentication, @PathVariable UUID id,
            @RequestBody Brand brand) {
        permissionService.requirePermission(authentication, "manage.settings");
        return ResponseEntity.ok(brandService.updateBrand(id, brand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.settings");
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
