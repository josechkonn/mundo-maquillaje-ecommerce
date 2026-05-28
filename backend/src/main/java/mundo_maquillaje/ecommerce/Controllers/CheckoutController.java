package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mundo_maquillaje.ecommerce.DTO.CheckoutRequestDTO;
import mundo_maquillaje.ecommerce.Models.Address;
import mundo_maquillaje.ecommerce.Models.Order;
import mundo_maquillaje.ecommerce.Repositories.PaymentMethodRepository;
import mundo_maquillaje.ecommerce.Repositories.ShippingMethodRepository;
import mundo_maquillaje.ecommerce.Services.AddressService;
import mundo_maquillaje.ecommerce.Services.CheckoutService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Slf4j
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final ShippingMethodRepository shippingMethodRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final AddressService addressService;
    private final ProfileService profileService;

    /**
     * Retorna la configuración inicial para el checkout:
     * Direcciones del usuario, métodos de envío y métodos de pago.
     */
    @GetMapping("/config")
    public ResponseEntity<?> getCheckoutConfig(Authentication authentication) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        log.info("Cargando config de checkout para usuario: {}", userId);
        
        Map<String, Object> config = new HashMap<>();
        List<Address> addresses = addressService.getAddressesByProfileId(userId);
        log.debug("Direcciones encontradas: {}", addresses.size());
        
        config.put("addresses", addresses);
        config.put("shippingMethods", shippingMethodRepository.findByIsActiveTrue());
        config.put("paymentMethods", paymentMethodRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
        
        return ResponseEntity.ok(config);
    }

    /**
     * Procesa la orden final.
     * Recibe los IDs seleccionados y la URL del comprobante.
     */
    @PostMapping("/process")
    public ResponseEntity<?> processCheckout(
            Authentication authentication,
            @RequestBody CheckoutRequestDTO request) {
        
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        
        try {
            // Pasamos los datos del DTO al servicio para procesar la orden
            Order order = checkoutService.processCheckout(userId, request, request.getReceiptUrl()); 
            
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
