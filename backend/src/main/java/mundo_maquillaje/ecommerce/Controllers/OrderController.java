package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.OrderListResponseDTO;
import mundo_maquillaje.ecommerce.Models.Transaction;
import mundo_maquillaje.ecommerce.Services.OrderService;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<?> getOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "true") boolean sortDesc) {

        Page<OrderListResponseDTO> pageResult = orderService.getUserOrders(
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

        return ResponseEntity.ok(Map.of(
                "content", pageResult.getContent(),
                "totalElements", pageResult.getTotalElements(),
                "totalPages", pageResult.getTotalPages(),
                "number", pageResult.getNumber(),
                "size", pageResult.getSize()
        ));
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
    public ResponseEntity<?> getAdminOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "true") boolean sortDesc) {

        permissionService.requirePermission(authentication, "access.admin");

        Page<OrderListResponseDTO> pageResult = orderService.getAdminOrders(
                page, size, search, status, sortBy, sortDesc, startDate, endDate);

        return ResponseEntity.ok(Map.of(
                "content", pageResult.getContent(),
                "totalElements", pageResult.getTotalElements(),
                "totalPages", pageResult.getTotalPages(),
                "number", pageResult.getNumber(),
                "size", pageResult.getSize()
        ));
    }

    @GetMapping("/admin/{orderId}")
    public ResponseEntity<OrderListResponseDTO> getAdminOrderById(
            Authentication authentication,
            @PathVariable String orderId) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID parsedId;
        try {
            parsedId = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        OrderListResponseDTO order = orderService.getAdminOrderById(parsedId);
        return ResponseEntity.ok(order);
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

    @DeleteMapping("/admin/{orderId}")
    public ResponseEntity<Void> deleteOrder(
            Authentication authentication,
            @PathVariable String orderId) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID parsedId;
        try {
            parsedId = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        orderService.deleteOrder(parsedId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{orderId}/verify")
    public ResponseEntity<Transaction> verifyOrder(
            Authentication authentication,
            @PathVariable String orderId) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID parsedId;
        try {
            parsedId = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        Transaction tx = orderService.verifyOrder(parsedId);
        return ResponseEntity.ok(tx);
    }

    @PatchMapping("/admin/{orderId}/reject")
    public ResponseEntity<Transaction> rejectOrder(
            Authentication authentication,
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID parsedId;
        try {
            parsedId = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        String reason = body.getOrDefault("reason", "");
        Transaction tx = orderService.rejectOrder(parsedId, reason);
        return ResponseEntity.ok(tx);
    }

    @PostMapping("/admin/create")
    public ResponseEntity<OrderListResponseDTO> createOrder(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID profileId = UUID.fromString(body.get("profileId").toString());
        OrderListResponseDTO created = orderService.createAdminOrder(profileId, body);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/admin/{orderId}")
    public ResponseEntity<OrderListResponseDTO> updateOrder(
            Authentication authentication,
            @PathVariable String orderId,
            @RequestBody Map<String, Object> body) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID parsedId;
        try {
            parsedId = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        OrderListResponseDTO updated = orderService.updateOrder(parsedId, body);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/admin/{orderId}/products")
    public ResponseEntity<OrderListResponseDTO> addProductToOrder(
            Authentication authentication,
            @PathVariable String orderId,
            @RequestBody Map<String, Object> body) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID parsedId;
        try {
            parsedId = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        OrderListResponseDTO updated = orderService.addProductToOrder(parsedId, body);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/admin/{orderId}/products/{productId}")
    public ResponseEntity<OrderListResponseDTO> updateOrderProduct(
            Authentication authentication,
            @PathVariable String orderId,
            @PathVariable String productId,
            @RequestBody Map<String, Object> body) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID oid, pid;
        try {
            oid = UUID.fromString(orderId);
            pid = UUID.fromString(productId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        OrderListResponseDTO updated = orderService.updateOrderProduct(oid, pid, body);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/{orderId}/products/{productId}")
    public ResponseEntity<OrderListResponseDTO> removeProductFromOrder(
            Authentication authentication,
            @PathVariable String orderId,
            @PathVariable String productId) {

        permissionService.requirePermission(authentication, "manage.orders");

        UUID oid, pid;
        try {
            oid = UUID.fromString(orderId);
            pid = UUID.fromString(productId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        OrderListResponseDTO updated = orderService.removeProductFromOrder(oid, pid);
        return ResponseEntity.ok(updated);
    }
}
