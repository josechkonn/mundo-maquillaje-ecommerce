package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.CartItemDTO;
import mundo_maquillaje.ecommerce.Models.Cart;
import mundo_maquillaje.ecommerce.Models.CartProduct;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Repositories.CartProductRepository;
import mundo_maquillaje.ecommerce.Repositories.CartRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductVariationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartProductRepository cartProductRepository;
    private final ProductVariationRepository productVariationRepository;

    private Cart getOrCreateActiveCart(UUID userId) {
        List<Cart> activeCarts = cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE");
        if (!activeCarts.isEmpty()) {
            activeCarts.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            Cart cart = activeCarts.get(0);
            if (activeCarts.size() > 1) {
                for (int i = 1; i < activeCarts.size(); i++) {
                    Cart dup = activeCarts.get(i);
                    dup.getProducts().clear();
                    dup.setStatus("COMPLETED");
                    cartRepository.save(dup);
                }
            }
            return cart;
        }
        // Intentar reutilizar un carrito COMPLETED
        Cart completed = cartRepository.findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, "COMPLETED").orElse(null);
        if (completed != null) {
            completed.getProducts().clear();
            completed.setStatus("ACTIVE");
            return cartRepository.save(completed);
        }
        return cartRepository.save(Cart.builder()
                .userId(userId)
                .status("ACTIVE")
                .build());
    }

    @Transactional
    public List<CartProduct> getCartItems(UUID userId) {
        Cart cart = getOrCreateActiveCart(userId);
        return new ArrayList<>(cart.getProducts());
    }

    @Transactional
    public CartProduct addToCart(UUID userId, UUID variationId, int quantity) {
        Cart cart = getOrCreateActiveCart(userId);
        cart = cartRepository.findByIdWithLock(cart.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        ProductVariation variation = productVariationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variación no encontrada"));

        if (!Boolean.TRUE.equals(variation.getIsActive())
                || !Boolean.TRUE.equals(variation.getProduct().getIsActive())) {
            throw new RuntimeException("Este producto no está disponible actualmente");
        }

        if (quantity > variation.getStock()) {
            if (variation.getStock() == 0) {
                throw new RuntimeException("Este producto está agotado. No hay stock disponible.");
            }
            throw new RuntimeException("Stock insuficiente. Disponible: " + variation.getStock());
        }

        // Buscar items existentes para esta variación y consolidar duplicados
        List<CartProduct> existingProducts = cartProductRepository.findAllByCartIdAndVariationId(cart.getId(),
                variationId);

        if (!existingProducts.isEmpty()) {
            // Consolidar todos los duplicados en uno solo
            CartProduct keeper = existingProducts.get(0);
            int existingTotalQty = existingProducts.stream().mapToInt(CartProduct::getQuantity).sum();

            // Eliminar duplicados si hay más de uno
            if (existingProducts.size() > 1) {
                for (int i = 1; i < existingProducts.size(); i++) {
                    CartProduct dup = existingProducts.get(i);
                    cart.getProducts().remove(dup);
                    cartProductRepository.delete(dup);
                }
                cartProductRepository.flush();
            }

            // Sumar la cantidad nueva a la existente
            int newQty = Math.min(existingTotalQty + quantity, variation.getStock());
            keeper.setQuantity(newQty);
            return cartProductRepository.save(keeper);
        }

        // No existe: crear nuevo CartProduct
        CartProduct newProduct = CartProduct.builder()
                .cart(cart)
                .variation(variation)
                .quantity(Math.min(quantity, variation.getStock()))
                .build();

        CartProduct saved = cartProductRepository.save(newProduct);
        cart.getProducts().add(saved);
        return saved;
    }

    @Transactional
    public CartProduct updateQuantity(UUID userId, UUID productId, int quantity) {
        CartProduct product = cartProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado en el carrito"));

        if (!product.getCart().getUserId().equals(userId)) {
            throw new RuntimeException("No autorizado");
        }

        if (quantity <= 0) {
            product.getCart().getProducts().remove(product);
            cartProductRepository.delete(product);
            return null;
        }

        if (quantity > product.getVariation().getStock()) {
            throw new RuntimeException("Stock insuficiente");
        }

        product.setQuantity(quantity);
        return cartProductRepository.save(product);
    }

    @Transactional
    public void removeFromCart(UUID userId, UUID productId) {
        CartProduct product = cartProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!product.getCart().getUserId().equals(userId)) {
            throw new RuntimeException("No autorizado");
        }

        product.getCart().getProducts().remove(product);
        cartProductRepository.delete(product);
    }

    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = getOrCreateActiveCart(userId);
        cart.getProducts().clear();
        cart.setStatus("COMPLETED");
        cartRepository.save(cart);
    }

    @Transactional
    public List<CartProduct> syncCart(UUID userId, List<Map<String, Object>> localItems) {
        Cart cart = getOrCreateActiveCart(userId);
        cart = cartRepository.findByIdWithLock(cart.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        if (localItems.isEmpty())
            return getCartItems(userId);

        List<UUID> localVariationIds = localItems.stream()
                .map(item -> UUID.fromString((String) item.get("variationId")))
                .collect(Collectors.toList());

        // Eliminar items del carrito que no están en la lista local
        List<CartProduct> toRemove = cart.getProducts().stream()
                .filter(cp -> !localVariationIds.contains(cp.getVariation().getId()))
                .collect(Collectors.toList());

        cart.getProducts().removeAll(toRemove);
        cartProductRepository.deleteAll(toRemove);

        for (Map<String, Object> localItem : localItems) {
            UUID variationId = UUID.fromString((String) localItem.get("variationId"));
            int quantity = ((Number) localItem.get("quantity")).intValue();

            List<CartProduct> existingProducts = cartProductRepository.findAllByCartIdAndVariationId(cart.getId(),
                    variationId);
            if (!existingProducts.isEmpty()) {
                // Consolidar todos los duplicados en un solo item
                CartProduct keeper = existingProducts.get(0);
                if (existingProducts.size() > 1) {
                    for (int i = 1; i < existingProducts.size(); i++) {
                        CartProduct dup = existingProducts.get(i);
                        cart.getProducts().remove(dup);
                        cartProductRepository.delete(dup);
                    }
                }
                int clampedQty = Math.min(quantity, keeper.getVariation().getStock());
                if (clampedQty <= 0) {
                    cart.getProducts().remove(keeper);
                    cartProductRepository.delete(keeper);
                } else {
                    keeper.setQuantity(clampedQty);
                    cartProductRepository.save(keeper);
                }
            } else {
                // No existe: crear nuevo
                ProductVariation variation = productVariationRepository.findById(variationId).orElse(null);
                if (variation != null && Boolean.TRUE.equals(variation.getIsActive())) {
                    int clampedQty = Math.min(quantity, variation.getStock());
                    if (clampedQty > 0) {
                        CartProduct newProduct = CartProduct.builder()
                                .cart(cart)
                                .variation(variation)
                                .quantity(clampedQty)
                                .build();
                        CartProduct saved = cartProductRepository.save(newProduct);
                        cart.getProducts().add(saved);
                    }
                }
            }
        }
        return getCartItems(userId);
    }

    // ─── DTO Methods ──────────────────────────────────────────────────────────

    @Transactional
    public List<CartItemDTO> getCartAsDTOs(UUID userId) {
        return getCartItems(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemDTO addToCartAsDTO(UUID userId, UUID variationId, int quantity) {
        return toDTO(addToCart(userId, variationId, quantity));
    }

    @Transactional
    public CartItemDTO updateQuantityAsDTO(UUID userId, UUID productId, int quantity) {
        CartProduct cp = updateQuantity(userId, productId, quantity);
        return cp != null ? toDTO(cp) : null;
    }

    @Transactional
    public List<CartItemDTO> syncCartAsDTO(UUID userId, List<Map<String, Object>> localItems) {
        return syncCart(userId, localItems).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private CartItemDTO toDTO(CartProduct cp) {
        ProductVariation v = cp.getVariation();
        Product p = v.getProduct();
        Currency c = p.getCurrency();

        List<CartItemDTO.CartImageDTO> images = v.getImages().stream()
                .map(img -> CartItemDTO.CartImageDTO.builder()
                        .id(img.getId())
                        .urlImage(img.getUrlImage())
                        .order(img.getOrder())
                        .altText(img.getAltText())
                        .isMain(img.getIsMain())
                        .build())
                .collect(Collectors.toList());

        return CartItemDTO.builder()
                .id(cp.getId())
                .variation(CartItemDTO.CartVariationDTO.builder()
                        .id(v.getId())
                        .name(v.getName())
                        .sku(v.getSku())
                        .price(v.getPrice() != null ? v.getPrice() : 0.0)
                        .stock(v.getStock() != null ? v.getStock() : 0)
                        .description(v.getDescription())
                        .attributeName(v.getAttributeName())
                        .attributeValue(v.getAttributeValue())
                        .hexColor(v.getHexColor())
                        .isActive(Boolean.TRUE.equals(v.getIsActive()))
                        .images(images)
                        .build())
                .quantity(cp.getQuantity() != null ? cp.getQuantity() : 0)
                .addedAt(cp.getAddedAt())
                .productId(p.getId())
                .productName(p.getName())
                .productSlug(p.getSlug())
                .currencyId(c.getId())
                .currencyCode(c.getCode())
                .currencySymbol(c.getSymbol())
                .currencyDecimalPlaces(c.getDecimalPlaces() != null ? c.getDecimalPlaces() : 0)
                .currencySymbolPosition(c.getSymbolPosition() != null ? c.getSymbolPosition() : "LEFT")
                .currencyExchangeRate(c.getExchangeRate() != null ? c.getExchangeRate() : 1.0)
                .build();
    }
}
