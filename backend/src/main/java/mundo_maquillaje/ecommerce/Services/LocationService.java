package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Municipality;
import mundo_maquillaje.ecommerce.Models.Parish;
import mundo_maquillaje.ecommerce.Models.State;
import mundo_maquillaje.ecommerce.Repositories.MunicipalityRepository;
import mundo_maquillaje.ecommerce.Repositories.ParishRepository;
import mundo_maquillaje.ecommerce.Repositories.StateRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final StateRepository stateRepository;
    private final MunicipalityRepository municipalityRepository;
    private final ParishRepository parishRepository;

    public List<State> getAllStates() {
        return stateRepository.findAll();
    }

    public List<Municipality> getMunicipalitiesByState(UUID stateId, String search) {
        List<Municipality> result = municipalityRepository.findByStateIdOrderByName(stateId);
        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            result = result.stream()
                    .filter(m -> m.getName().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }
        return result;
    }

    public List<Parish> getParishesByMunicipality(UUID municipalityId, String search) {
        List<Parish> result = parishRepository.findByMunicipalityIdOrderByName(municipalityId);
        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            result = result.stream()
                    .filter(p -> p.getName().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }
        return result;
    }
}
