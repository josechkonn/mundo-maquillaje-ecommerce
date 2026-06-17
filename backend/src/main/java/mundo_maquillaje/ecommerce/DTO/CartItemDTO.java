package mundo_maquillaje.ecommerce.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {

    private UUID id;
    private CartVariationDTO variation;
    private int quantity;
    private LocalDateTime addedAt;

    private UUID productId;
    private String productName;
    private String productSlug;

    private UUID currencyId;
    private String currencyCode;
    private String currencySymbol;
    private int currencyDecimalPlaces;
    private String currencySymbolPosition;
    private double currencyExchangeRate;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartVariationDTO {
        private UUID id;
        private String name;
        private String sku;
        private double price;
        private int stock;
        private String description;
        private String attributeName;
        private String attributeValue;
        private String hexColor;
        private boolean isActive;
        private List<CartImageDTO> images;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartImageDTO {
        private UUID id;
        private String urlImage;
        private int order;
        private String altText;
        private boolean isMain;
    }
}
