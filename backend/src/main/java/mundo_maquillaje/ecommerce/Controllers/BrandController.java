package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Brand;
import mundo_maquillaje.ecommerce.Services.BrandService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
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
    private final ProfileService profileService;

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
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can create brands");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(brand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(Authentication authentication, @PathVariable UUID id,
            @RequestBody Brand brand) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can update brands");
        }
        return ResponseEntity.ok(brandService.updateBrand(id, brand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can delete brands");
        }
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
