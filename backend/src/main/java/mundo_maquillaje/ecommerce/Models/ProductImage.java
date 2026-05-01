package mundo_maquillaje.ecommerce.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "products_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "url_image", nullable = false)
    private String urlImage;

    @Column(name = "image_order")
    private Integer order;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "is_main")
    @Builder.Default
    private Boolean isMain = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_variation", nullable = false)
    @JsonBackReference("variation-images")
    private ProductVariation variation;
}
