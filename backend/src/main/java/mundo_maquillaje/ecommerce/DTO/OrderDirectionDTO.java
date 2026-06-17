package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDirectionDTO {
    private String id;
    private String name;
    private String fullname;
    private String phone;
    private String direction;
    private String municipality;
    private String parish;
    private String city;
    private String state;
}
