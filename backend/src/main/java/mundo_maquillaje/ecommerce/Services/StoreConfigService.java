package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.StoreConfig;
import mundo_maquillaje.ecommerce.Repositories.StoreConfigRepository;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class StoreConfigService {

    private final StoreConfigRepository storeConfigRepository;

    public StoreConfig getConfig() {
        return storeConfigRepository.findAll().stream().findFirst()
                .orElse(StoreConfig.builder().build());
    }

    public StoreConfig saveConfig(StoreConfig config) {
        // If an ID exists, we update. Otherwise, we might want to overwrite the existing singleton row.
        StoreConfig existing = storeConfigRepository.findAll().stream().findFirst().orElse(null);
        if (existing != null) {
            config.setId(existing.getId());
        }
        return storeConfigRepository.save(config);
    }
}
