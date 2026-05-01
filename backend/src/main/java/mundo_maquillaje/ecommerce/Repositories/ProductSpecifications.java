package mundo_maquillaje.ecommerce.Repositories;

import jakarta.persistence.criteria.*;
import mundo_maquillaje.ecommerce.Models.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ProductSpecifications {

    // Filtrado simple: minPrice y maxPrice llegan en targetCurrencyCode.
    // Asumimos que todos los productos base están en COP, así que convertimos los
    // límites a COP.
    public static Specification<Product> filterBy(
            String search,
            UUID categoryId,
            UUID brandId,
            Double minPrice,
            Double maxPrice,
            Double rateVES,
            Double rateCOP,
            String targetCurrencyCode) {

        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Búsqueda por texto
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchLower),
                        cb.like(cb.lower(root.get("description")), searchLower),
                        cb.like(cb.lower(root.get("sku")), searchLower)));
            }

            // 2. Filtrado por Categoría
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            // 3. Filtrado por Marca
            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), brandId));
            }

            // 4. Filtrado por Rango de Precios (Lógica con Subquery para evitar duplicados en la paginación)
            if (minPrice != null || maxPrice != null) {
                Subquery<UUID> subquery = query.subquery(UUID.class);
                Root<ProductVariation> subRoot = subquery.from(ProductVariation.class);
                Join<ProductVariation, Product> subProduct = subRoot.join("product");

                Double rVES = rateVES != null ? rateVES : 1.0;
                Double rCOP = rateCOP != null ? rateCOP : 1.0;
                String target = targetCurrencyCode != null ? targetCurrencyCode.toUpperCase() : "USD";

                // Convertir límites de targetCurrency a COP
                Double minCOP = minPrice;
                Double maxCOP = maxPrice;

                if ("USD".equals(target)) {
                    minCOP = minPrice != null ? minPrice * rVES * rCOP : null;
                    maxCOP = maxPrice != null ? maxPrice * rVES * rCOP : null;
                } else if ("VES".equals(target)) {
                    minCOP = minPrice != null ? minPrice * rCOP : null;
                    maxCOP = maxPrice != null ? maxPrice * rCOP : null;
                } // Si es COP, se queda igual

                List<Predicate> subPredicates = new ArrayList<>();
                subPredicates.add(cb.equal(subProduct.get("id"), root.get("id")));

                // Normalizar el precio del producto a COP dinámicamente según su moneda base (por ID)
                UUID usdId = UUID.fromString("d496cda6-bcaf-49c8-ab46-021db20b8164");
                UUID vesId = UUID.fromString("23792dea-1aa4-4bc1-ad9d-a9848cafbc6f");

                Expression<Double> priceInCOP = cb.selectCase()
                    .when(cb.equal(subProduct.get("currency").get("id"), usdId), 
                          cb.prod(subRoot.get("price"), rVES * rCOP))
                    .when(cb.equal(subProduct.get("currency").get("id"), vesId), 
                          cb.prod(subRoot.get("price"), rCOP))
                    .otherwise(subRoot.get("price")).as(Double.class);

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

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
