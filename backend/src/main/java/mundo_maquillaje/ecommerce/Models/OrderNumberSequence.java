package mundo_maquillaje.ecommerce.Models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_number_sequences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderNumberSequence {

    @Id
    @Column(name = "year_value", nullable = false)
    private Integer year;

    @Column(name = "last_number", nullable = false)
    private Long lastNumber;
}
