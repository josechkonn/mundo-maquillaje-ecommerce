package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Favorite;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByProfileId(UUID profileId);
    Optional<Favorite> findByProfileAndProduct(Profile profile, Product product);
    void deleteByProfileIdAndProductId(UUID profileId, UUID productId);
}
