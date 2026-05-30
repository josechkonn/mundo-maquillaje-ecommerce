package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.MonthlyGoal;
import mundo_maquillaje.ecommerce.Services.MonthlyGoalService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/goals")
@RequiredArgsConstructor
public class MonthlyGoalController {

    private final MonthlyGoalService monthlyGoalService;
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<?> getGoal(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        permissionService.requirePermission(authentication, "manage.settings");

        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();

        return monthlyGoalService.getGoal(currencyCode, m, y)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(Map.of(
                        "currencyCode", currencyCode,
                        "month", m,
                        "year", y,
                        "goalAmount", 0
                )));
    }

    @PostMapping
    public ResponseEntity<?> setGoal(
            Authentication authentication,
            @RequestBody Map<String, Object> payload) {

        permissionService.requirePermission(authentication, "manage.settings");

        String currencyCode = (String) payload.get("currencyCode");
        int month = ((Number) payload.get("month")).intValue();
        int year = ((Number) payload.get("year")).intValue();
        Double goalAmount = ((Number) payload.get("goalAmount")).doubleValue();

        MonthlyGoal goal = monthlyGoalService.createOrUpdateGoal(currencyCode, month, year, goalAmount);
        return ResponseEntity.ok(goal);
    }
}
