package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderProductDTO {
    private String id;
    private String productName;
    private String variationName;
    private Double price;
    private Integer quantity;
    private Double subtotal;
    private Double discount;
    private Double taxAmount;
    private String imageUrl;
}
