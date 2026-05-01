package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.ProductImage;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Repositories.ProductImageRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductVariationRepository;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Endpoints para gestionar imágenes asociadas a variantes de producto.
 *
 * GET    /api/variations/{variationId}/images         -> Listar imágenes de la variante
 * POST   /api/variations/{variationId}/images         -> Agregar imagen a variante (body: ProductImage JSON)
 * DELETE /api/variations/{variationId}/images/{imgId} -> Eliminar una imagen específica
 * PUT    /api/variations/{variationId}/images/{imgId}/main -> Marcar como imagen principal
 */
@RestController
@RequestMapping("/api/variations")
@RequiredArgsConstructor
public class ProductVariationImageController {

    private final ProductVariationRepository variationRepository;
    private final ProductImageRepository imageRepository;
    private final ProfileService profileService;

    // ─── GET: Listar imágenes de una variante ────────────────────────────────
    @GetMapping("/{variationId}/images")
    public ResponseEntity<List<ProductImage>> getImages(@PathVariable UUID variationId) {
        variationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variation not found"));
        return ResponseEntity.ok(imageRepository.findByVariationId(variationId));
    }

    // ─── POST: Agregar imagen a una variante ─────────────────────────────────
    @PostMapping("/{variationId}/images")
    public ResponseEntity<?> addImage(
            Authentication authentication,
            @PathVariable UUID variationId,
            @RequestBody ProductImage imagePayload) {

        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can manage images");
        }

        ProductVariation variation = variationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variation not found"));

        // Si esta imagen se marca como 'main', quitar el main de las demás
        if (Boolean.TRUE.equals(imagePayload.getIsMain())) {
            imageRepository.findByVariationId(variationId).forEach(img -> {
                img.setIsMain(false);
                imageRepository.save(img);
            });
        }

        imagePayload.setVariation(variation);
        ProductImage saved = imageRepository.save(imagePayload);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ─── DELETE: Eliminar una imagen ─────────────────────────────────────────
    @DeleteMapping("/{variationId}/images/{imageId}")
    public ResponseEntity<?> deleteImage(
            Authentication authentication,
            @PathVariable UUID variationId,
            @PathVariable UUID imageId) {

        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can manage images");
        }

        imageRepository.deleteById(imageId);
        return ResponseEntity.noContent().build();
    }

    // ─── PUT: Marcar imagen como principal ───────────────────────────────────
    @PutMapping("/{variationId}/images/{imageId}/main")
    public ResponseEntity<?> setMainImage(
            Authentication authentication,
            @PathVariable UUID variationId,
            @PathVariable UUID imageId) {

        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can manage images");
        }

        // Quitar main de todas las imágenes de la variante
        imageRepository.findByVariationId(variationId).forEach(img -> {
            img.setIsMain(img.getId().equals(imageId));
            imageRepository.save(img);
        });

        return ResponseEntity.ok().build();
    }
}
