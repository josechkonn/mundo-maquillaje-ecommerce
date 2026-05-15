package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Category;
import mundo_maquillaje.ecommerce.Services.CategoryService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ProfileService profileService;

    @GetMapping
    public List<Category> getAllCategories(
            @RequestParam(required = false) UUID parentId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "false") boolean onlyMain) {
        
        if (onlyMain) {
            return categoryService.getMainCategories(isActive);
        }
        if (parentId != null) {
            return categoryService.getCategoriesByParent(parentId, isActive);
        }
        if (isActive != null && isActive) {
            return categoryService.getActiveCategories();
        }
        
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable UUID id) {
        return categoryService.getCategoryById(id);
    }

    @GetMapping("/slug/{slug}")
    public Category getCategoryBySlug(@PathVariable String slug) {
        return categoryService.getCategoryBySlug(slug);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(Authentication authentication, @RequestBody Category category) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can create categories");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(Authentication authentication, @PathVariable UUID id, @RequestBody Category category) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can update categories");
        }
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can delete categories");
        }
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
