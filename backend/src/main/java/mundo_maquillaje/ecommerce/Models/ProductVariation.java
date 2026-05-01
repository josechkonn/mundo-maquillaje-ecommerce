package mundo_maquillaje.ecommerce.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products_variations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "stock", nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "attribute_name", length = 50)
    private String attributeName; // e.g., "Color", "Talla"

    @Column(name = "attribute_value", length = 50)
    private String attributeValue; // e.g., "Rojo", "XL"

    @Column(name = "hex_color", length = 20)
    private String hexColor; // e.g., "#FF0000"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_product", nullable = false)
    @JsonBackReference("product-variations")
    private Product product;

    @OneToMany(mappedBy = "variation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("variation-images")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();
}
