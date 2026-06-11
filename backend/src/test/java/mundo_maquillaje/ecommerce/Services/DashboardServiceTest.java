package mundo_maquillaje.ecommerce.Services;

import mundo_maquillaje.ecommerce.Repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private TrackingEventRepository trackingEventRepository;
    @Mock private ProfileRepository profileRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private CartRepository cartRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2024, 1, 1);
        endDate = LocalDate.of(2024, 1, 31);
    }

    // ─── Sales Summary ────────────────────────────────────────────────────

    @Test
    void getSalesSummary_currentAndPrevious() {
        when(transactionRepository.sumRevenueByCurrencyAndDate(eq("USD"), any(), any()))
                .thenReturn(5000.0, 4000.0);  // current=5000, previous=4000

        var result = dashboardService.getSalesSummary("USD", startDate, endDate);

        assertEquals(5000.0, (Double) result.get("current"), 0.001);
        assertEquals(4000.0, (Double) result.get("previous"), 0.001);
        assertEquals(25.0, (Double) result.get("change"), 0.001);  // (5000-4000)/4000*100 = 25
    }

    @Test
    void getSalesSummary_zeroPrevious_returnsZeroChange() {
        when(transactionRepository.sumRevenueByCurrencyAndDate(eq("USD"), any(), any()))
                .thenReturn(5000.0, 0.0);

        var result = dashboardService.getSalesSummary("USD", startDate, endDate);

        assertEquals(0.0, (Double) result.get("change"), 0.001);
    }

    // ─── Orders Summary ───────────────────────────────────────────────────

    @Test
    void getOrdersSummary_currentAndPrevious() {
        when(orderRepository.countOrdersByStatusAndDate(any(), any()))
                .thenReturn(150L, 100L);

        var result = dashboardService.getOrdersSummary(startDate, endDate);

        assertEquals(150L, ((Number) result.get("current")).longValue());
        assertEquals(100L, ((Number) result.get("previous")).longValue());
        assertEquals(50.0, (Double) result.get("change"), 0.001);
    }

    @Test
    void getOrdersSummary_zeroPrevious_returnsZeroChange() {
        when(orderRepository.countOrdersByStatusAndDate(any(), any()))
                .thenReturn(50L, 0L);

        var result = dashboardService.getOrdersSummary(startDate, endDate);

        assertEquals(0.0, (Double) result.get("change"), 0.001);
    }

    // ─── Visitors Summary ─────────────────────────────────────────────────

    @Test
    void getVisitorsSummary_returnsCountAndChange() {
        when(trackingEventRepository.countUniqueVisitors(any(), any()))
                .thenReturn(1000L, 800L);

        var result = dashboardService.getVisitorsSummary(startDate, endDate);

        assertEquals(1000L, ((Number) result.get("current")).longValue());
        assertEquals(800L, ((Number) result.get("previous")).longValue());
    }

    // ─── Revenue Over Time ────────────────────────────────────────────────

    @Test
    void getRevenueOverTime_byDay_buildsDailyBuckets() {
        // Mock 5 days of data
        when(transactionRepository.findRevenueOverTime(eq("USD"), any(), any()))
                .thenReturn(List.of(
                        new Object[]{"2024-01-01", 100.0},
                        new Object[]{"2024-01-02", 200.0}
                ));
        when(orderRepository.findOrdersOverTime(eq("USD"), any(), any()))
                .thenReturn(Collections.singletonList(
                        new Object[]{"2024-01-01", 5L}
                ));

        var result = dashboardService.getRevenueOverTime("USD",
                LocalDate.of(2024, 1, 1), LocalDate.of(2024, 1, 3), "day");

        List<String> labels = (List<String>) result.get("labels");
        List<Double> revenues = (List<Double>) result.get("revenues");

        assertEquals(3, labels.size());
        assertEquals(100.0, revenues.get(0), 0.001);
        assertEquals(200.0, revenues.get(1), 0.001);
        assertEquals(0.0, revenues.get(2), 0.001);
    }

    @Test
    void getRevenueOverTime_byMonth_buildsMonthlyBuckets() {
        when(transactionRepository.findRevenueOverTimeByMonth(eq("USD"), any(), any()))
                .thenReturn(Collections.singletonList(new Object[]{"2024-01", 5000.0}));
        when(orderRepository.findOrdersOverTimeByMonth(eq("USD"), any(), any()))
                .thenReturn(Collections.singletonList(new Object[]{"2024-01", 30L}));

        var result = dashboardService.getRevenueOverTime("USD",
                LocalDate.of(2024, 1, 1), LocalDate.of(2024, 2, 29), "month");

        List<String> labels = (List<String>) result.get("labels");
        assertEquals(2, labels.size());
        assertEquals("2024-01", labels.get(0));
        assertEquals("2024-02", labels.get(1));
    }

    // ─── Sales by Currency ────────────────────────────────────────────────

    @Test
    void getSalesByCurrency_returnsWithPercentages() {
        when(transactionRepository.findRevenueGroupedByCurrency(any(), any()))
                .thenReturn(List.of(
                        new Object[]{"USD", "$", 7500.0},
                        new Object[]{"VES", "Bs", 2500.0}
                ));

        var result = dashboardService.getSalesByCurrency(startDate, endDate);

        assertEquals(2, result.size());
        assertEquals("USD", result.get(0).get("currencyCode"));
        assertEquals(75.0, (Double) result.get(0).get("percentage"), 0.1);
    }

    // ─── Orders by Currency ───────────────────────────────────────────────

    @Test
    void getOrdersByCurrency_returnsWithPercentages() {
        when(orderRepository.findOrdersGroupedByCurrency(any(), any()))
                .thenReturn(List.of(
                        new Object[]{"USD", "$", 30L},
                        new Object[]{"VES", "Bs", 10L}
                ));

        var result = dashboardService.getOrdersByCurrency(startDate, endDate);

        assertEquals(2, result.size());
        assertEquals(30L, ((Number) result.get(0).get("count")).longValue());
        assertEquals(75.0, (Double) result.get(0).get("percentage"), 0.1);
    }

    // ─── Orders by Status ─────────────────────────────────────────────────

    @Test
    void getOrdersByStatus_returnsGroupedCounts() {
        when(orderRepository.countOrdersByStatus(any(), any()))
                .thenReturn(List.of(
                        new Object[]{"PAID", 50L},
                        new Object[]{"PENDING", 20L}
                ));

        var result = dashboardService.getOrdersByStatus(startDate, endDate);

        assertEquals(70L, ((Number) result.get("total")).longValue());
        Map<String, Long> byStatus = (Map<String, Long>) result.get("byStatus");
        assertEquals(50L, byStatus.get("PAID").longValue());
    }

    // ─── Top Categories ───────────────────────────────────────────────────

    @Test
    void getTopCategories_returnsAttributedRevenue() {
        UUID orderId = UUID.randomUUID();
        // row = [categoryName, orderAmount, lineTotal, discount, orderId]
        when(transactionRepository.findTransactionLinesForCategories(eq("USD"), any(), any()))
                .thenReturn(List.of(
                        new Object[]{"Labiales", 100.0, 60.0, 0.0, orderId},
                        new Object[]{"Bases", 100.0, 40.0, 0.0, orderId}
                ));

        var result = dashboardService.getTopCategories("USD", startDate, endDate);

        List<Map<String, Object>> categories = (List<Map<String, Object>>) result.get("categories");
        assertEquals(2, categories.size());
        assertEquals("Labiales", categories.get(0).get("name"));
        assertEquals(60.0, (Double) categories.get(0).get("total"), 0.001);
    }

    // ─── Conversion Funnel ────────────────────────────────────────────────

    @Test
    void getConversionFunnel_mapsEventTypes() {
        when(trackingEventRepository.countConversionEvents(any(), any()))
                .thenReturn(List.of(
                        new Object[]{"PRODUCT_VIEW", 1000L},
                        new Object[]{"ADD_TO_CART", 200L},
                        new Object[]{"CHECKOUT_START", 50L},
                        new Object[]{"PURCHASE", 10L}
                ), List.of());  // prev results empty
        when(cartRepository.countUnpaidCarts(any(), any())).thenReturn(5L, 3L);

        var result = dashboardService.getConversionFunnel(startDate, endDate);

        Map<String, Long> current = result.get("current");
        assertEquals(1000L, current.get("productViews").longValue());
        assertEquals(200L, current.get("addToCart").longValue());
        assertEquals(10L, current.get("purchase").longValue());
        assertEquals(5L, current.get("unpaidCarts").longValue());
    }

    // ─── Active Users ─────────────────────────────────────────────────────

    @Test
    void getActiveUsers_returnsStates() {
        when(profileRepository.countActiveUsersByState(any(), any()))
                .thenReturn(List.of(
                        new Object[]{"Miranda", 30L},
                        new Object[]{"Caracas", 20L}
                ))
                .thenReturn(Collections.singletonList(
                        new Object[]{"Miranda", 25L}
                ));

        var result = dashboardService.getActiveUsers();

        assertEquals(50L, ((Number) result.get("total")).longValue());
        List<Map<String, Object>> states = (List<Map<String, Object>>) result.get("states");
        assertEquals(2, states.size());
    }

    // ─── Monthly Revenue ──────────────────────────────────────────────────

    @Test
    void getCurrentMonthRevenue_returnsCurrentMonthValue() {
        when(transactionRepository.sumRevenueByCurrencyAndDate(eq("USD"), any(), any()))
                .thenReturn(15000.0);

        double result = dashboardService.getCurrentMonthRevenue("USD");
        assertEquals(15000.0, result, 0.001);
    }
}
