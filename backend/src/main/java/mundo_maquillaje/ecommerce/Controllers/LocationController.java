package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Municipality;
import mundo_maquillaje.ecommerce.Models.Parish;
import mundo_maquillaje.ecommerce.Models.State;
import mundo_maquillaje.ecommerce.Services.LocationService;
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

    @GetMapping("/states")
    public List<State> getStates(Authentication authentication) {
        return locationService.getAllStates();
    }

    @GetMapping("/municipalities")
    public List<Municipality> getMunicipalities(
            Authentication authentication,
            @RequestParam UUID stateId,
            @RequestParam(required = false) String search) {
        return locationService.getMunicipalitiesByState(stateId, search);
    }

    @GetMapping("/parishes")
    public List<Parish> getParishes(
            Authentication authentication,
            @RequestParam UUID municipalityId,
            @RequestParam(required = false) String search) {
        return locationService.getParishesByMunicipality(municipalityId, search);
    }
}
