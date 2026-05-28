package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.PaymentMethodCashRegisterDTO;
import mundo_maquillaje.ecommerce.Models.CashRegister;
import mundo_maquillaje.ecommerce.Models.PaymentMethod;
import mundo_maquillaje.ecommerce.Repositories.CashRegisterRepository;
import mundo_maquillaje.ecommerce.Repositories.PaymentMethodRepository;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodRepository paymentMethodRepository;
    private final CashRegisterRepository cashRegisterRepository;
    private final ProfileService profileService;

    @GetMapping
    public List<PaymentMethod> getAllPaymentMethods() {
        return paymentMethodRepository.findAll();
    }

    @GetMapping("/active")
    public List<PaymentMethod> getActivePaymentMethods() {
        return paymentMethodRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    @GetMapping("/{id}")
    public PaymentMethod getPaymentMethodById(@PathVariable UUID id) {
        return paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));
    }

    @PutMapping("/{id}/cash-register")
    public ResponseEntity<?> assignCashRegister(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody PaymentMethodCashRegisterDTO dto) {

        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo administradores pueden gestionar métodos de pago");
        }

        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));

        if (dto.getCashRegisterId() != null) {
            CashRegister cashRegister = cashRegisterRepository.findById(dto.getCashRegisterId())
                    .orElseThrow(() -> new RuntimeException("Caja no encontrada"));
            paymentMethod.setCashRegister(cashRegister);
        } else {
            paymentMethod.setCashRegister(null);
        }

        paymentMethodRepository.save(paymentMethod);
        return ResponseEntity.ok(paymentMethod);
    }

    @PostMapping
    public ResponseEntity<?> createPaymentMethod(Authentication authentication, @RequestBody PaymentMethod paymentMethod) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo administradores pueden gestionar métodos de pago");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentMethodRepository.save(paymentMethod));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePaymentMethod(Authentication authentication, @PathVariable UUID id, @RequestBody PaymentMethod paymentMethod) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo administradores pueden gestionar métodos de pago");
        }
        PaymentMethod existing = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));

        existing.setName(paymentMethod.getName());
        existing.setSlug(paymentMethod.getSlug());
        existing.setDisplayOrder(paymentMethod.getDisplayOrder());
        existing.setIsActive(paymentMethod.getIsActive());
        existing.setCurrency(paymentMethod.getCurrency());
        existing.setFields(paymentMethod.getFields());

        return ResponseEntity.ok(paymentMethodRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePaymentMethod(Authentication authentication, @PathVariable UUID id) {
        if (!profileService.isAuthenticatedUserAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo administradores pueden gestionar métodos de pago");
        }
        paymentMethodRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
