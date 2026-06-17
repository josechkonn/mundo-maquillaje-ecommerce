package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Favorite;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Repositories.FavoriteRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductRepository;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProfileRepository profileRepository;
    private final ProductRepository productRepository;

    public List<Product> getFavoritesByProfileId(UUID profileId) {
        return favoriteRepository.findByProfileId(profileId)
                .stream()
                .map(Favorite::getProduct)
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(UUID profileId, UUID productId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new RuntimeException("Product not found");
        }

        Optional<Favorite> existing = favoriteRepository.findByProfileAndProduct(profile, product);
        if (existing.isEmpty()) {
            Favorite favorite = Favorite.builder()
                    .profile(profile)
                    .product(product)
                    .build();
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(UUID profileId, UUID productId) {
        favoriteRepository.deleteByProfileIdAndProductId(profileId, productId);
    }
}
