package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.MonthlyGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MonthlyGoalRepository extends JpaRepository<MonthlyGoal, UUID> {

    Optional<MonthlyGoal> findByCurrencyCodeAndMonthAndYear(String currencyCode, int month, int year);
}
