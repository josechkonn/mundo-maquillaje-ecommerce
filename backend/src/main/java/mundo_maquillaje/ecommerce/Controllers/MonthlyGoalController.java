package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.MonthlyGoalResponse;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.MonthlyGoal;
import mundo_maquillaje.ecommerce.Services.CurrencyService;
import mundo_maquillaje.ecommerce.Services.MonthlyGoalService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/goals")
@RequiredArgsConstructor
public class MonthlyGoalController {

    private final MonthlyGoalService monthlyGoalService;
    private final CurrencyService currencyService;
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

    @GetMapping("/month")
    public ResponseEntity<?> getGoalsForMonth(
            Authentication authentication,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        permissionService.requirePermission(authentication, "manage.settings");

        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();

        List<Currency> currencies = currencyService.getAllCurrencies();
        List<MonthlyGoalResponse> responses = new ArrayList<>();

        for (Currency currency : currencies) {
            if (Boolean.FALSE.equals(currency.getIsActive())) continue;

            String code = currency.getCode();
            Optional<MonthlyGoal> goalOpt = monthlyGoalService.getGoal(code, m, y);
            Double currentAmount = monthlyGoalService.getCurrentSales(code, m, y);
            Double previousAverage = monthlyGoalService.getPreviousMonthAverage(code, m, y);
            int daysRemaining = monthlyGoalService.getDaysRemaining(m, y);

            if (goalOpt.isPresent()) {
                MonthlyGoal goal = goalOpt.get();
                Double percentage = goal.getGoalAmount() > 0 ? (currentAmount / goal.getGoalAmount()) * 100 : 0;
                Double projectedPercentage = daysRemaining > 0 && currentAmount > 0
                        ? percentage * (LocalDate.of(y, m, 1).lengthOfMonth() / (double) (LocalDate.of(y, m, 1).lengthOfMonth() - daysRemaining + 1))
                        : percentage;

                MonthlyGoalResponse response = new MonthlyGoalResponse();
                response.setId(goal.getId());
                response.setCurrency(currency);
                response.setMonth(m);
                response.setYear(y);
                response.setGoalAmount(goal.getGoalAmount());
                response.setCurrentAmount(currentAmount);
                response.setPercentage(Math.round(percentage * 100.0) / 100.0);
                response.setProjectedPercentage(Math.round(projectedPercentage * 100.0) / 100.0);
                response.setExceeded(percentage >= 100);
                response.setDaysRemaining(daysRemaining);
                response.setPreviousMonthAverage(previousAverage);
                responses.add(response);
            } else {
                MonthlyGoalResponse response = new MonthlyGoalResponse();
                response.setCurrency(currency);
                response.setMonth(m);
                response.setYear(y);
                response.setGoalAmount(0.0);
                response.setCurrentAmount(currentAmount);
                response.setPercentage(0.0);
                response.setProjectedPercentage(0.0);
                response.setExceeded(false);
                response.setDaysRemaining(daysRemaining);
                response.setPreviousMonthAverage(previousAverage);
                responses.add(response);
            }
        }

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/previous-average")
    public ResponseEntity<?> getPreviousMonthAverage(
            Authentication authentication,
            @RequestParam String currencyCode,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        permissionService.requirePermission(authentication, "manage.settings");

        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();

        Double average = monthlyGoalService.getPreviousMonthAverage(currencyCode, m, y);
        return ResponseEntity.ok(Map.of("currencyCode", currencyCode, "average", average));
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

    @PostMapping("/batch")
    public ResponseEntity<?> setGoalsBatch(
            Authentication authentication,
            @RequestBody List<Map<String, Object>> payloads) {

        permissionService.requirePermission(authentication, "manage.settings");

        List<MonthlyGoal> goals = new ArrayList<>();
        for (Map<String, Object> payload : payloads) {
            String currencyCode = (String) payload.get("currencyCode");
            int month = ((Number) payload.get("month")).intValue();
            int year = ((Number) payload.get("year")).intValue();
            Double goalAmount = ((Number) payload.get("goalAmount")).doubleValue();
            goals.add(monthlyGoalService.createOrUpdateGoal(currencyCode, month, year, goalAmount));
        }
        return ResponseEntity.ok(goals);
    }
}
