package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.StoreConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StoreConfigRepository extends JpaRepository<StoreConfig, UUID> {
    // We only ever expect one config row, but we use JpaRepository for standard operations
}
