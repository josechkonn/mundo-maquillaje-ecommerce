package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.OrderListResponseDTO;
import mundo_maquillaje.ecommerce.Services.OrderService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PermissionService permissionService;

    @GetMapping
    public Page<OrderListResponseDTO> getOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "true") boolean sortDesc) {

        return orderService.getUserOrders(
                authentication,
                page,
                size,
                search,
                status,
                sortBy,
                sortDesc,
                startDate,
                endDate
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderListResponseDTO> getOrderById(
            Authentication authentication,
            @PathVariable String orderId) {

        UUID parsedId;
        try {
            parsedId = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        OrderListResponseDTO order = orderService.getUserOrderById(authentication, parsedId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/admin/all")
    public Page<OrderListResponseDTO> getAdminOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "true") boolean sortDesc) {

        return orderService.getAdminOrders(
                page, size, search, status, sortBy, sortDesc, startDate, endDate);
    }

    @PatchMapping("/admin/cancel")
    public ResponseEntity<Void> cancelOrders(
            Authentication authentication,
            @RequestBody List<String> orderIds) {

        permissionService.requirePermission(authentication, "manage.orders");

        List<UUID> ids = orderIds.stream()
                .map(UUID::fromString)
                .toList();

        orderService.cancelOrders(ids);
        return ResponseEntity.noContent().build();
    }
}
