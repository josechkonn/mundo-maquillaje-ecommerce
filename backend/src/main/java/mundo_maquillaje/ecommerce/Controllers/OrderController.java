package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Order;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Models.OrderStatus;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProfileService profileService;

    @GetMapping
    public Page<Order> getOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "true") boolean sortDesc) {
        
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        Profile profile = profileService.getProfile(userId);
        
        Sort sort = sortDesc ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        OrderStatus orderStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status string, ignore it
            }
        }

        if (orderStatus != null) {
            if (search != null && !search.trim().isEmpty()) {
                String searchStr = search.trim();
                if (isValidUUID(searchStr)) {
                    return orderRepository.findByProfileAndStatusAndId(profile, orderStatus, UUID.fromString(searchStr), pageable);
                } else {
                    return orderRepository.findByProfileAndStatusAndSearchFields(profile, orderStatus, searchStr, pageable);
                }
            } else {
                return orderRepository.findByProfileAndStatus(profile, orderStatus, pageable);
            }
        } else {
            if (search != null && !search.trim().isEmpty()) {
                String searchStr = search.trim();
                if (isValidUUID(searchStr)) {
                    return orderRepository.findByProfileAndId(profile, UUID.fromString(searchStr), pageable);
                } else {
                    return orderRepository.findByProfileAndSearchFields(profile, searchStr, pageable);
                }
            } else {
                return orderRepository.findByProfile(profile, pageable);
            }
        }
    }

    private boolean isValidUUID(String str) {
        try {
            UUID.fromString(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
