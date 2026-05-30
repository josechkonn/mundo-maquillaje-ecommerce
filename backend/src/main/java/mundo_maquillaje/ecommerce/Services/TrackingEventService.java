package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.TrackingEvent;
import mundo_maquillaje.ecommerce.Repositories.TrackingEventRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TrackingEventService {

    private final TrackingEventRepository trackingEventRepository;

    public TrackingEvent trackEvent(String eventType, String ipAddress, String sessionId, String userId, String productId, Map<String, Object> metadata) {
        TrackingEvent event = TrackingEvent.builder()
                .eventType(eventType)
                .ipAddress(ipAddress)
                .sessionId(sessionId)
                .userId(userId != null ? java.util.UUID.fromString(userId) : null)
                .productId(productId != null ? java.util.UUID.fromString(productId) : null)
                .metadata(metadata != null ? metadataToJson(metadata) : null)
                .build();
        return trackingEventRepository.save(event);
    }

    private String metadataToJson(Map<String, Object> metadata) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : metadata.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(entry.getKey()).append("\":");
            Object value = entry.getValue();
            if (value instanceof String) {
                sb.append("\"").append(value).append("\"");
            } else {
                sb.append(value);
            }
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }
}
