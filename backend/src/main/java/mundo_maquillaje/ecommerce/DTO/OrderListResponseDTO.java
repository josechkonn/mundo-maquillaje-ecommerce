package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderListResponseDTO {
    private String id;
    private String orderNumber;
    private String userName;
    private String userEmail;
    private Double subtotal;
    private Double taxAmount;
    private Double discountAmount;
    private Double shippingCost;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime shippedAt;
    private CurrencyDTO currency;
    private OrderDirectionDTO shippingAddress;
    private List<OrderProductDTO> products;
    private PaymentMethodDTO paymentMethod;
    private List<TransactionDTO> transactions;
}
