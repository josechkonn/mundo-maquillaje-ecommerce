package mundo_maquillaje.ecommerce.DTO;

import lombok.Data;
import java.util.UUID;

@Data
public class CheckoutRequestDTO {
    private UUID addressId;          // Paso 1
    private UUID shippingMethodId;   // Paso 2
    private UUID paymentMethodId;    // Paso 3
    private String paymentReference; // Paso 3
    private String receiptUrl;       // Paso 4: URL de la imagen
    private String discountCode;     // Por si aplicó un cupón
}
