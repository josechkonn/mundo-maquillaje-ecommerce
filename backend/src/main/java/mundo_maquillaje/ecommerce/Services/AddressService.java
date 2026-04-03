package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Address;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Repositories.AddressRepository;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final ProfileRepository profileRepository;

    public List<Address> getAddressesByProfileId(UUID profileId) {
        return addressRepository.findByProfileId(profileId);
    }

    @Transactional
    public Address createAddress(UUID profileId, Address address) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        address.setProfile(profile);
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(UUID profileId, UUID addressId, Address addressDetails) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Unauthorized to update this address");
        }

        address.setName(addressDetails.getName());
        address.setPhone(addressDetails.getPhone());
        address.setDirection(addressDetails.getDirection());
        address.setMunicipality(addressDetails.getMunicipality());
        address.setParish(addressDetails.getParish());
        address.setCity(addressDetails.getCity());
        address.setState(addressDetails.getState());

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(UUID profileId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Unauthorized to delete this address");
        }

        addressRepository.delete(address);
    }
}
