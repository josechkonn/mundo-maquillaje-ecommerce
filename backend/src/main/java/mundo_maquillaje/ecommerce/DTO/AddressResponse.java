package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {
    private String id;
    private String name;
    private String fullname;
    private String phone;
    private String direction;
    private String city;
    private String stateId;
    private String stateName;
    private String municipalityId;
    private String municipalityName;
    private String parishId;
    private String parishName;
}
