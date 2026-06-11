package mundo_maquillaje.ecommerce.DTO;

import lombok.Data;
import mundo_maquillaje.ecommerce.Models.Currency;

import java.util.UUID;

@Data
public class MonthlyGoalResponse {
    private UUID id;
    private Currency currency;
    private int month;
    private int year;
    private Double goalAmount;
    private Double currentAmount;
    private Double percentage;
    private Double projectedPercentage;
    private boolean exceeded;
    private Integer daysRemaining;
    private Double previousMonthAverage;
}
