package mundo_maquillaje.ecommerce.Controllers;

import mundo_maquillaje.ecommerce.Services.PermissionService;
import mundo_maquillaje.ecommerce.Services.ReportsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReportsControllerTest {

    @Mock private ReportsService reportsService;
    @Mock private PermissionService permissionService;
    @Mock private Authentication authentication;

    @InjectMocks
    private ReportsController controller;

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
        when(reportsService.getSalesReport(eq("USD"), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/sales")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getSales_withDateParams() throws Exception {
        when(reportsService.getSalesReport(eq("USD"), eq(LocalDate.of(2024, 1, 1)), eq(LocalDate.of(2024, 1, 31))))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/sales")
                        .param("currencyCode", "USD")
                        .param("startDate", "2024-01-01")
                        .param("endDate", "2024-01-31")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getSales_missingCurrencyCode_returnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/admin/reports/sales")
                        .principal(auth))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getStock_returnsOk() throws Exception {
        when(reportsService.getStockReport(any()))
                .thenReturn(Map.of("items", List.of(), "totalVariations", 0));

        mockMvc.perform(get("/api/admin/reports/stock")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getStock_withCurrency() throws Exception {
        when(reportsService.getStockReport("USD"))
                .thenReturn(Map.of("items", List.of(), "totalVariations", 0));

        mockMvc.perform(get("/api/admin/reports/stock")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getOrders_returnsOk() throws Exception {
        when(reportsService.getOrdersReport(any(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/orders")
                        .param("status", "PAID")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getOrders_withoutStatus_returnsOk() throws Exception {
        when(reportsService.getOrdersReport(isNull(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/orders")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getCustomers_returnsOk() throws Exception {
        when(reportsService.getCustomersReport(any(), any(), any()))
                .thenReturn(Map.of("totalCustomers", 0L));

        mockMvc.perform(get("/api/admin/reports/customers")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getBestSellers_returnsOk() throws Exception {
        when(reportsService.getBestSellers(any(), any(), any(), anyInt()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/best-sellers")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getBestSellers_withCustomLimit() throws Exception {
        when(reportsService.getBestSellers(eq("USD"), any(), any(), eq(5)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/best-sellers")
                        .param("currencyCode", "USD")
                        .param("limit", "5")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getRevenueByCategory_returnsOk() throws Exception {
        when(reportsService.getRevenueByCategory(any(), any(), any()))
                .thenReturn(Map.of("categories", List.of()));

        mockMvc.perform(get("/api/admin/reports/revenue-by-category")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getTransactions_returnsOk() throws Exception {
        when(reportsService.getTransactionsReport(any(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/transactions")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getConversion_returnsOk() throws Exception {
        when(reportsService.getConversionReport(any(), any()))
                .thenReturn(Map.of());

        mockMvc.perform(get("/api/admin/reports/conversion")
                        .principal(auth))
                .andExpect(status().isOk());
    }

    @Test
    void getSales_usesDefaultDatesWhenMissing() throws Exception {
        when(reportsService.getSalesReport(eq("USD"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/sales")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());

        verify(reportsService).getSalesReport(eq("USD"), any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void endpoint_callsPermissionService() throws Exception {
        when(reportsService.getSalesReport(any(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports/sales")
                        .param("currencyCode", "USD")
                        .principal(auth))
                .andExpect(status().isOk());

        verify(permissionService).requirePermission(any(), eq("view.reports"));
    }
}
