package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.ProductCollection;
import mundo_maquillaje.ecommerce.Services.CollectionService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;
    private final ProfileService profileService;

    @GetMapping
    public List<ProductCollection> getActiveCollections() {
        return collectionService.getActiveCollections();
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCollections(Authentication authentication) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can view all collections");
        }
        return ResponseEntity.ok(collectionService.getAllCollections());
    }

    @PostMapping
    public ResponseEntity<?> createCollection(Authentication authentication, @RequestBody ProductCollection collection) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage collections");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(collectionService.saveCollection(collection));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCollection(Authentication authentication, @PathVariable UUID id, @RequestBody ProductCollection collection) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage collections");
        }
        collection.setId(id);
        return ResponseEntity.ok(collectionService.saveCollection(collection));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCollection(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage collections");
        }
        collectionService.deleteCollection(id);
        return ResponseEntity.noContent().build();
    }
}
