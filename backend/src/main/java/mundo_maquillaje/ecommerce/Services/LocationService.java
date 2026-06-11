package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.City;
import mundo_maquillaje.ecommerce.Models.Municipality;
import mundo_maquillaje.ecommerce.Models.Parish;
import mundo_maquillaje.ecommerce.Models.State;
import mundo_maquillaje.ecommerce.Repositories.CityRepository;
import mundo_maquillaje.ecommerce.Repositories.MunicipalityRepository;
import mundo_maquillaje.ecommerce.Repositories.ParishRepository;
import mundo_maquillaje.ecommerce.Repositories.StateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final StateRepository stateRepository;
    private final MunicipalityRepository municipalityRepository;
    private final ParishRepository parishRepository;
    private final CityRepository cityRepository;

    // ─── READ ───
    public List<State> getAllStates() {
        return stateRepository.findAll();
    }

    public List<City> getCitiesByState(UUID stateId, String search) {
        List<City> result = cityRepository.findByStateIdOrderByName(stateId);
        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            result = result.stream()
                    .filter(c -> c.getName().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }
        return result;
    }

    public List<Municipality> getMunicipalitiesByCity(UUID cityId, String search) {
        List<Municipality> result = municipalityRepository.findByCityIdOrderByName(cityId);
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

    // ─── STATES CRUD ───
    @Transactional
    public State createState(State state) {
        return stateRepository.save(state);
    }

    @Transactional
    public State updateState(UUID id, String name) {
        State state = stateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        state.setName(name);
        return stateRepository.save(state);
    }

    @Transactional
    public void deleteState(UUID id) {
        stateRepository.deleteById(id);
    }

    // ─── CITIES CRUD ───
    @Transactional
    public City createCity(City city, UUID stateId) {
        State state = stateRepository.findById(stateId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        city.setState(state);
        return cityRepository.save(city);
    }

    @Transactional
    public City updateCity(UUID id, String name, UUID stateId) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ciudad no encontrada"));
        State state = stateRepository.findById(stateId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        city.setName(name);
        city.setState(state);
        return cityRepository.save(city);
    }

    @Transactional
    public void deleteCity(UUID id) {
        cityRepository.deleteById(id);
    }

    // ─── MUNICIPALITIES CRUD ───
    @Transactional
    public Municipality createMunicipality(Municipality municipality, UUID cityId) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new RuntimeException("Ciudad no encontrada"));
        municipality.setCity(city);
        return municipalityRepository.save(municipality);
    }

    @Transactional
    public Municipality updateMunicipality(UUID id, String name, UUID cityId) {
        Municipality municipality = municipalityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Municipio no encontrado"));
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new RuntimeException("Ciudad no encontrada"));
        municipality.setName(name);
        municipality.setCity(city);
        return municipalityRepository.save(municipality);
    }

    @Transactional
    public void deleteMunicipality(UUID id) {
        municipalityRepository.deleteById(id);
    }

    // ─── PARISHES CRUD ───
    @Transactional
    public Parish createParish(Parish parish, UUID municipalityId) {
        Municipality municipality = municipalityRepository.findById(municipalityId)
                .orElseThrow(() -> new RuntimeException("Municipio no encontrado"));
        parish.setMunicipality(municipality);
        return parishRepository.save(parish);
    }

    @Transactional
    public Parish updateParish(UUID id, String name, UUID municipalityId) {
        Parish parish = parishRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parroquia no encontrada"));
        Municipality municipality = municipalityRepository.findById(municipalityId)
                .orElseThrow(() -> new RuntimeException("Municipio no encontrado"));
        parish.setName(name);
        parish.setMunicipality(municipality);
        return parishRepository.save(parish);
    }

    @Transactional
    public void deleteParish(UUID id) {
        parishRepository.deleteById(id);
    }
}
