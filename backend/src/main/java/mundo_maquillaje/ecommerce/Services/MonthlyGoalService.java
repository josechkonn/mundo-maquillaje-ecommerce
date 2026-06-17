package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.MonthlyGoal;
import mundo_maquillaje.ecommerce.Models.Order;
import mundo_maquillaje.ecommerce.Repositories.CurrencyRepository;
import mundo_maquillaje.ecommerce.Repositories.MonthlyGoalRepository;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MonthlyGoalService {

    private final MonthlyGoalRepository monthlyGoalRepository;
    private final CurrencyRepository currencyRepository;
    private final OrderRepository orderRepository;

    public Optional<MonthlyGoal> getGoal(String currencyCode, int month, int year) {
        return monthlyGoalRepository.findByCurrencyCodeAndMonthAndYear(currencyCode, month, year);
    }

    public MonthlyGoal createOrUpdateGoal(String currencyCode, int month, int year, Double goalAmount) {
        Currency currency = currencyRepository.findByCode(currencyCode)
                .orElseThrow(() -> new RuntimeException("Currency not found: " + currencyCode));

        return monthlyGoalRepository.findByCurrencyCodeAndMonthAndYear(currencyCode, month, year)
                .map(existing -> {
                    existing.setGoalAmount(goalAmount);
                    return monthlyGoalRepository.save(existing);
                })
                .orElseGet(() -> {
                    MonthlyGoal goal = MonthlyGoal.builder()
                            .currency(currency)
                            .month(month)
                            .year(year)
                            .goalAmount(goalAmount)
                            .build();
                    return monthlyGoalRepository.save(goal);
                });
    }

    public Double getCurrentSales(String currencyCode, int month, int year) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1).minusSeconds(1);
        return orderRepository.sumSalesByCurrencyAndDate(currencyCode, start, end);
    }

    public Double getPreviousMonthAverage(String currencyCode, int month, int year) {
        LocalDate previous = LocalDate.of(year, month, 1).minusMonths(1);
        LocalDateTime start = previous.withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = previous.plusMonths(1).atStartOfDay().minusSeconds(1);
        return orderRepository.sumSalesByCurrencyAndDate(currencyCode, start, end);
    }

    public int getDaysRemaining(int month, int year) {
        LocalDate today = LocalDate.now();
        LocalDate endOfMonth = LocalDate.of(year, month, 1).plusMonths(1).minusDays(1);
        if (today.isAfter(endOfMonth)) return 0;
        return (int) ChronoUnit.DAYS.between(today, endOfMonth) + 1;
    }
}
