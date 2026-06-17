package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import mundo_maquillaje.ecommerce.Services.ReportsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportsService reportsService;
    private final PermissionService permissionService;

    private LocalDate parseStart(String startDate) {
        return startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(29);
    }

    private LocalDate parseEnd(String endDate) {
        return endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
    }

    @GetMapping("/sales")
    public ResponseEntity<?> getSales(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        permissionService.requirePermission(authentication, "view.reports");
        return ResponseEntity.ok(reportsService.getSalesReport(currencyCode, parseStart(startDate), parseEnd(endDate)));
    }

    @GetMapping("/stock")
    public ResponseEntity<?> getStock(
            Authentication authentication,
            @RequestParam(required = false) String currencyCode) {
        permissionService.requirePermission(authentication, "view.reports");
        return ResponseEntity.ok(reportsService.getStockReport(currencyCode));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        permissionService.requirePermission(authentication, "view.reports");
        return ResponseEntity.ok(reportsService.getOrdersReport(status, parseStart(startDate), parseEnd(endDate)));
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomers(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        permissionService.requirePermission(authentication, "view.reports");
        return ResponseEntity.ok(reportsService.getCustomersReport(currencyCode, parseStart(startDate), parseEnd(endDate)));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<?> getBestSellers(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "20") int limit) {
        permissionService.requirePermission(authentication, "view.reports");
        return ResponseEntity.ok(reportsService.getBestSellers(currencyCode, parseStart(startDate), parseEnd(endDate), limit));
    }

    @GetMapping("/revenue-by-category")
    public ResponseEntity<?> getRevenueByCategory(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        permissionService.requirePermission(authentication, "view.reports");
        return ResponseEntity.ok(reportsService.getRevenueByCategory(currencyCode, parseStart(startDate), parseEnd(endDate)));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            Authentication authentication,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        permissionService.requirePermission(authentication, "view.reports");
        return ResponseEntity.ok(reportsService.getTransactionsReport(type, parseStart(startDate), parseEnd(endDate)));
    }

    @GetMapping("/conversion")
    public ResponseEntity<?> getConversion(
            Authentication authentication,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        permissionService.requirePermission(authentication, "view.reports");
        return ResponseEntity.ok(reportsService.getConversionReport(parseStart(startDate), parseEnd(endDate)));
    }
}
