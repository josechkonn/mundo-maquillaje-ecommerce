package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductVariationRepository;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import mundo_maquillaje.ecommerce.Repositories.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportsService {

    private final OrderRepository orderRepository;
    private final ProductVariationRepository productVariationRepository;
    private final ProfileRepository profileRepository;
    private final TransactionRepository transactionRepository;
    private final DashboardService dashboardService;

    // ─── Sales Report ────────────────────────────────────────────────────────

    public List<Map<String, Object>> getSalesReport(String currencyCode, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        List<Object[]> rows;
        if (currencyCode != null && !currencyCode.isEmpty()) {
            rows = orderRepository.findSalesReportByCurrency(currencyCode, start, end);
        } else {
            rows = orderRepository.findSalesReport(start, end);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(Map.of(
                "orderNumber", row[0],
                "date", row[1],
                "customerName", row[2] != null ? row[2] : "",
                "totalAmount", row[3],
                "currencyCode", row[4],
                "currencySymbol", row[5] != null ? row[5] : "",
                "status", row[6]
            ));
        }
        return result;
    }

    // ─── Stock Report ────────────────────────────────────────────────────────

    public Map<String, Object> getStockReport(String currencyCode) {
        var variations = productVariationRepository.findAll();
        log.info("[StockReport] currencyCode={}, total variations in DB={}", currencyCode, variations.size());
        List<Map<String, Object>> items = new ArrayList<>();
        int lowCount = 0;
        int outCount = 0;
        int totalStock = 0;
        double totalValue = 0;

        for (var v : variations) {
            var p = v.getProduct();
            if (p == null) continue;
            var c = p.getCurrency();
            String varCurrencyCode = c != null ? c.getCode() : "N/A";
            if (currencyCode != null && !currencyCode.isEmpty() && !currencyCode.equals(varCurrencyCode)) {
                continue;
            }

            int stock = v.getStock() != null ? v.getStock() : 0;
            int alert = v.getAlertQuantity() != null ? v.getAlertQuantity() : 5;
            double price = v.getPrice() != null ? v.getPrice() : 0.0;
            String status;
            if (stock == 0) { status = "OUT"; outCount++; }
            else if (stock <= alert) { status = "LOW"; lowCount++; }
            else status = "OK";

            totalStock += stock;
            totalValue += price * stock;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("productName", p.getName());
            item.put("variationName", v.getName());
            item.put("attributeName", v.getAttributeName() != null ? v.getAttributeName() : "");
            item.put("attributeValue", v.getAttributeValue() != null ? v.getAttributeValue() : "");
            item.put("sku", v.getSku() != null ? v.getSku() : "");
            item.put("stock", stock);
            item.put("alertQuantity", alert);
            item.put("price", price);
            item.put("currencyCode", varCurrencyCode);
            item.put("currencySymbol", c != null && c.getSymbol() != null ? c.getSymbol() : "");
            item.put("isActive", v.getIsActive() != null ? v.getIsActive() : true);
            item.put("status", status);
            items.add(item);
        }

        log.info("[StockReport] items after filter={}", items.size());
        return Map.of(
            "items", items,
            "totalVariations", items.size(),
            "lowStockCount", lowCount,
            "outOfStockCount", outCount,
            "totalStock", totalStock,
            "totalValue", totalValue
        );
    }

    // ─── Orders Report ───────────────────────────────────────────────────────

    public List<Map<String, Object>> getOrdersReport(String statusStr, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        mundo_maquillaje.ecommerce.Models.OrderStatus status = null;
        if (statusStr != null && !statusStr.isEmpty()) {
            try {
                status = mundo_maquillaje.ecommerce.Models.OrderStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // invalid status, ignore filter
            }
        }
        List<Object[]> rows = orderRepository.findOrdersReport(status, start, end);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(Map.of(
                "orderNumber", row[0],
                "date", row[1],
                "customerName", row[2] != null ? row[2] : "",
                "totalAmount", row[3],
                "currencyCode", row[4],
                "currencySymbol", row[5] != null ? row[5] : "",
                "status", row[6]
            ));
        }
        return result;
    }

    // ─── Customers Report ────────────────────────────────────────────────────

    public Map<String, Object> getCustomersReport(String currencyCode, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        // New registrations
        List<Object[]> regRows = profileRepository.countNewRegistrationsByDate(start, end);
        List<Map<String, Object>> newRegistrations = new ArrayList<>();
        for (Object[] row : regRows) {
            newRegistrations.add(Map.of(
                "date", row[0].toString(),
                "count", ((Number) row[1]).intValue()
            ));
        }

        // Top customers by currency
        List<Object[]> custRows = profileRepository.findTopCustomersByCurrency(currencyCode, start, end);
        List<Map<String, Object>> topCustomers = new ArrayList<>();
        for (Object[] row : custRows) {
            topCustomers.add(Map.of(
                "id", row[0],
                "name", row[1] != null ? row[1] : "",
                "email", row[2] != null ? row[2] : "",
                "orderCount", ((Number) row[3]).intValue(),
                "totalSpent", row[4]
            ));
        }

        long totalCustomers = profileRepository.count();
        long activeCustomers = profileRepository.countByLastAccessAtAfter(LocalDateTime.now().minusDays(30));

        return Map.of(
            "newRegistrations", newRegistrations,
            "topCustomers", topCustomers,
            "totalCustomers", totalCustomers,
            "activeCustomers", activeCustomers,
            "currencyCode", currencyCode
        );
    }

    // ─── Best Sellers ────────────────────────────────────────────────────────

    public List<Map<String, Object>> getBestSellers(String currencyCode, LocalDate startDate, LocalDate endDate, int limit) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        List<Object[]> rows = orderRepository.findBestSellers(currencyCode, start, end);
        List<Map<String, Object>> result = new ArrayList<>();
        int count = 0;
        for (Object[] row : rows) {
            if (count >= limit) break;
            result.add(Map.of(
                "productName", row[0],
                "variationName", row[1],
                "quantitySold", ((Number) row[2]).intValue(),
                "totalRevenue", row[3],
                "currencyCode", currencyCode
            ));
            count++;
        }
        return result;
    }

    // ─── Revenue by Category ─────────────────────────────────────────────────

    public Map<String, Object> getRevenueByCategory(String currencyCode, LocalDate startDate, LocalDate endDate) {
        return dashboardService.getTopCategories(currencyCode, startDate, endDate);
    }

    // ─── Transactions Report ─────────────────────────────────────────────────

    public List<Map<String, Object>> getTransactionsReport(String typeStr, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        mundo_maquillaje.ecommerce.Models.TransactionType type = null;
        if (typeStr != null && !typeStr.isEmpty()) {
            try {
                type = mundo_maquillaje.ecommerce.Models.TransactionType.valueOf(typeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // invalid type, ignore filter
            }
        }
        List<Object[]> rows = transactionRepository.findTransactionReport(type, start, end);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(Map.of(
                "id", row[0],
                "type", row[1],
                "status", row[2],
                "amount", row[3],
                "date", row[4],
                "description", row[5] != null ? row[5] : "",
                "currencyCode", row[6],
                "currencySymbol", row[7] != null ? row[7] : "",
                "paymentMethod", row[8] != null ? row[8] : "",
                "cashRegister", row[9] != null ? row[9] : ""
            ));
        }
        return result;
    }

    // ─── Conversion Report ───────────────────────────────────────────────────

    public Map<String, Map<String, Long>> getConversionReport(LocalDate startDate, LocalDate endDate) {
        return dashboardService.getConversionFunnel(startDate, endDate);
    }
}
