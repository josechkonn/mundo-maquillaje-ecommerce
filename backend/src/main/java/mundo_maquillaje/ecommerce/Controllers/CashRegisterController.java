package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.CashRegisterRequestDTO;
import mundo_maquillaje.ecommerce.DTO.CashRegisterResponseDTO;
import mundo_maquillaje.ecommerce.Models.CashRegister;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Repositories.CurrencyRepository;
import mundo_maquillaje.ecommerce.Services.CashRegisterService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cash-registers")
@RequiredArgsConstructor
public class CashRegisterController {

    private final CashRegisterService cashRegisterService;
    private final CurrencyRepository currencyRepository;
    private final ProfileService profileService;

    @GetMapping
    public List<CashRegisterResponseDTO> getAllCashRegisters() {
        return cashRegisterService.getAllCashRegisters().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/active")
    public List<CashRegisterResponseDTO> getActiveCashRegisters() {
        return cashRegisterService.getActiveCashRegisters().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public CashRegisterResponseDTO getCashRegisterById(@PathVariable UUID id) {
        return toResponseDTO(cashRegisterService.getCashRegisterById(id));
    }

    @PostMapping
    public ResponseEntity<?> createCashRegister(Authentication authentication, @RequestBody CashRegisterRequestDTO dto) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo administradores pueden gestionar cajas");
        }

        Currency currency = currencyRepository.findById(dto.getCurrencyId())
                .orElseThrow(() -> new RuntimeException("Moneda no encontrada"));

        CashRegister cashRegister = new CashRegister();
        cashRegister.setName(dto.getName());
        cashRegister.setDescription(dto.getDescription());
        cashRegister.setCurrency(currency);
        cashRegister.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        CashRegister saved = cashRegisterService.createCashRegister(cashRegister);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCashRegister(Authentication authentication, @PathVariable UUID id, @RequestBody CashRegisterRequestDTO dto) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo administradores pueden gestionar cajas");
        }

        Currency currency = currencyRepository.findById(dto.getCurrencyId())
                .orElseThrow(() -> new RuntimeException("Moneda no encontrada"));

        CashRegister existing = cashRegisterService.getCashRegisterById(id);
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setCurrency(currency);
        existing.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : existing.getIsActive());

        CashRegister updated = cashRegisterService.updateCashRegister(id, existing);
        return ResponseEntity.ok(toResponseDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCashRegister(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo administradores pueden gestionar cajas");
        }
        cashRegisterService.deleteCashRegister(id);
        return ResponseEntity.noContent().build();
    }

    private CashRegisterResponseDTO toResponseDTO(CashRegister cr) {
        return new CashRegisterResponseDTO(
                cr.getId(),
                cr.getName(),
                cr.getDescription(),
                cr.getCurrency(),
                cr.getIsActive(),
                cr.getCreatedAt(),
                cr.getUpdatedAt()
        );
    }
}
