package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {
    private String name;
    private String fullname;
    private String phone;
    private String direction;
    private String city;
    private UUID stateId;
    private UUID municipalityId;
    private UUID parishId;
}
