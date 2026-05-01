package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Services.CurrencyService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;
    private final ProfileService profileService;

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
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage currencies");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(currencyService.createCurrency(currency));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCurrency(Authentication authentication, @PathVariable UUID id, @RequestBody Currency currency) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage currencies");
        }
        return ResponseEntity.ok(currencyService.updateCurrency(id, currency));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCurrency(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators can manage currencies");
        }
        currencyService.deleteCurrency(id);
        return ResponseEntity.noContent().build();
    }
}
