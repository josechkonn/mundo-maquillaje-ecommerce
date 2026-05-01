package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.ProductCollection;
import mundo_maquillaje.ecommerce.Repositories.CollectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;

    public List<ProductCollection> getActiveCollections() {
        return collectionRepository.findAllByIsActiveOrderByDisplayOrderAsc(true);
    }

    public List<ProductCollection> getAllCollections() {
        return collectionRepository.findAll();
    }

    public ProductCollection getCollectionById(UUID id) {
        return collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
    }

    public ProductCollection saveCollection(ProductCollection collection) {
        return collectionRepository.save(collection);
    }

    public void deleteCollection(UUID id) {
        collectionRepository.deleteById(id);
    }
}
