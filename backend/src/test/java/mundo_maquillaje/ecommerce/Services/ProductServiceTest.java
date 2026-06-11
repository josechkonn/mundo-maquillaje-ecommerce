package mundo_maquillaje.ecommerce.Services;

import mundo_maquillaje.ecommerce.Models.Category;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Repositories.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        product = Product.builder()
                .id(productId)
                .name("Labial Rojo")
                .slug("labial-rojo")
                .isActive(true)
                .variations(new ArrayList<>())
                .build();
    }

    // ─── getAllProducts ───────────────────────────────────────────────────

    @Test
    void getAllProducts_returnsList() {
        when(productRepository.findAll()).thenReturn(List.of(product));
        assertEquals(1, productService.getAllProducts().size());
    }

    // ─── getProductById ───────────────────────────────────────────────────

    @Test
    void getProductById_found_returnsProduct() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        assertSame(product, productService.getProductById(productId));
    }

    @Test
    void getProductById_notFound_throwsRuntimeException() {
        when(productRepository.findById(productId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> productService.getProductById(productId));
    }

    // ─── getProductBySlug ─────────────────────────────────────────────────

    @Test
    void getProductBySlug_found_returnsProduct() {
        when(productRepository.findBySlug("labial-rojo")).thenReturn(Optional.of(product));
        assertSame(product, productService.getProductBySlug("labial-rojo"));
    }

    @Test
    void getProductBySlug_notFound_throwsRuntimeException() {
        when(productRepository.findBySlug("no-existe")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> productService.getProductBySlug("no-existe"));
    }

    // ─── createProduct ────────────────────────────────────────────────────

    @Test
    void createProduct_withSlug_usesProvidedSlug() {
        Product input = Product.builder().name("Labial").slug("mi-slug").build();
        when(productRepository.save(any())).thenReturn(input);

        var result = productService.createProduct(input);
        assertEquals("mi-slug", result.getSlug());
    }

    @Test
    void createProduct_withoutSlug_generatesSlug() {
        Product input = Product.builder().name("Labial Rojo").build();
        when(productRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = productService.createProduct(input);
        assertTrue(result.getSlug().matches("labial-rojo"));
    }

    @Test
    void createProduct_withoutVariations_createsDefaultVariation() {
        Product input = Product.builder().name("Test").build();
        when(productRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = productService.createProduct(input);
        assertEquals(1, result.getVariations().size());
        assertEquals("Estándar", result.getVariations().get(0).getName());
    }

    @Test
    void createProduct_withVariations_setsProductRef() {
        ProductVariation v = ProductVariation.builder().name("Rojo").price(10.0).stock(5).build();
        Product input = Product.builder().name("Test").variations(new ArrayList<>(List.of(v))).build();
        when(productRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = productService.createProduct(input);
        assertSame(result, result.getVariations().get(0).getProduct());
    }

    @Test
    void createProduct_setsDefaultAlertQuantity() {
        ProductVariation v = ProductVariation.builder().name("Rojo").price(10.0).stock(5).alertQuantity(null).build();
        Product input = Product.builder().name("Test").variations(new ArrayList<>(List.of(v))).build();
        when(productRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = productService.createProduct(input);
        assertEquals(5, result.getVariations().get(0).getAlertQuantity());
    }

    // ─── updateProduct ────────────────────────────────────────────────────

    @Test
    void updateProduct_updatesFields() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Product details = Product.builder().name("Nuevo Nombre").isActive(false).build();

        var result = productService.updateProduct(productId, details);
        assertEquals("Nuevo Nombre", result.getName());
        assertFalse(result.getIsActive());
    }

    @Test
    void updateProduct_generatesNewSlugWhenEmpty() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Product details = Product.builder().name("Nuevo Producto").slug("").build();
        var result = productService.updateProduct(productId, details);
        assertTrue(result.getSlug().contains("nuevo-producto"));
    }

    @Test
    void updateProduct_notFound_throwsException() {
        when(productRepository.findById(productId)).thenReturn(Optional.empty());
        Product details = Product.builder().name("X").build();
        assertThrows(RuntimeException.class, () -> productService.updateProduct(productId, details));
    }

    // ─── deleteProduct ────────────────────────────────────────────────────

    @Test
    void deleteProduct_deletesExisting() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        productService.deleteProduct(productId);
        verify(productRepository).delete(product);
    }

    @Test
    void deleteProduct_notFound_throwsException() {
        when(productRepository.findById(productId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> productService.deleteProduct(productId));
    }

    // ─── getPriceRange ────────────────────────────────────────────────────

    @Test
    void getPriceRange_returnsMinMax() {
        when(productRepository.getMinMaxPrices()).thenReturn(
                Collections.singletonList(new Object[]{10.0, 500.0}));
        var range = productService.getPriceRange();
        assertEquals(10.0, range.get("min"), 0.001);
        assertEquals(500.0, range.get("max"), 0.001);
    }

    @Test
    void getPriceRange_emptyResult_returnsDefaults() {
        when(productRepository.getMinMaxPrices()).thenReturn(List.of());
        var range = productService.getPriceRange();
        assertEquals(0.0, range.get("min"), 0.001);
        assertEquals(100000.0, range.get("max"), 0.001);
    }

    // ─── searchProducts ───────────────────────────────────────────────────

    @Test
    void searchProducts_delegatesToRepository() {
        var pageable = PageRequest.of(0, 10);
        when(productRepository.searchProducts("labial", pageable))
                .thenReturn(new PageImpl<>(List.of(product)));
        var result = productService.searchProducts("labial", pageable);
        assertEquals(1, result.getTotalElements());
    }

    // ─── getBestSellers ───────────────────────────────────────────────────

    @Test
    void getBestSellers_empty_returnsEmptyPage() {
        var pageable = PageRequest.of(0, 10);
        when(productRepository.findBestSellerIds(pageable)).thenReturn(List.of());
        var result = productService.getBestSellers(pageable);
        assertTrue(result.isEmpty());
    }

    @Test
    void getBestSellers_orderedCorrectly() {
        var pageable = PageRequest.of(0, 10);
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        Product p1 = Product.builder().id(id1).name("B").build();
        Product p2 = Product.builder().id(id2).name("A").build();

        when(productRepository.findBestSellerIds(pageable)).thenReturn(List.of(id2, id1));
        when(productRepository.findByIdsInWithGraph(any()))
                .thenReturn(new ArrayList<>(List.of(p1, p2))); // mutable list

        var result = productService.getBestSellers(pageable);
        assertEquals("A", result.getContent().get(0).getName()); // id2 first
        assertEquals("B", result.getContent().get(1).getName());
    }

    // ─── getFilteredProducts ──────────────────────────────────────────────

    @Test
    void getFilteredProducts_usesSpecifications() {
        when(productRepository.findExchangeRateByCode("VES")).thenReturn(50.0);
        when(productRepository.findExchangeRateByCode("COP")).thenReturn(100.0);
        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(product)));

        var result = productService.getFilteredProducts("labial", null, null,
                null, null, null, null, null, 0, 10);
        assertEquals(1, result.getTotalElements());
    }
}
