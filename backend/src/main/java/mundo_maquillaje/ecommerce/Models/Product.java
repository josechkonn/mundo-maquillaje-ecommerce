package mundo_maquillaje.ecommerce.Models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 150)
    private String slug;

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "alert_quantity")
    @Builder.Default
    private Integer alertQuantity = 5;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_category")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_brand")
    private Brand brand;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_currency")
    private Currency currency;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("product-variations")
    @Builder.Default
    @BatchSize(size = 20)
    private List<ProductVariation> variations = new ArrayList<>();

    @org.hibernate.annotations.Formula("(SELECT COALESCE(MIN(" +
            "CASE " +
            "  WHEN p2.id_currency = 'd496cda6-bcaf-49c8-ab46-021db20b8164' THEN v.price * (SELECT c1.exchange_rate FROM currencies c1 WHERE c1.id = '23792dea-1aa4-4bc1-ad9d-a9848cafbc6f') * (SELECT c2.exchange_rate FROM currencies c2 WHERE c2.id = 'e78c3ca1-a5a5-40fd-863c-7b7de36575a3') " +
            "  WHEN p2.id_currency = '23792dea-1aa4-4bc1-ad9d-a9848cafbc6f' THEN v.price * (SELECT c3.exchange_rate FROM currencies c3 WHERE c3.id = 'e78c3ca1-a5a5-40fd-863c-7b7de36575a3') " +
            "  ELSE v.price " +
            "END), 0) " +
            "FROM products_variations v " +
            "JOIN products p2 ON v.id_product = p2.id " +
            "WHERE v.id_product = id)")
    private Double minPrice;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
