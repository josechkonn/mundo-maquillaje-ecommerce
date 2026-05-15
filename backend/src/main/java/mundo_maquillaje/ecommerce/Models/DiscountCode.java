package mundo_maquillaje.ecommerce.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "discount_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private DiscountType type;

    @Column(name = "value", nullable = false)
    private Double value;

    /**
     * Moneda de referencia para descuentos FLAT_AMOUNT.
     * Para PERCENTAGE, puede ser null.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_currency")
    private Currency currency;

    @Column(name = "min_purchase")
    private Double minPurchase;

    @Column(name = "max_discount")
    private Double maxDiscount;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "times_used")
    @Builder.Default
    private Integer timesUsed = 0;

    @Column(name = "starts_at")
    private LocalDateTime startsAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
