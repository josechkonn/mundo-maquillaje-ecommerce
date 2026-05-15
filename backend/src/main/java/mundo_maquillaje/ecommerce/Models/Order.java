package mundo_maquillaje.ecommerce.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    private Profile profile;

    @ManyToOne
    @JoinColumn(name = "id_shipping_method", nullable = false)
    private ShippingMethod shippingMethod;

    @ManyToOne
    @JoinColumn(name = "id_pmethod", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    private Double subtotal;

    @Column(nullable = false)
    private Double taxAmount = 0.0;

    @Column(nullable = false)
    private Double discountAmount = 0.0;

    @Column(nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private OrderDirection shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderProduct> products;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime shippedAt;
}
