package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.MonthlyGoal;
import mundo_maquillaje.ecommerce.Repositories.CurrencyRepository;
import mundo_maquillaje.ecommerce.Repositories.MonthlyGoalRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MonthlyGoalService {

    private final MonthlyGoalRepository monthlyGoalRepository;
    private final CurrencyRepository currencyRepository;

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
}
