package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Services.ProductService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
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
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID parentCategoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID lastId,
            @RequestParam(required = false) UUID brandId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Double targetRate,
            @RequestParam(required = false) String targetCurrencyCode) {
        
        if (lastId != null) {
            return ResponseEntity.ok(productService.searchProductsCursor(search, lastId, size));
        }

        // Si hay filtros complejos, usamos la nueva lógica de especificaciones
        if (brandId != null || minPrice != null || maxPrice != null || sortBy != null) {
            return ResponseEntity.ok(productService.getFilteredProducts(search, categoryId, brandId, minPrice, maxPrice, sortBy, targetRate, targetCurrencyCode, page, size));
        }

        PageRequest pageable = PageRequest.of(page, size);

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(productService.searchProducts(search, pageable));
        }
        
        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId, pageable));
        }
        if (parentCategoryId != null) {
            return ResponseEntity.ok(productService.getProductsByParentCategory(parentCategoryId, pageable));
        }
        
        return ResponseEntity.ok(productService.getAllProducts(pageable));
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
        permissionService.requirePermission(authentication, "manage.products");
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(Authentication authentication, @PathVariable UUID id, @RequestBody Product product) {
        permissionService.requirePermission(authentication, "manage.products");
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.products");
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/price-range")
    public ResponseEntity<?> getPriceRange() {
        return ResponseEntity.ok(productService.getPriceRange());
    }
}
