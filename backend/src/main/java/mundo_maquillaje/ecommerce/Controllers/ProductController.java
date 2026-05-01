package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Services.ProductService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProfileService profileService;

    @GetMapping
    public Page<Product> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return productService.getAllProducts(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Product> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(Authentication authentication, @RequestBody Product product) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage products");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(Authentication authentication, @PathVariable UUID id, @RequestBody Product product) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage products");
        }
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage products");
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
