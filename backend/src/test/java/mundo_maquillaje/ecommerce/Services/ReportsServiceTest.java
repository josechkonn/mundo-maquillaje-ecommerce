package mundo_maquillaje.ecommerce.Services;

import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.OrderStatus;
import mundo_maquillaje.ecommerce.Models.Product;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Models.TransactionType;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductVariationRepository;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import mundo_maquillaje.ecommerce.Repositories.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportsServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ProductVariationRepository productVariationRepository;
    @Mock private ProfileRepository profileRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private DashboardService dashboardService;

    @InjectMocks
    private ReportsService reportsService;

    private Currency usd;
    private Currency ves;
    private Product productUSD;
    private Product productVES;
    private ProductVariation varUSD1;
    private ProductVariation varUSD2;
    private ProductVariation varVES1;
    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        usd = Currency.builder()
                .id(UUID.randomUUID()).code("USD").name("US Dollar").symbol("$")
                .exchangeRate(1.0).decimalPlaces(2).symbolPosition("LEFT")
                .isActive(true).build();

        ves = Currency.builder()
                .id(UUID.randomUUID()).code("VES").name("Bolívar").symbol("Bs")
                .exchangeRate(3688.50).decimalPlaces(2).symbolPosition("RIGHT")
                .isActive(true).build();

        productUSD = Product.builder()
                .id(UUID.randomUUID()).name("Labial").slug("labial")
                .currency(usd).isActive(true).variations(new ArrayList<>()).build();

        productVES = Product.builder()
                .id(UUID.randomUUID()).name("Base").slug("base")
                .currency(ves).isActive(true).variations(new ArrayList<>()).build();

        varUSD1 = ProductVariation.builder()
                .id(UUID.randomUUID()).name("Rojo").sku("LAB-RJ")
                .price(15.0).stock(50).alertQuantity(5).isActive(true)
                .product(productUSD).attributeName("Color").attributeValue("Rojo")
                .build();

        varUSD2 = ProductVariation.builder()
                .id(UUID.randomUUID()).name("Rosa").sku("LAB-RS")
                .price(15.0).stock(2).alertQuantity(5).isActive(true)
                .product(productUSD).attributeName("Color").attributeValue("Rosa")
                .build();

        varVES1 = ProductVariation.builder()
                .id(UUID.randomUUID()).name("Mate").sku("BAS-MT")
                .price(250.0).stock(0).alertQuantity(10).isActive(true)
                .product(productVES).attributeName("Tono").attributeValue("Mate")
                .build();

        startDate = LocalDate.of(2024, 1, 1);
        endDate = LocalDate.of(2024, 1, 31);
    }

    // ─── Sales Report ──────────────────────────────────────────────────────

    @Test
    void getSalesReport_withCurrency_returnsRows() {
        Object[] row = new Object[]{"ORD-001", LocalDateTime.now(), "Cliente A", 100.0, "USD", "$", "PAID"};
        when(orderRepository.findSalesReportByCurrency(eq("USD"), any(), any()))
                .thenReturn(Collections.singletonList(row));

        var result = reportsService.getSalesReport("USD", startDate, endDate);

        assertEquals(1, result.size());
        assertEquals("ORD-001", result.get(0).get("orderNumber"));
        assertEquals("PAID", result.get(0).get("status"));
    }

    @Test
    void getSalesReport_withoutCurrency_returnsRows() {
        Object[] row = new Object[]{"ORD-002", LocalDateTime.now(), "Cliente B", 50.0, "USD", "$", "PAID"};
        when(orderRepository.findSalesReport(any(), any())).thenReturn(Collections.singletonList(row));

        var result = reportsService.getSalesReport(null, startDate, endDate);

        assertEquals(1, result.size());
        assertEquals("ORD-002", result.get(0).get("orderNumber"));
    }

    @Test
    void getSalesReport_emptyResult_returnsEmptyList() {
        when(orderRepository.findSalesReportByCurrency(eq("USD"), any(), any()))
                .thenReturn(Collections.emptyList());

        var result = reportsService.getSalesReport("USD", startDate, endDate);

        assertTrue(result.isEmpty());
    }

    // ─── Stock Report ──────────────────────────────────────────────────────

    @Test
    void getStockReport_filtersByCurrency() {
        when(productVariationRepository.findAll()).thenReturn(List.of(varUSD1, varUSD2, varVES1));

        var result = reportsService.getStockReport("USD");

        List<Map<String, Object>> items = (List<Map<String, Object>>) result.get("items");
        assertEquals(2, items.size());
        assertEquals(52, result.get("totalStock"));
        assertEquals(0, result.get("outOfStockCount"));
        assertEquals(1, result.get("lowStockCount"));
    }

    @Test
    void getStockReport_returnsAllWhenCurrencyNull() {
        when(productVariationRepository.findAll()).thenReturn(List.of(varUSD1, varUSD2, varVES1));

        var result = reportsService.getStockReport(null);

        List<Map<String, Object>> items = (List<Map<String, Object>>) result.get("items");
        assertEquals(3, items.size());
    }

    @Test
    void getStockReport_countsOutOfStock() {
        var outOfStock = ProductVariation.builder()
                .id(UUID.randomUUID()).name("Agotado").price(10.0).stock(0).alertQuantity(5)
                .isActive(true).product(productUSD).build();
        when(productVariationRepository.findAll()).thenReturn(List.of(outOfStock));

        var result = reportsService.getStockReport(null);

        assertEquals(1, result.get("outOfStockCount"));
        assertEquals(0, result.get("lowStockCount"));
        assertEquals(0, result.get("totalStock"));
    }

    @Test
    void getStockReport_countsLowStock() {
        var lowStock = ProductVariation.builder()
                .id(UUID.randomUUID()).name("Bajo").price(10.0).stock(3).alertQuantity(5)
                .isActive(true).product(productUSD).build();
        when(productVariationRepository.findAll()).thenReturn(List.of(lowStock));

        var result = reportsService.getStockReport(null);

        assertEquals(1, result.get("lowStockCount"));
        assertEquals(0, result.get("outOfStockCount"));
    }

    @Test
    void getStockReport_calculatesTotalValue() {
        when(productVariationRepository.findAll()).thenReturn(List.of(varUSD1, varUSD2));

        var result = reportsService.getStockReport(null);

        assertEquals(15.0 * 50 + 15.0 * 2, (Double) result.get("totalValue"), 0.001);
    }

    @Test
    void getStockReport_skipsVariationsWithNullProduct() {
        var orphan = ProductVariation.builder()
                .id(UUID.randomUUID()).name("Huérfano").price(10.0).stock(5)
                .isActive(true).product(null).build();
        when(productVariationRepository.findAll()).thenReturn(List.of(orphan, varUSD1));

        var result = reportsService.getStockReport(null);

        List<Map<String, Object>> items = (List<Map<String, Object>>) result.get("items");
        assertEquals(1, items.size());
    }

    // ─── Orders Report ─────────────────────────────────────────────────────

    @Test
    void getOrdersReport_withStatusFilter() {
        Object[] row = new Object[]{"ORD-001", LocalDateTime.now(), "Cliente", 100.0, "USD", "$", "PAID"};
        when(orderRepository.findOrdersReport(eq(OrderStatus.PAID), any(), any()))
                .thenReturn(Collections.singletonList(row));

        var result = reportsService.getOrdersReport("PAID", startDate, endDate);

        assertEquals(1, result.size());
        assertEquals("PAID", result.get(0).get("status"));
    }

    @Test
    void getOrdersReport_withInvalidStatus_returnsAll() {
        Object[] row = new Object[]{"ORD-001", LocalDateTime.now(), "Cliente", 100.0, "USD", "$", "PAID"};
        when(orderRepository.findOrdersReport(isNull(), any(), any()))
                .thenReturn(Collections.singletonList(row));

        var result = reportsService.getOrdersReport("INVALID_STATUS", startDate, endDate);

        assertEquals(1, result.size());
    }

    @Test
    void getOrdersReport_withoutStatus_returnsAll() {
        Object[] row = new Object[]{"ORD-001", LocalDateTime.now(), "Cliente", 100.0, "USD", "$", "PAID"};
        when(orderRepository.findOrdersReport(isNull(), any(), any()))
                .thenReturn(Collections.singletonList(row));

        var result = reportsService.getOrdersReport(null, startDate, endDate);

        assertEquals(1, result.size());
    }

    // ─── Customers Report ──────────────────────────────────────────────────

    @Test
    void getCustomersReport_returnsSummary() {
        when(profileRepository.countNewRegistrationsByDate(any(), any()))
                .thenReturn(List.of());
        when(profileRepository.findTopCustomersByCurrency(any(), any(), any()))
                .thenReturn(List.of());
        when(profileRepository.count()).thenReturn(10L);
        when(profileRepository.countByLastAccessAtAfter(any())).thenReturn(5L);

        var result = reportsService.getCustomersReport("USD", startDate, endDate);

        assertEquals(10L, result.get("totalCustomers"));
        assertEquals(5L, result.get("activeCustomers"));
        assertNotNull(result.get("newRegistrations"));
        assertNotNull(result.get("topCustomers"));
    }

    // ─── Best Sellers ──────────────────────────────────────────────────────

    @Test
    void getBestSellers_returnsLimitedResults() {
        Object[] row1 = new Object[]{"Producto A", "Var1", 10, 500.0};
        Object[] row2 = new Object[]{"Producto B", "Var2", 5, 250.0};
        when(orderRepository.findBestSellers(eq("USD"), any(), any()))
                .thenReturn(List.of(row1, row2));

        var result = reportsService.getBestSellers("USD", startDate, endDate, 1);

        assertEquals(1, result.size());
        assertEquals("Producto A", result.get(0).get("productName"));
    }

    @Test
    void getBestSellers_empty_returnsEmpty() {
        when(orderRepository.findBestSellers(eq("USD"), any(), any()))
                .thenReturn(Collections.emptyList());

        var result = reportsService.getBestSellers("USD", startDate, endDate, 10);

        assertTrue(result.isEmpty());
    }

    // ─── Revenue by Category ───────────────────────────────────────────────

    @Test
    void getRevenueByCategory_delegatesToDashboardService() {
        when(dashboardService.getTopCategories(eq("USD"), any(), any()))
                .thenReturn(Map.of("categories", List.of()));

        var result = reportsService.getRevenueByCategory("USD", startDate, endDate);

        assertNotNull(result.get("categories"));
        verify(dashboardService).getTopCategories("USD", startDate, endDate);
    }

    // ─── Transactions Report ───────────────────────────────────────────────

    @Test
    void getTransactionsReport_withTypeFilter() {
        Object[] row = new Object[]{UUID.randomUUID(), "ORDER_PAYMENT", "COMPLETED", 100.0, LocalDateTime.now(), "desc", "USD", "$", "Efectivo", "Caja1"};
        when(transactionRepository.findTransactionReport(eq(TransactionType.ORDER_PAYMENT), any(), any()))
                .thenReturn(Collections.singletonList(row));

        var result = reportsService.getTransactionsReport("ORDER_PAYMENT", startDate, endDate);

        assertEquals(1, result.size());
    }

    @Test
    void getTransactionsReport_withInvalidType_returnsAll() {
        Object[] row = new Object[]{UUID.randomUUID(), "ORDER_PAYMENT", "COMPLETED", 100.0, LocalDateTime.now(), "desc", "USD", "$", "Efectivo", "Caja1"};
        when(transactionRepository.findTransactionReport(isNull(), any(), any()))
                .thenReturn(Collections.singletonList(row));

        var result = reportsService.getTransactionsReport("INVALID", startDate, endDate);

        assertEquals(1, result.size());
    }

    // ─── Conversion Report ─────────────────────────────────────────────────

    @Test
    void getConversionReport_delegatesToDashboardService() {
        var visits = new LinkedHashMap<String, Long>();
        visits.put("label", 0L);
        visits.put("count", 100L);
        var cart = new LinkedHashMap<String, Long>();
        cart.put("label", 0L);
        cart.put("count", 30L);
        var funnel = new LinkedHashMap<String, Map<String, Long>>();
        funnel.put("visits", visits);
        funnel.put("cart", cart);
        when(dashboardService.getConversionFunnel(any(), any())).thenReturn(funnel);

        var result = reportsService.getConversionReport(startDate, endDate);

        assertEquals(100L, result.get("visits").get("count"));
        verify(dashboardService).getConversionFunnel(startDate, endDate);
    }
}
