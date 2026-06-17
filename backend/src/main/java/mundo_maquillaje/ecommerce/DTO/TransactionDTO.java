package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {
    private String id;
    private Double amount;
    private String reference;
    private String receiptUrl;
    private String status;
    private String type;
    private String description;
    private CurrencyDTO currency;
    private PaymentMethodDTO paymentMethod;
    private CashRegisterInfoDTO cashRegister;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CashRegisterInfoDTO {
        private String id;
        private String name;
    }
}
