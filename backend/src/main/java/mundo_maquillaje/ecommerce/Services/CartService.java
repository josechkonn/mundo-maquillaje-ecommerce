package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Cart;
import mundo_maquillaje.ecommerce.Models.CartProduct;
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
        cartRepository.save(cart);
    }

    @Transactional
    public List<CartProduct> syncCart(UUID userId, List<Map<String, Object>> localItems) {
        Cart cart = getOrCreateActiveCart(userId);
        
        for (Map<String, Object> localItem : localItems) {
            UUID variationId = UUID.fromString((String) localItem.get("variationId"));
            int quantity = ((Number) localItem.get("quantity")).intValue();

            Optional<CartProduct> existing = cartProductRepository.findByCartIdAndVariationId(cart.getId(), variationId);
            if (existing.isPresent()) {
                CartProduct p = existing.get();
                if (quantity > p.getQuantity()) {
                    p.setQuantity(Math.min(quantity, p.getVariation().getStock()));
                    cartProductRepository.save(p);
                }
            } else {
                try {
                    addToCart(userId, variationId, quantity);
                } catch (Exception ignored) {}
            }
        }
        return getCartItems(userId);
    }
}
