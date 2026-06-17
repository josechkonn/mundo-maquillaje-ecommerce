package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrencyDTO {
    private String id;
    private String name;
    private String code;
    private String symbol;
    private Double exchangeRate;
    private Integer decimalPlaces;
    private String symbolPosition;
}
