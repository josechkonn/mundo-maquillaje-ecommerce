package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Address;
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
    public List<Address> getAddresses(Authentication authentication) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return addressService.getAddressesByProfileId(userId);
    }

    @PostMapping
    public Address createAddress(Authentication authentication, @RequestBody Address address) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return addressService.createAddress(userId, address);
    }

    @PutMapping("/{id}")
    public Address updateAddress(Authentication authentication, @PathVariable UUID id, @RequestBody Address address) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        return addressService.updateAddress(userId, id, address);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(Authentication authentication, @PathVariable UUID id) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        addressService.deleteAddress(userId, id);
        return ResponseEntity.noContent().build();
    }
}
