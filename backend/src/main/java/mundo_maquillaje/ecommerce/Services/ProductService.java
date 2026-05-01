package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product getProductBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional
    public Product createProduct(Product product) {
        // 1. Generate Slug
        if (product.getSlug() == null || product.getSlug().isEmpty()) {
            product.setSlug(generateSlug(product.getName()));
        }

        // 2. Handle Variations - ensure at least one exists
        if (product.getVariations() == null || product.getVariations().isEmpty()) {
            ProductVariation defaultVariation = ProductVariation.builder()
                    .name("Estándar")
                    .sku(product.getSku())
                    .price(0.0)
                    .stock(0)
                    .product(product)
                    .build();
            product.getVariations().add(defaultVariation);
        } else {
            // Link each variation (and its images) back to the product/variation
            product.getVariations().forEach(v -> {
                v.setProduct(product);
                if (v.getImages() != null) {
                    v.getImages().forEach(img -> img.setVariation(v));
                }
            });
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID id, Product details) {
        Product product = getProductById(id);

        product.setName(details.getName());
        product.setDescription(details.getDescription());
        product.setAlertQuantity(details.getAlertQuantity());
        product.setIsActive(details.getIsActive());
        product.setCategory(details.getCategory());
        product.setBrand(details.getBrand());
        product.setCurrency(details.getCurrency());

        if (details.getSlug() != null && !details.getSlug().isEmpty()) {
            product.setSlug(details.getSlug());
        } else {
            product.setSlug(generateSlug(details.getName()));
        }

        // Update variations and their nested images
        if (details.getVariations() != null && !details.getVariations().isEmpty()) {
            product.getVariations().clear();
            details.getVariations().forEach(v -> {
                v.setProduct(product);
                if (v.getImages() != null) {
                    v.getImages().forEach(img -> img.setVariation(v));
                }
                product.getVariations().add(v);
            });
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
