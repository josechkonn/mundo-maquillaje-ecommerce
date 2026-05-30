package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.TrackingEvent;
import mundo_maquillaje.ecommerce.Services.TrackingEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingEventController {

    private final TrackingEventService trackingEventService;

    @PostMapping("/event")
    public ResponseEntity<?> trackEvent(
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp,
            @RequestParam(required = false) String sessionId,
            @RequestBody Map<String, Object> payload) {

        String eventType = (String) payload.get("eventType");
        String userId = (String) payload.get("userId");
        String productId = (String) payload.get("productId");
        @SuppressWarnings("unchecked")
        Map<String, Object> metadata = (Map<String, Object>) payload.get("metadata");

        String ipAddress = forwardedFor != null ? forwardedFor.split(",")[0].trim() : realIp;

        TrackingEvent event = trackingEventService.trackEvent(eventType, ipAddress, sessionId, userId, productId, metadata);
        return ResponseEntity.ok(Map.of("message", "Event tracked", "id", event.getId().toString()));
    }
}
