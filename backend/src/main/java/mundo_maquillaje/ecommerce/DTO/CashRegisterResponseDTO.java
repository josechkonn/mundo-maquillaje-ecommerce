package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Currency;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashRegisterResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private Currency currency;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
