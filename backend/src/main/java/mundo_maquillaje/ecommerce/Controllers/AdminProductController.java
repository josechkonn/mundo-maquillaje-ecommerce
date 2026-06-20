package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Services.ProductService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) UUID brandId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "true") boolean sortDesc) {
        permissionService.requirePermission(authentication, "manage.products");
        Page<Product> result = productService.getFilteredAdminProducts(
                search, isActive, brandId, categoryId, sortBy, sortDesc, page, size);
        return ResponseEntity.ok(Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "number", result.getNumber(),
                "size", result.getSize()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.products");
        return ResponseEntity.ok(productService.getProductByIdAdmin(id));
    }
}
