package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.CartItemDTO;
import mundo_maquillaje.ecommerce.Models.Cart;
import mundo_maquillaje.ecommerce.Models.CartProduct;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Models.ProductImage;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Repositories.CartProductRepository;
import mundo_maquillaje.ecommerce.Repositories.CartRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductVariationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartProductRepository cartProductRepository;
    private final ProductVariationRepository productVariationRepository;

    private Cart getOrCreateActiveCart(UUID userId) {
        return cartRepository.findByUserIdAndStatus(userId, "ACTIVE")
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .userId(userId)
                        .status("ACTIVE")
                        .build()));
    }

    public List<CartProduct> getCartItems(UUID userId) {
        Cart cart = getOrCreateActiveCart(userId);
        return cart.getProducts();
    }

    @Transactional
    public CartProduct addToCart(UUID userId, UUID variationId, int quantity) {
        Cart cart = getOrCreateActiveCart(userId);
        ProductVariation variation = productVariationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variación no encontrada"));

        if (quantity > variation.getStock()) {
            if (variation.getStock() == 0) {
                throw new RuntimeException("Este producto está agotado. No hay stock disponible.");
            }
            throw new RuntimeException("Stock insuficiente. Disponible: " + variation.getStock());
        }

        Optional<CartProduct> existing = cartProductRepository.findByCartIdAndVariationId(cart.getId(), variationId);
        if (existing.isPresent()) {
            CartProduct product = existing.get();
            int newQty = product.getQuantity() + quantity;
            product.setQuantity(Math.min(newQty, variation.getStock()));
            return cartProductRepository.save(product);
        }

        CartProduct newProduct = CartProduct.builder()
                .cart(cart)
                .variation(variation)
                .quantity(quantity)
                .build();

        return cartProductRepository.save(newProduct);
    }

    @Transactional
    public CartProduct updateQuantity(UUID userId, UUID productId, int quantity) {
        CartProduct product = cartProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado en el carrito"));

        if (!product.getCart().getUserId().equals(userId)) {
            throw new RuntimeException("No autorizado");
        }

        if (quantity <= 0) {
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
        
        List<UUID> localVariationIds = localItems.stream()
                .map(item -> UUID.fromString((String) item.get("variationId")))
                .collect(Collectors.toList());

        List<CartProduct> toRemove = cart.getProducts().stream()
                .filter(cp -> !localVariationIds.contains(cp.getVariation().getId()))
                .collect(Collectors.toList());

        cart.getProducts().removeAll(toRemove);
        cartProductRepository.deleteAll(toRemove);

        for (Map<String, Object> localItem : localItems) {
            UUID variationId = UUID.fromString((String) localItem.get("variationId"));
            int quantity = ((Number) localItem.get("quantity")).intValue();

            Optional<CartProduct> existing = cartProductRepository.findByCartIdAndVariationId(cart.getId(), variationId);
            if (existing.isPresent()) {
                CartProduct p = existing.get();
                int clampedQty = Math.min(quantity, p.getVariation().getStock());
                if (clampedQty <= 0) {
                    cart.getProducts().remove(p);
                    cartProductRepository.delete(p);
                } else {
                    p.setQuantity(clampedQty);
                    cartProductRepository.save(p);
                }
            } else {
                addToCart(userId, variationId, quantity);
            }
        }
        return getCartItems(userId);
    }

    // ─── DTO Methods ──────────────────────────────────────────────────────────

    public List<CartItemDTO> getCartAsDTOs(UUID userId) {
        return getCartItems(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CartItemDTO addToCartAsDTO(UUID userId, UUID variationId, int quantity) {
        return toDTO(addToCart(userId, variationId, quantity));
    }

    public CartItemDTO updateQuantityAsDTO(UUID userId, UUID productId, int quantity) {
        CartProduct cp = updateQuantity(userId, productId, quantity);
        return cp != null ? toDTO(cp) : null;
    }

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
