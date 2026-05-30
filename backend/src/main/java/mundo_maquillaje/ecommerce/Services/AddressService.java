package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.AddressRequest;
import mundo_maquillaje.ecommerce.DTO.AddressResponse;
import mundo_maquillaje.ecommerce.Models.Address;
import mundo_maquillaje.ecommerce.Models.Municipality;
import mundo_maquillaje.ecommerce.Models.Parish;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Models.State;
import mundo_maquillaje.ecommerce.Repositories.AddressRepository;
import mundo_maquillaje.ecommerce.Repositories.MunicipalityRepository;
import mundo_maquillaje.ecommerce.Repositories.ParishRepository;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import mundo_maquillaje.ecommerce.Repositories.StateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final ProfileRepository profileRepository;
    private final StateRepository stateRepository;
    private final MunicipalityRepository municipalityRepository;
    private final ParishRepository parishRepository;

    public List<AddressResponse> getAddressesByProfileId(UUID profileId) {
        return addressRepository.findByProfileId(profileId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse createAddress(UUID profileId, AddressRequest request) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        State state = stateRepository.findById(request.getStateId())
                .orElseThrow(() -> new RuntimeException("State not found"));
        Municipality municipality = municipalityRepository.findById(request.getMunicipalityId())
                .orElseThrow(() -> new RuntimeException("Municipality not found"));
        Parish parish = parishRepository.findById(request.getParishId())
                .orElseThrow(() -> new RuntimeException("Parish not found"));

        Address address = Address.builder()
                .name(request.getName())
                .fullname(request.getFullname())
                .phone(request.getPhone())
                .direction(request.getDirection())
                .city(request.getCity())
                .profile(profile)
                .state(state)
                .municipality(municipality)
                .parish(parish)
                .build();

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(UUID profileId, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Unauthorized to update this address");
        }

        State state = stateRepository.findById(request.getStateId())
                .orElseThrow(() -> new RuntimeException("State not found"));
        Municipality municipality = municipalityRepository.findById(request.getMunicipalityId())
                .orElseThrow(() -> new RuntimeException("Municipality not found"));
        Parish parish = parishRepository.findById(request.getParishId())
                .orElseThrow(() -> new RuntimeException("Parish not found"));

        address.setName(request.getName());
        address.setFullname(request.getFullname());
        address.setPhone(request.getPhone());
        address.setDirection(request.getDirection());
        address.setCity(request.getCity());
        address.setState(state);
        address.setMunicipality(municipality);
        address.setParish(parish);

        return toResponse(addressRepository.save(address));
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

    private AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId().toString())
                .name(address.getName())
                .fullname(address.getFullname())
                .phone(address.getPhone())
                .direction(address.getDirection())
                .city(address.getCity())
                .stateId(address.getState() != null ? address.getState().getId().toString() : null)
                .stateName(address.getState() != null ? address.getState().getName() : null)
                .municipalityId(address.getMunicipality() != null ? address.getMunicipality().getId().toString() : null)
                .municipalityName(address.getMunicipality() != null ? address.getMunicipality().getName() : null)
                .parishId(address.getParish() != null ? address.getParish().getId().toString() : null)
                .parishName(address.getParish() != null ? address.getParish().getName() : null)
                .build();
    }
}
