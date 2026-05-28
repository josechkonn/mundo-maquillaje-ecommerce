package mundo_maquillaje.ecommerce.Services;

import mundo_maquillaje.ecommerce.DTO.OrderListResponseDTO;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.Order;
import mundo_maquillaje.ecommerce.Models.OrderProduct;
import mundo_maquillaje.ecommerce.Models.OrderStatus;
import mundo_maquillaje.ecommerce.Models.PaymentMethod;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Repositories.OrderProductRepository;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import mundo_maquillaje.ecommerce.Repositories.TransactionRepository;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderProductRepository orderProductRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ProfileService profileService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private OrderService orderService;

    private UUID userId;
    private Profile profile;
    private Order order1;
    private Order order2;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        profile = Profile.builder().id(userId).email("test@test.com").build();

        Currency currency = Currency.builder()
                .id(UUID.randomUUID())
                .code("USD")
                .symbol("$")
                .name("Dólar")
                .exchangeRate(1.0)
                .decimalPlaces(2)
                .symbolPosition("LEFT")
                .build();

        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setId(UUID.randomUUID());
        paymentMethod.setName("Transferencia");
        paymentMethod.setSlug("transferencia");
        paymentMethod.setCurrency(currency);

        order1 = new Order();
        order1.setId(UUID.randomUUID());
        order1.setProfile(profile);
        order1.setOrderNumber("MM-001");
        order1.setSubtotal(100.0);
        order1.setTaxAmount(16.0);
        order1.setDiscountAmount(0.0);
        order1.setShippingCost(5.0);
        order1.setTotalAmount(121.0);
        order1.setStatus(OrderStatus.PENDING);
        order1.setCreatedAt(LocalDateTime.of(2026, 5, 28, 10, 0));
        order1.setUpdatedAt(LocalDateTime.of(2026, 5, 28, 10, 0));
        order1.setCurrency(currency);
        order1.setPaymentMethod(paymentMethod);
        order1.setShippingAddress(null);

        order2 = new Order();
        order2.setId(UUID.randomUUID());
        order2.setProfile(profile);
        order2.setOrderNumber("MM-002");
        order2.setSubtotal(200.0);
        order2.setTaxAmount(32.0);
        order2.setDiscountAmount(10.0);
        order2.setShippingCost(0.0);
        order2.setTotalAmount(222.0);
        order2.setStatus(OrderStatus.DELIVERED);
        order2.setCreatedAt(LocalDateTime.of(2026, 5, 27, 10, 0));
        order2.setUpdatedAt(LocalDateTime.of(2026, 5, 28, 15, 0));
        order2.setCurrency(currency);
        order2.setPaymentMethod(paymentMethod);
        order2.setShippingAddress(null);

        when(profileService.getUserIdFromAuthentication(authentication)).thenReturn(userId);
        when(profileService.getProfile(userId)).thenReturn(profile);
    }

    @Test
    void getUserOrders_sortByCreatedAtAscending() {
        Page<Order> page = new PageImpl<>(List.of(order2, order1));
        when(orderRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<OrderListResponseDTO> result = orderService.getUserOrders(
                authentication, 0, 10, null, null, "createdAt", false, null, null);

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals("MM-002", result.getContent().get(0).getOrderNumber());
        verify(orderRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void getUserOrders_sortByTotalAmountDescending() {
        Page<Order> page = new PageImpl<>(List.of(order2, order1));
        when(orderRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<OrderListResponseDTO> result = orderService.getUserOrders(
                authentication, 0, 10, null, null, "totalAmount", true, null, null);

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals(222.0, result.getContent().get(0).getTotalAmount());
    }

    @Test
    void getUserOrders_withStatusFilter() {
        Page<Order> page = new PageImpl<>(List.of(order1));
        when(orderRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<OrderListResponseDTO> result = orderService.getUserOrders(
                authentication, 0, 10, null, "PENDING", "createdAt", true, null, null);

        assertEquals(1, result.getContent().size());
        assertEquals("PENDING", result.getContent().get(0).getStatus());
    }

    @Test
    void getUserOrders_withInvalidStatusFilter() {
        Page<Order> page = new PageImpl<>(List.of(order1, order2));
        when(orderRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<OrderListResponseDTO> result = orderService.getUserOrders(
                authentication, 0, 10, null, "INVALID_STATUS", "createdAt", true, null, null);

        assertEquals(2, result.getContent().size());
    }

    @Test
    void getUserOrders_withDateRange() {
        Page<Order> page = new PageImpl<>(List.of(order1));
        when(orderRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<OrderListResponseDTO> result = orderService.getUserOrders(
                authentication, 0, 10, null, null, "createdAt", true, "2026-05-28", "2026-05-28");

        assertEquals(1, result.getContent().size());
    }

    @Test
    void getUserOrders_withSearchByOrderNumber() {
        Page<Order> page = new PageImpl<>(List.of(order1));
        when(orderRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<OrderListResponseDTO> result = orderService.getUserOrders(
                authentication, 0, 10, "MM-001", null, "createdAt", true, null, null);

        assertEquals(1, result.getContent().size());
    }

    @Test
    void getUserOrders_emptyPageReturnsEmpty() {
        when(orderRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(Page.empty());

        Page<OrderListResponseDTO> result = orderService.getUserOrders(
                authentication, 0, 10, null, null, "createdAt", true, null, null);

        assertTrue(result.isEmpty());
        verify(orderProductRepository, never()).findByOrderIdIn(anyList());
    }

    @Test
    void getUserOrderById_validOrderReturnsDTO() {
        when(orderRepository.findByIdAndProfileWithDetails(order1.getId(), profile))
                .thenReturn(Optional.of(order1));

        List<OrderProduct> products = new ArrayList<>();
        when(orderProductRepository.findByOrderIdIn(anyList())).thenReturn(products);
        when(transactionRepository.findByOrderIdIn(anyList())).thenReturn(new ArrayList<>());

        OrderListResponseDTO result = orderService.getUserOrderById(authentication, order1.getId());

        assertNotNull(result);
        assertEquals(order1.getId().toString(), result.getId());
        assertEquals("MM-001", result.getOrderNumber());
        assertEquals(100.0, result.getSubtotal());
        assertEquals(121.0, result.getTotalAmount());
        assertEquals("PENDING", result.getStatus());
    }

    @Test
    void getUserOrderById_orderNotFoundThrows404() {
        UUID randomId = UUID.randomUUID();
        when(orderRepository.findByIdAndProfileWithDetails(randomId, profile))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                orderService.getUserOrderById(authentication, randomId));
    }

    @Test
    void getUserOrderById_dtoMappingIncludesProducts() {
        when(orderRepository.findByIdAndProfileWithDetails(order1.getId(), profile))
                .thenReturn(Optional.of(order1));

        OrderProduct product = new OrderProduct();
        product.setId(UUID.randomUUID());
        product.setProductName("Labial Rojo");
        product.setVariationName("Mate");
        product.setPrice(50.0);
        product.setQuantity(2);
        product.setSubtotal(100.0);
        product.setDiscount(0.0);
        product.setTaxAmount(8.0);

        when(orderProductRepository.findByOrderIdIn(anyList()))
                .thenReturn(List.of(product));
        when(transactionRepository.findByOrderIdIn(anyList()))
                .thenReturn(new ArrayList<>());

        OrderListResponseDTO result = orderService.getUserOrderById(authentication, order1.getId());

        assertEquals(1, result.getProducts().size());
        assertEquals("Labial Rojo", result.getProducts().get(0).getProductName());
        assertEquals(2, result.getProducts().get(0).getQuantity());
    }
}
