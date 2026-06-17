package mundo_maquillaje.ecommerce.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "order_directions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDirection {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "id_order", nullable = false)
    @JsonIgnore
    private Order order;

    private String name;
    private String fullname;
    private String phone;
    private String direction;
    private String municipality;
    private String parish;
    private String city;
    private String state;
}
