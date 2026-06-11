package mundo_maquillaje.ecommerce.Controllers;

import mundo_maquillaje.ecommerce.Services.DashboardService;
import mundo_maquillaje.ecommerce.Services.MonthlyGoalService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock private DashboardService dashboardService;
    @Mock private MonthlyGoalService monthlyGoalService;
    @Mock private PermissionService permissionService;

    @InjectMocks
    private DashboardController controller;

    private MockMvc mockMvc;
    private Authentication auth;

    @BeforeEach
    void setUp() {
        auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("admin@test.com");
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        lenient().doNothing().when(permissionService).requirePermission(any(), anyString());
    }

    @Test
    void getSales_returnsOk() throws Exception {
        when(dashboardService.getSalesSummary(any(), any(), any()))
                .thenReturn(Map.of("current", 0.0, "previous", 0.0, "change", 0.0));

        mockMvc.perform(get("/api/admin/dashboard/sales")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getOrders_returnsOk() throws Exception {
        when(dashboardService.getOrdersSummary(any(), any()))
                .thenReturn(Map.of("current", 0L, "previous", 0L, "change", 0.0));

        mockMvc.perform(get("/api/admin/dashboard/orders")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getVisitors_returnsOk() throws Exception {
        when(dashboardService.getVisitorsSummary(any(), any()))
                .thenReturn(Map.of("current", 0L, "previous", 0L, "change", 0.0));

        mockMvc.perform(get("/api/admin/dashboard/visitors")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getTopCategories_returnsOk() throws Exception {
        when(dashboardService.getTopCategories(any(), any(), any()))
                .thenReturn(Map.of("categories", List.of()));

        mockMvc.perform(get("/api/admin/dashboard/categories")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getRevenue_returnsOk() throws Exception {
        when(dashboardService.getRevenueOverTime(any(), any(), any(), any()))
                .thenReturn(Map.of("labels", List.of(), "revenues", List.of(), "orders", List.of()));

        mockMvc.perform(get("/api/admin/dashboard/revenue")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getRevenue_withMonthGrouping() throws Exception {
        when(dashboardService.getRevenueOverTime(eq("USD"), any(), any(), eq("month")))
                .thenReturn(Map.of("labels", List.of(), "revenues", List.of(), "orders", List.of()));

        mockMvc.perform(get("/api/admin/dashboard/revenue")
                        .param("currencyCode", "USD")
                        .param("groupBy", "month")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getConversion_returnsOk() throws Exception {
        when(dashboardService.getConversionFunnel(any(), any()))
                .thenReturn(Map.of());

        mockMvc.perform(get("/api/admin/dashboard/conversion")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getActiveUsers_returnsOk() throws Exception {
        when(dashboardService.getActiveUsers())
                .thenReturn(Map.of("total", 0L, "change", 0.0, "states", List.of()));

        mockMvc.perform(get("/api/admin/dashboard/active-users")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getMonthlyGoal_returnsOk() throws Exception {
        when(monthlyGoalService.getGoal(anyString(), anyInt(), anyInt()))
                .thenReturn(Optional.empty());
        when(dashboardService.getCurrentMonthRevenue(anyString()))
                .thenReturn(0.0);
        when(dashboardService.getMonthRevenue(anyString(), anyInt(), anyInt()))
                .thenReturn(0.0);

        mockMvc.perform(get("/api/admin/dashboard/monthly-goal")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getOverview_returnsOk() throws Exception {
        when(dashboardService.getSalesSummary(any(), any(), any()))
                .thenReturn(Map.of("current", 0.0, "previous", 0.0, "change", 0.0));
        when(dashboardService.getOrdersSummary(any(), any()))
                .thenReturn(Map.of("current", 0L, "previous", 0L, "change", 0.0));
        when(dashboardService.getVisitorsSummary(any(), any()))
                .thenReturn(Map.of("current", 0L, "previous", 0L, "change", 0.0));
        when(dashboardService.getTopCategories(any(), any(), any()))
                .thenReturn(Map.of("categories", List.of(), "total", 0.0));
        when(dashboardService.getRevenueOverTime(any(), any(), any(), any()))
                .thenReturn(Map.of("labels", List.of(), "revenues", List.of(), "orders", List.of()));
        when(dashboardService.getConversionFunnel(any(), any()))
                .thenReturn(Map.of());
        when(dashboardService.getActiveUsers())
                .thenReturn(Map.of("total", 0L, "change", 0.0, "states", List.of()));
        when(monthlyGoalService.getGoal(anyString(), anyInt(), anyInt()))
                .thenReturn(Optional.empty());
        when(dashboardService.getCurrentMonthRevenue(anyString())).thenReturn(0.0);
        when(dashboardService.getMonthRevenue(anyString(), anyInt(), anyInt())).thenReturn(0.0);

        mockMvc.perform(get("/api/admin/dashboard/overview")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getOverview_handlesServiceErrorsGracefully() throws Exception {
        when(dashboardService.getSalesSummary(any(), any(), any()))
                .thenThrow(new RuntimeException("DB error"));
        when(dashboardService.getOrdersSummary(any(), any()))
                .thenReturn(Map.of("current", 0L, "previous", 0L, "change", 0.0));
        when(dashboardService.getVisitorsSummary(any(), any()))
                .thenReturn(Map.of("current", 0L, "previous", 0L, "change", 0.0));
        when(dashboardService.getTopCategories(any(), any(), any()))
                .thenReturn(Map.of("categories", List.of(), "total", 0.0));
        when(dashboardService.getRevenueOverTime(any(), any(), any(), any()))
                .thenReturn(Map.of("labels", List.of(), "revenues", List.of(), "orders", List.of()));
        when(dashboardService.getConversionFunnel(any(), any()))
                .thenReturn(Map.of());
        when(dashboardService.getActiveUsers())
                .thenReturn(Map.of("total", 0L, "change", 0.0, "states", List.of()));
        when(monthlyGoalService.getGoal(anyString(), anyInt(), anyInt()))
                .thenReturn(Optional.empty());
        when(dashboardService.getCurrentMonthRevenue(anyString())).thenReturn(0.0);
        when(dashboardService.getMonthRevenue(anyString(), anyInt(), anyInt())).thenReturn(0.0);

        mockMvc.perform(get("/api/admin/dashboard/overview")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sales.current").value(0.0));
    }

    @Test
    void getSalesByCurrency_returnsOk() throws Exception {
        when(dashboardService.getSalesByCurrency(any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/dashboard/sales-by-currency")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getOrdersByCurrency_returnsOk() throws Exception {
        when(dashboardService.getOrdersByCurrency(any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/dashboard/orders-by-currency")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getOrdersByStatus_returnsOk() throws Exception {
        when(dashboardService.getOrdersByStatus(any(), any()))
                .thenReturn(Map.of("total", 0L, "byStatus", Map.of()));

        mockMvc.perform(get("/api/admin/dashboard/orders-by-status")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void endpoint_callsPermissionService() throws Exception {
        when(dashboardService.getSalesSummary(any(), any(), any()))
                .thenReturn(Map.of("current", 0.0, "previous", 0.0, "change", 0.0));

        mockMvc.perform(get("/api/admin/dashboard/sales")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());

        verify(permissionService).requirePermission(any(), eq("view.dashboard"));
    }
}
