package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Repositories.ProductRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductSpecifications;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    public Page<Product> getProductsByCategory(UUID categoryId, Pageable pageable) {
        return productRepository.findByCategoryId(categoryId, pageable);
    }

    public Page<Product> getProductsByParentCategory(UUID parentId, Pageable pageable) {
        return productRepository.findByCategoryParentId(parentId, pageable);
    }

    public Page<Product> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable);
    }

    public List<Product> searchProductsCursor(String query, UUID lastId, int size) {
        return productRepository.findNextProducts(query != null ? query : "", lastId, PageRequest.of(0, size + 1));
    }

    public Page<Product> getFilteredProducts(
            String search,
            UUID categoryId,
            UUID brandId,
            Double minPrice,
            Double maxPrice,
            String sortBy,
            Double targetRate,
            String targetCurrencyCode,
            int page,
            int size) {

        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if (sortBy != null) {
            switch (sortBy) {
                case "name_asc" -> sort = org.springframework.data.domain.Sort.by("name").ascending();
                case "name_desc" -> sort = org.springframework.data.domain.Sort.by("name").descending();
                case "price_asc" -> sort = org.springframework.data.domain.Sort.by("minPrice").ascending();
                case "price_desc" -> sort = org.springframework.data.domain.Sort.by("minPrice").descending();
            }
        }

        // Obtener tasas para conversión encadenada (USD -> VES -> COP)
        Double rateVES = productRepository.findExchangeRateByCode("VES");
        Double rateCOP = productRepository.findExchangeRateByCode("COP");

        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findAll(ProductSpecifications.filterBy(search, categoryId, brandId, minPrice, maxPrice,
                rateVES, rateCOP, targetCurrencyCode), pageable);
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
        if (input == null)
            return "";
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    public java.util.Map<String, Double> getPriceRange() {
        java.util.List<Object[]> resultList = productRepository.getMinMaxPrices();
        java.util.Map<String, Double> range = new java.util.HashMap<>();

        Double min = 0.0;
        Double max = 100000.0;

        if (resultList != null && !resultList.isEmpty() && resultList.get(0) != null) {
            Object[] result = resultList.get(0);
            min = result[0] != null ? ((Number) result[0]).doubleValue() : 0.0;
            max = result[1] != null ? ((Number) result[1]).doubleValue() : 100000.0;
        }

        range.put("min", min);
        range.put("max", max);

        return range;
    }
}
