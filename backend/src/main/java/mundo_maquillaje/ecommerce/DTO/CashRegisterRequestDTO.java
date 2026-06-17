package mundo_maquillaje.ecommerce.DTO;

import lombok.Data;
import java.util.UUID;

@Data
public class CashRegisterRequestDTO {
    private String name;
    private String description;
    private UUID currencyId;
    private Boolean isActive;
}
