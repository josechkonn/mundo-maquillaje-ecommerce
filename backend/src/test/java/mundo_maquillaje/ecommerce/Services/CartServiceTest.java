package mundo_maquillaje.ecommerce.Services;

import mundo_maquillaje.ecommerce.Models.Cart;
import mundo_maquillaje.ecommerce.Models.CartProduct;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Repositories.CartProductRepository;
import mundo_maquillaje.ecommerce.Repositories.CartRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductVariationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartProductRepository cartProductRepository;

    @Mock
    private ProductVariationRepository productVariationRepository;

    @InjectMocks
    private CartService cartService;

    private UUID userId;
    private Cart activeCart;
    private ProductVariation variation1;
    private ProductVariation variation2;
    private CartProduct cartProduct1;
    private CartProduct cartProduct2;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setName("Labial");
        product.setSlug("labial");
        product.setCurrency(Currency.builder().code("USD").symbol("$").name("USD").exchangeRate(1.0).decimalPlaces(2).symbolPosition("LEFT").build());

        variation1 = ProductVariation.builder()
                .id(UUID.randomUUID())
                .name("Rojo")
                .price(10.0)
                .stock(50)
                .product(product)
                .images(new ArrayList<>())
                .build();

        variation2 = ProductVariation.builder()
                .id(UUID.randomUUID())
                .name("Rosa")
                .price(12.0)
                .stock(30)
                .product(product)
                .images(new ArrayList<>())
                .build();

        activeCart = Cart.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .status("ACTIVE")
                .products(new ArrayList<>())
                .build();

        cartProduct1 = CartProduct.builder()
                .id(UUID.randomUUID())
                .cart(activeCart)
                .variation(variation1)
                .quantity(2)
                .build();

        cartProduct2 = CartProduct.builder()
                .id(UUID.randomUUID())
                .cart(activeCart)
                .variation(variation2)
                .quantity(1)
                .build();

        activeCart.getProducts().add(cartProduct1);
        activeCart.getProducts().add(cartProduct2);
    }

    @Test
    void syncCart_removesItemsNotInLocalPayload() {
        List<Map<String, Object>> localItems = new ArrayList<>();
        Map<String, Object> localItem = new HashMap<>();
        localItem.put("variationId", variation1.getId().toString());
        localItem.put("quantity", 2);
        localItems.add(localItem);

        when(cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(new ArrayList<>(List.of(activeCart)));
        when(cartRepository.findByIdWithLock(activeCart.getId())).thenReturn(Optional.of(activeCart));
        when(cartProductRepository.findAllByCartIdAndVariationId(activeCart.getId(), variation1.getId()))
                .thenReturn(List.of(cartProduct1));

        List<CartProduct> result = cartService.syncCart(userId, localItems);

        verify(cartProductRepository).deleteAll(argThat((Iterable<CartProduct> list) ->
                list != null && ((List<CartProduct>) list).size() == 1 && ((List<CartProduct>) list).get(0).getVariation().getId().equals(variation2.getId())
        ));
        verify(cartProductRepository, never()).deleteAll(argThat((Iterable<CartProduct> list) ->
                list != null && ((List<CartProduct>) list).stream().anyMatch(cp -> cp.getVariation().getId().equals(variation1.getId()))
        ));
    }

    @Test
    void syncCart_emptyLocalPayloadReturnsCurrentItems() {
        when(cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(new ArrayList<>(List.of(activeCart)));
        when(cartRepository.findByIdWithLock(activeCart.getId())).thenReturn(Optional.of(activeCart));

        List<CartProduct> result = cartService.syncCart(userId, new ArrayList<>());

        assertEquals(2, result.size());
        verify(cartProductRepository, never()).deleteAll(any());
    }

    @Test
    void syncCart_upsertsLocalItems() {
        List<Map<String, Object>> localItems = new ArrayList<>();
        Map<String, Object> localItem = new HashMap<>();
        localItem.put("variationId", variation1.getId().toString());
        localItem.put("quantity", 5);
        localItems.add(localItem);

        when(cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(new ArrayList<>(List.of(activeCart)));
        when(cartRepository.findByIdWithLock(activeCart.getId())).thenReturn(Optional.of(activeCart));
        when(cartProductRepository.findAllByCartIdAndVariationId(activeCart.getId(), variation1.getId()))
                .thenReturn(List.of(cartProduct1));

        cartService.syncCart(userId, localItems);

        verify(cartProductRepository).save(cartProduct1);
        assertEquals(5, cartProduct1.getQuantity());
    }

    @Test
    void clearCart_setsStatusToCompleted() {
        when(cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(new ArrayList<>(List.of(activeCart)));

        cartService.clearCart(userId);

        assertEquals("COMPLETED", activeCart.getStatus());
        assertTrue(activeCart.getProducts().isEmpty());
        verify(cartRepository).save(activeCart);
    }

    @Test
    void getOrCreateActiveCart_doesNotReturnCompletedCart() {
        when(cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(new ArrayList<>());

        Cart newCart = Cart.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .status("ACTIVE")
                .build();
        when(cartRepository.save(any())).thenReturn(newCart);

        cartService.getCartItems(userId);

        verify(cartRepository).save(argThat(cart -> "ACTIVE".equals(cart.getStatus())));
    }

    @Test
    void addToCart_outOfStockThrowsException() {
        ProductVariation noStockVariation = ProductVariation.builder()
                .id(UUID.randomUUID())
                .name("Agotado")
                .price(10.0)
                .stock(0)
                .product(new Product())
                .build();

        when(cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(new ArrayList<>(List.of(activeCart)));
        when(cartRepository.findByIdWithLock(activeCart.getId())).thenReturn(Optional.of(activeCart));
        when(productVariationRepository.findById(noStockVariation.getId()))
                .thenReturn(Optional.of(noStockVariation));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                cartService.addToCart(userId, noStockVariation.getId(), 1));

        assertTrue(ex.getMessage().contains("agotado"));
    }

    @Test
    void addToCart_insufficientStockThrowsException() {
        when(cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(new ArrayList<>(List.of(activeCart)));
        when(cartRepository.findByIdWithLock(activeCart.getId())).thenReturn(Optional.of(activeCart));
        when(productVariationRepository.findById(variation1.getId()))
                .thenReturn(Optional.of(variation1));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                cartService.addToCart(userId, variation1.getId(), 100));

        assertTrue(ex.getMessage().contains("Stock insuficiente"));
    }

    @Test
    void syncCart_collectionInMemoryIsConsistentAfterDelete() {
        List<Map<String, Object>> localItems = new ArrayList<>();
        Map<String, Object> localItem = new HashMap<>();
        localItem.put("variationId", variation1.getId().toString());
        localItem.put("quantity", 2);
        localItems.add(localItem);

        when(cartRepository.findAllByUserIdAndStatus(userId, "ACTIVE"))
                .thenReturn(new ArrayList<>(List.of(activeCart)));
        when(cartRepository.findByIdWithLock(activeCart.getId())).thenReturn(Optional.of(activeCart));
        when(cartProductRepository.findAllByCartIdAndVariationId(activeCart.getId(), variation1.getId()))
                .thenReturn(List.of(cartProduct1));

        List<CartProduct> result = cartService.syncCart(userId, localItems);

        assertTrue(activeCart.getProducts().stream()
                .noneMatch(cp -> cp.getVariation().getId().equals(variation2.getId())));
    }
}
