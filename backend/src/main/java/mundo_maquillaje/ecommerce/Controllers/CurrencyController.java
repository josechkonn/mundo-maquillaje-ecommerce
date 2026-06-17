package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Services.BCVCurrencyScraperService;
import mundo_maquillaje.ecommerce.Services.CurrencyService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;
    private final BCVCurrencyScraperService bcvScraperService;
    private final PermissionService permissionService;

    @GetMapping
    public List<Currency> getAllCurrencies() {
        return currencyService.getAllCurrencies();
    }

    @GetMapping("/{id}")
    public Currency getCurrencyById(@PathVariable UUID id) {
        return currencyService.getCurrencyById(id);
    }

    @PostMapping
    public ResponseEntity<?> createCurrency(Authentication authentication, @RequestBody Currency currency) {
        permissionService.requirePermission(authentication, "manage.settings");
        return ResponseEntity.status(HttpStatus.CREATED).body(currencyService.createCurrency(currency));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCurrency(Authentication authentication, @PathVariable UUID id, @RequestBody Currency currency) {
        permissionService.requirePermission(authentication, "manage.settings");
        return ResponseEntity.ok(currencyService.updateCurrency(id, currency));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCurrency(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.settings");
        currencyService.deleteCurrency(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sync-bcv")
    public ResponseEntity<?> syncBCVRate(Authentication authentication) {
        permissionService.requirePermission(authentication, "manage.settings");
        try {
            Double rate = bcvScraperService.fetchOfficialRate();
            Currency updated = currencyService.updateVESRateFromBCV(rate);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "rate", rate,
                    "currency", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}
