package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.AddressRequest;
import mundo_maquillaje.ecommerce.DTO.AddressResponse;
import mundo_maquillaje.ecommerce.Services.AddressService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final ProfileService profileService;

    @GetMapping
    public List<AddressResponse> getAddresses(Authentication authentication) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return addressService.getAddressesByProfileId(userId);
    }

    @PostMapping
    public AddressResponse createAddress(Authentication authentication, @RequestBody AddressRequest request) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return addressService.createAddress(userId, request);
    }

    @PutMapping("/{id}")
    public AddressResponse updateAddress(Authentication authentication, @PathVariable UUID id, @RequestBody AddressRequest request) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return addressService.updateAddress(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(Authentication authentication, @PathVariable UUID id) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        addressService.deleteAddress(userId, id);
        return ResponseEntity.noContent().build();
    }
}
