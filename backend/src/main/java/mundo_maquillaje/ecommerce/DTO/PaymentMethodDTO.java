package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodDTO {
    private String id;
    private String name;
    private String slug;
    private CurrencyDTO currency;
    private CashRegisterInfoDTO cashRegister;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CashRegisterInfoDTO {
        private String id;
        private String name;
    }
}
