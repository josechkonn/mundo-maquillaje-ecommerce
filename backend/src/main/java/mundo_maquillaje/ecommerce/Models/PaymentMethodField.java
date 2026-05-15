package mundo_maquillaje.ecommerce.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "pmethods_fields")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodField {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String field; // Ej: "Número de cuenta"

    @Column(nullable = false)
    private String value; // Ej: "010200..."

    @Column(name = "\"order\"")
    private Integer displayOrder;

    @ManyToOne
    @JoinColumn(name = "id_pmethod", nullable = false)
    @JsonIgnore // Evitar recursión infinita
    private PaymentMethod paymentMethod;
}
