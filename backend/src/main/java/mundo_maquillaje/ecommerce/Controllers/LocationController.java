package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.City;
import mundo_maquillaje.ecommerce.Models.Municipality;
import mundo_maquillaje.ecommerce.Models.Parish;
import mundo_maquillaje.ecommerce.Models.State;
import mundo_maquillaje.ecommerce.Services.LocationService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;
    private final PermissionService permissionService;

    // ─── STATES ───
    @GetMapping("/states")
    public List<State> getStates(Authentication authentication) {
        return locationService.getAllStates();
    }

    @PostMapping("/states")
    public ResponseEntity<?> createState(Authentication authentication, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.settings");
        State state = State.builder().name(body.get("name").trim()).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.createState(state));
    }

    @PutMapping("/states/{id}")
    public ResponseEntity<?> updateState(Authentication authentication, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.settings");
        return ResponseEntity.ok(locationService.updateState(id, body.get("name").trim()));
    }

    @DeleteMapping("/states/{id}")
    public ResponseEntity<?> deleteState(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.settings");
        locationService.deleteState(id);
        return ResponseEntity.noContent().build();
    }

    // ─── CITIES ───
    @GetMapping("/cities")
    public List<City> getCities(
            Authentication authentication,
            @RequestParam UUID stateId,
            @RequestParam(required = false) String search) {
        return locationService.getCitiesByState(stateId, search);
    }

    @PostMapping("/cities")
    public ResponseEntity<?> createCity(Authentication authentication, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.settings");
        UUID stateId = UUID.fromString(body.get("stateId"));
        City city = City.builder()
                .name(body.get("name").trim())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.createCity(city, stateId));
    }

    @PutMapping("/cities/{id}")
    public ResponseEntity<?> updateCity(Authentication authentication, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.settings");
        UUID stateId = UUID.fromString(body.get("stateId"));
        return ResponseEntity.ok(locationService.updateCity(id, body.get("name").trim(), stateId));
    }

    @DeleteMapping("/cities/{id}")
    public ResponseEntity<?> deleteCity(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.settings");
        locationService.deleteCity(id);
        return ResponseEntity.noContent().build();
    }

    // ─── MUNICIPALITIES ───
    @GetMapping("/municipalities")
    public List<Municipality> getMunicipalities(
            Authentication authentication,
            @RequestParam UUID cityId,
            @RequestParam(required = false) String search) {
        return locationService.getMunicipalitiesByCity(cityId, search);
    }

    @PostMapping("/municipalities")
    public ResponseEntity<?> createMunicipality(Authentication authentication, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.settings");
        UUID cityId = UUID.fromString(body.get("cityId"));
        Municipality municipality = Municipality.builder()
                .name(body.get("name").trim())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.createMunicipality(municipality, cityId));
    }

    @PutMapping("/municipalities/{id}")
    public ResponseEntity<?> updateMunicipality(Authentication authentication, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.settings");
        UUID cityId = UUID.fromString(body.get("cityId"));
        return ResponseEntity.ok(locationService.updateMunicipality(id, body.get("name").trim(), cityId));
    }

    @DeleteMapping("/municipalities/{id}")
    public ResponseEntity<?> deleteMunicipality(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.settings");
        locationService.deleteMunicipality(id);
        return ResponseEntity.noContent().build();
    }

    // ─── PARISHES ───
    @GetMapping("/parishes")
    public List<Parish> getParishes(
            Authentication authentication,
            @RequestParam UUID municipalityId,
            @RequestParam(required = false) String search) {
        return locationService.getParishesByMunicipality(municipalityId, search);
    }

    @PostMapping("/parishes")
    public ResponseEntity<?> createParish(Authentication authentication, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.settings");
        UUID municipalityId = UUID.fromString(body.get("municipalityId"));
        Parish parish = Parish.builder()
                .name(body.get("name").trim())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.createParish(parish, municipalityId));
    }

    @PutMapping("/parishes/{id}")
    public ResponseEntity<?> updateParish(Authentication authentication, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.settings");
        UUID municipalityId = UUID.fromString(body.get("municipalityId"));
        return ResponseEntity.ok(locationService.updateParish(id, body.get("name").trim(), municipalityId));
    }

    @DeleteMapping("/parishes/{id}")
    public ResponseEntity<?> deleteParish(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.settings");
        locationService.deleteParish(id);
        return ResponseEntity.noContent().build();
    }
}
