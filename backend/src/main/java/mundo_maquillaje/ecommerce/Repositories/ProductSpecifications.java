package mundo_maquillaje.ecommerce.Repositories;

import jakarta.persistence.criteria.*;
import mundo_maquillaje.ecommerce.Models.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ProductSpecifications {

    public static Specification<Product> filterBy(
            String search,
            UUID categoryId,
            UUID brandId,
            Double minPrice,
            Double maxPrice,
            Double rateVES,
            Double rateCOP,
            String targetCurrencyCode,
            String sortBy) {

        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Double rVES = rateVES != null ? rateVES : 1.0;
            Double rCOP = rateCOP != null ? rateCOP : 1.0;

            // 1. Búsqueda por texto (name en product, description/sku en variations)
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                Predicate namePred = cb.like(cb.lower(root.get("name")), searchLower);

                Subquery<UUID> searchSub = query.subquery(UUID.class);
                Root<ProductVariation> searchRoot = searchSub.from(ProductVariation.class);
                searchSub.select(searchRoot.get("id")).where(
                    cb.equal(searchRoot.get("product").get("id"), root.get("id")),
                    cb.or(
                        cb.like(cb.lower(searchRoot.get("description")), searchLower),
                        cb.like(cb.lower(searchRoot.get("sku")), searchLower)
                    )
                );
                predicates.add(cb.or(namePred, cb.exists(searchSub)));
            }

            // 2. Filtrado por Categoría
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            // 3. Filtrado por Marca
            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), brandId));
            }

            // 4. Filtrado por Rango de Precios
            if (minPrice != null || maxPrice != null) {
                Subquery<UUID> subquery = query.subquery(UUID.class);
                Root<ProductVariation> subRoot = subquery.from(ProductVariation.class);
                Join<ProductVariation, Product> subProduct = subRoot.join("product");

                String target = targetCurrencyCode != null ? targetCurrencyCode.toUpperCase() : "USD";

                Double minCOP = minPrice;
                Double maxCOP = maxPrice;

                if ("USD".equals(target)) {
                    minCOP = minPrice != null ? minPrice * rVES * rCOP : null;
                    maxCOP = maxPrice != null ? maxPrice * rVES * rCOP : null;
                } else if ("VES".equals(target)) {
                    minCOP = minPrice != null ? minPrice * rCOP : null;
                    maxCOP = maxPrice != null ? maxPrice * rCOP : null;
                }

                List<Predicate> subPredicates = new ArrayList<>();
                subPredicates.add(cb.equal(subProduct.get("id"), root.get("id")));

                Expression<Double> priceInCOP = buildNormalizedPriceExpression(cb, subRoot, subProduct, rVES, rCOP);

                if (minCOP != null) {
                    subPredicates.add(cb.greaterThanOrEqualTo(priceInCOP, minCOP));
                }
                if (maxCOP != null) {
                    subPredicates.add(cb.lessThanOrEqualTo(priceInCOP, maxCOP));
                }

                subquery.select(subProduct.get("id")).where(cb.and(subPredicates.toArray(new Predicate[0])));
                predicates.add(cb.exists(subquery));
            }

            // Solo productos activos
            predicates.add(cb.isTrue(root.get("isActive")));

            // Solo productos con al menos una variación con stock > 0
            Subquery<UUID> stockSub = query.subquery(UUID.class);
            Root<ProductVariation> stockRoot = stockSub.from(ProductVariation.class);
            stockSub.select(stockRoot.get("product").get("id")).where(
                cb.equal(stockRoot.get("product").get("id"), root.get("id")),
                cb.greaterThan(stockRoot.get("stock"), 0)
            );
            predicates.add(cb.exists(stockSub));

            // 5. Ordenamiento por precio (subquery explícito, no depende de @Formula)
            // Solo aplicar ORDER BY en la query principal, no en la count query
            if (sortBy != null && (sortBy.equals("price_asc") || sortBy.equals("price_desc"))) {
                if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                    Subquery<Double> priceSub = query.subquery(Double.class);
                    Root<ProductVariation> vr = priceSub.from(ProductVariation.class);
                    Join<ProductVariation, Product> pj = vr.join("product");

                    Expression<Double> normalizedPrice = buildNormalizedPriceExpression(cb, vr, pj, rVES, rCOP);

                    priceSub.select(cb.min(normalizedPrice))
                            .where(cb.equal(vr.get("product").get("id"), root.get("id")));

                    if ("price_asc".equals(sortBy)) {
                        query.orderBy(cb.asc(priceSub));
                    } else {
                        query.orderBy(cb.desc(priceSub));
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Construye la expresión de precio normalizado a COP, reutilizable
     * para filtrado y ordenamiento.
     */
    private static Expression<Double> buildNormalizedPriceExpression(
            CriteriaBuilder cb,
            Root<ProductVariation> variationRoot,
            Join<ProductVariation, Product> productJoin,
            Double rateVES,
            Double rateCOP) {

        Expression<String> currencyCode = productJoin.get("currency").get("code");

        return cb.selectCase()
                .when(cb.equal(cb.upper(currencyCode), "USD"),
                      cb.prod(variationRoot.get("price"), rateVES * rateCOP))
                .when(cb.equal(cb.upper(currencyCode), "VES"),
                      cb.prod(variationRoot.get("price"), rateCOP))
                .otherwise(variationRoot.get("price"))
                .as(Double.class);
    }
}
