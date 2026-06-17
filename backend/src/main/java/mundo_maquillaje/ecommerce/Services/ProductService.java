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
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAllWithGraph(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Product> getActiveProducts(Pageable pageable) {
        Page<Product> page = productRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            Subquery<UUID> stockSub = query.subquery(UUID.class);
            Root<ProductVariation> stockRoot = stockSub.from(ProductVariation.class);
            stockSub.select(stockRoot.get("product").get("id")).where(
                    cb.equal(stockRoot.get("product").get("id"), root.get("id")),
                    cb.isTrue(stockRoot.get("isActive")));
            predicates.add(cb.exists(stockSub));

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
        filterActiveVariations(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public Page<Product> getProductsByCategory(UUID categoryId, Pageable pageable) {
        Page<Product> page = productRepository.findByCategoryId(categoryId, pageable);
        filterActiveVariations(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public Page<Product> getProductsByParentCategory(UUID parentId, Pageable pageable) {
        Page<Product> page = productRepository.findByCategoryParentId(parentId, pageable);
        filterActiveVariations(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String query, Pageable pageable) {
        Page<Product> page = productRepository.searchProducts(query, pageable);
        filterActiveVariations(page.getContent());
        return page;
    }

    @Transactional(readOnly = true)
    public List<Product> searchProductsCursor(String query, UUID lastId, int size) {
        List<Product> products = productRepository.findNextProducts(query != null ? query : "", lastId,
                PageRequest.of(0, size + 1));
        filterActiveVariations(products);
        return products;
    }

    @Transactional(readOnly = true)
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

        // Solo usar Sort de Spring Data para nombre; el precio se ordena dentro de la
        // Specification
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if (sortBy != null) {
            switch (sortBy) {
                case "name_asc" -> sort = org.springframework.data.domain.Sort.by("name").ascending();
                case "name_desc" -> sort = org.springframework.data.domain.Sort.by("name").descending();
                case "created_at_asc" -> sort = org.springframework.data.domain.Sort.by("createdAt").ascending();
                case "created_at_desc" -> sort = org.springframework.data.domain.Sort.by("createdAt").descending();
                // price_asc / price_desc se manejan dentro de ProductSpecifications
            }
        }

        // Obtener tasas para conversión encadenada (USD -> VES -> COP)
        Double rateVES = productRepository.findExchangeRateByCode("VES");
        Double rateCOP = productRepository.findExchangeRateByCode("COP");

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository
                .findAll(ProductSpecifications.filterBy(search, categoryId, brandId, minPrice, maxPrice,
                        rateVES, rateCOP, targetCurrencyCode, sortBy), pageable);
        filterActiveVariations(productPage.getContent());
        return productPage;
    }

    public Product getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new RuntimeException("Product not found");
        }
        return product;
    }

    @Transactional(readOnly = true)
    public Product getProductByIdPublic(UUID id) {
        Product product = getProductById(id);
        filterActiveVariations(product);
        return product;
    }

    public Product getProductByIdAdmin(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional(readOnly = true)
    public Product getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new RuntimeException("Product not found");
        }
        filterActiveVariations(product);
        return product;
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
                    .price(0.0)
                    .stock(0)
                    .product(product)
                    .build();
            product.getVariations().add(defaultVariation);
        } else {
            // Link each variation (and its images) back to the product/variation
            product.getVariations().forEach(v -> {
                v.setProduct(product);
                if (v.getAlertQuantity() == null) {
                    v.setAlertQuantity(5);
                }
                if (v.getImages() != null) {
                    v.getImages().forEach(img -> img.setVariation(v));
                }
            });
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID id, Product details) {
        Product product = getProductByIdAdmin(id);

        product.setName(details.getName());
        product.setDescription(details.getDescription());
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
        if (details.getVariations() != null) {
            product.getVariations().size();
            Set<UUID> seenIds = new HashSet<>();

            for (ProductVariation detail : details.getVariations()) {
                if (detail.getId() != null) {
                    ProductVariation existing = product.getVariations().stream()
                            .filter(v -> detail.getId().equals(v.getId()))
                            .findFirst()
                            .orElse(null);

                    if (existing != null) {
                        existing.setName(detail.getName());
                        existing.setSku(detail.getSku());
                        existing.setPrice(detail.getPrice());
                        existing.setStock(detail.getStock());
                        existing.setAttributeName(detail.getAttributeName());
                        existing.setAttributeValue(detail.getAttributeValue());
                        existing.setHexColor(detail.getHexColor());
                        existing.setDescription(detail.getDescription());
                        existing.setAlertQuantity(detail.getAlertQuantity() != null ? detail.getAlertQuantity() : 5);
                        existing.setIsActive(detail.getIsActive());
                        updateVariationImages(existing, detail.getImages());
                        seenIds.add(detail.getId());
                        continue;
                    }
                }

                detail.setId(null);
                detail.setProduct(product);
                if (detail.getAlertQuantity() == null) {
                    detail.setAlertQuantity(5);
                }
                if (detail.getImages() != null) {
                    detail.getImages().forEach(img -> img.setVariation(detail));
                }
                product.getVariations().add(detail);
            }

            product.getVariations().removeIf(v -> !seenIds.contains(v.getId()));
        }

        return productRepository.save(product);
    }

    private void updateVariationImages(ProductVariation variation, List<mundo_maquillaje.ecommerce.Models.ProductImage> newImages) {
        if (newImages == null) {
            variation.getImages().clear();
            return;
        }

        Set<UUID> seenImageIds = new HashSet<>();
        for (mundo_maquillaje.ecommerce.Models.ProductImage img : newImages) {
            if (img.getId() != null) {
                mundo_maquillaje.ecommerce.Models.ProductImage existing = variation.getImages().stream()
                        .filter(i -> img.getId().equals(i.getId()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setUrlImage(img.getUrlImage());
                    existing.setOrder(img.getOrder());
                    existing.setAltText(img.getAltText());
                    existing.setIsMain(img.getIsMain());
                    seenImageIds.add(img.getId());
                    continue;
                }
            }

            img.setId(null);
            img.setVariation(variation);
            variation.getImages().add(img);
        }

        variation.getImages().removeIf(i -> !seenImageIds.contains(i.getId()));
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

    @Transactional(readOnly = true)
    public Page<Product> getBestSellers(Pageable pageable) {
        List<UUID> orderedIds = productRepository.findBestSellerIds(pageable);
        if (orderedIds.isEmpty()) {
            return org.springframework.data.domain.Page.empty(pageable);
        }
        List<Product> products = productRepository.findByIdsInWithGraph(orderedIds);
        Map<UUID, Integer> orderMap = new HashMap<>();
        for (int i = 0; i < orderedIds.size(); i++) {
            orderMap.put(orderedIds.get(i), i);
        }
        products.sort(Comparator.comparingInt(p -> orderMap.getOrDefault(p.getId(), Integer.MAX_VALUE)));
        filterActiveVariations(products);
        return new org.springframework.data.domain.PageImpl<>(products, pageable, orderedIds.size());
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

    private void filterActiveVariations(List<Product> products) {
        for (Product p : products) {
            filterActiveVariations(p);
        }
    }

    private void filterActiveVariations(Product p) {
        if (p.getVariations() != null) {
            p.setVariations(p.getVariations().stream()
                    .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                    .collect(Collectors.toList()));
        }
    }
}
