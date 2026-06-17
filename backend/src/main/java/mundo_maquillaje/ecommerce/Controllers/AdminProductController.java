package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Services.ProductService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        permissionService.requirePermission(authentication, "manage.products");
        PageRequest pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.getAllProducts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.products");
        return ResponseEntity.ok(productService.getProductByIdAdmin(id));
    }
}
