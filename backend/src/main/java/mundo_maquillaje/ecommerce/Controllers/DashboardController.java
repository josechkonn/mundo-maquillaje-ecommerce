package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Services.DashboardService;
import mundo_maquillaje.ecommerce.Services.MonthlyGoalService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final MonthlyGoalService monthlyGoalService;
    private final PermissionService permissionService;

    @GetMapping("/sales")
    public ResponseEntity<?> getSales(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        permissionService.requirePermission(authentication, "view.dashboard");

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusWeeks(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        return ResponseEntity.ok(dashboardService.getSalesSummary(currencyCode, start, end));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(
            Authentication authentication,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        permissionService.requirePermission(authentication, "view.dashboard");

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusWeeks(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        return ResponseEntity.ok(dashboardService.getOrdersSummary(start, end));
    }

    @GetMapping("/visitors")
    public ResponseEntity<?> getVisitors(
            Authentication authentication,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        permissionService.requirePermission(authentication, "view.dashboard");

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusWeeks(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        return ResponseEntity.ok(dashboardService.getVisitorsSummary(start, end));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getTopCategories(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        permissionService.requirePermission(authentication, "view.dashboard");

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusWeeks(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        return ResponseEntity.ok(dashboardService.getTopCategories(currencyCode, start, end));
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "day") String groupBy) {

        permissionService.requirePermission(authentication, "view.dashboard");

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(6);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        return ResponseEntity.ok(dashboardService.getRevenueOverTime(currencyCode, start, end, groupBy));
    }

    @GetMapping("/conversion")
    public ResponseEntity<?> getConversion(
            Authentication authentication,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        permissionService.requirePermission(authentication, "view.dashboard");

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusWeeks(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        return ResponseEntity.ok(dashboardService.getConversionFunnel(start, end));
    }

    @GetMapping("/active-users")
    public ResponseEntity<?> getActiveUsers(Authentication authentication) {
        permissionService.requirePermission(authentication, "view.dashboard");
        return ResponseEntity.ok(dashboardService.getActiveUsers());
    }

    @GetMapping("/monthly-goal")
    public ResponseEntity<?> getMonthlyGoal(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        permissionService.requirePermission(authentication, "view.dashboard");

        int m = month != null ? month : YearMonth.now().getMonthValue();
        int y = year != null ? year : YearMonth.now().getYear();

        double goalAmount = monthlyGoalService.getGoal(currencyCode, m, y)
                .map(g -> g.getGoalAmount())
                .orElse(0.0);

        double currentRevenue = dashboardService.getCurrentMonthRevenue(currencyCode);

        return ResponseEntity.ok(Map.of(
                "goal", goalAmount,
                "current", currentRevenue,
                "month", m,
                "year", y,
                "currencyCode", currencyCode
        ));
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        permissionService.requirePermission(authentication, "view.dashboard");

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(6);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        YearMonth now = YearMonth.now();
        YearMonth prevMonth = now.minusMonths(1);
        double goalAmount = monthlyGoalService.getGoal(currencyCode, now.getMonthValue(), now.getYear())
                .map(g -> g.getGoalAmount())
                .orElse(0.0);
        double currentRevenue = dashboardService.getCurrentMonthRevenue(currencyCode);
        double prevRevenue = dashboardService.getMonthRevenue(currencyCode, prevMonth.getMonthValue(), prevMonth.getYear());

        Map<String, Object> overview = new LinkedHashMap<>();
        try {
            overview.put("sales", dashboardService.getSalesSummary(currencyCode, start, end));
        } catch (Exception e) {
            overview.put("sales", Map.of("current", 0.0, "previous", 0.0, "change", 0.0));
        }
        try {
            overview.put("orders", dashboardService.getOrdersSummary(start, end));
        } catch (Exception e) {
            overview.put("orders", Map.of("current", 0, "previous", 0, "change", 0.0));
        }
        try {
            overview.put("visitors", dashboardService.getVisitorsSummary(start, end));
        } catch (Exception e) {
            overview.put("visitors", Map.of("current", 0, "previous", 0, "change", 0.0));
        }
        try {
            overview.put("categories", dashboardService.getTopCategories(currencyCode, start, end));
        } catch (Exception e) {
            overview.put("categories", Map.of("categories", List.of(), "total", 0.0));
        }
        try {
            overview.put("revenue", dashboardService.getRevenueOverTime(currencyCode, start, end, "day"));
        } catch (Exception e) {
            overview.put("revenue", Map.of("labels", List.of(), "revenues", List.of(), "orders", List.of()));
        }
        try {
            overview.put("conversion", dashboardService.getConversionFunnel(start, end));
        } catch (Exception e) {
            Map<String, Long> emptyFunnel = Map.of("productViews", 0L, "addToCart", 0L, "checkoutStart", 0L, "purchase", 0L, "unpaidCarts", 0L);
            overview.put("conversion", Map.of("current", emptyFunnel, "previous", emptyFunnel));
        }
        try {
            overview.put("activeUsers", dashboardService.getActiveUsers());
        } catch (Exception e) {
            overview.put("activeUsers", Map.of("total", 0, "change", 0.0, "states", List.of()));
        }
        overview.put("monthlyGoal", Map.of(
                "goal", goalAmount,
                "current", currentRevenue,
                "previous", prevRevenue,
                "month", now.getMonthValue(),
                "year", now.getYear(),
                "currencyCode", currencyCode
        ));

        return ResponseEntity.ok(overview);
    }
}
