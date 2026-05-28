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
    private CurrencyDTO currency;
    private PaymentMethodDTO paymentMethod;
    private LocalDateTime createdAt;
}
