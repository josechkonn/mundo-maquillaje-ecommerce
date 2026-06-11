package mundo_maquillaje.ecommerce.Models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
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
@EqualsAndHashCode(exclude = {"category", "brand", "currency", "variations"})
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

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

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
            "  WHEN c.code = 'USD' THEN v.price * (SELECT ves.exchange_rate FROM currencies ves WHERE ves.code = 'VES') * (SELECT cop.exchange_rate FROM currencies cop WHERE cop.code = 'COP') " +
            "  WHEN c.code = 'VES' THEN v.price * (SELECT cop.exchange_rate FROM currencies cop WHERE cop.code = 'COP') " +
            "  ELSE v.price " +
            "END), 0) " +
            "FROM products_variations v " +
            "JOIN products p2 ON v.id_product = p2.id " +
            "JOIN currencies c ON p2.id_currency = c.id " +
            "WHERE v.id_product = id)")
    private Double minPrice;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
