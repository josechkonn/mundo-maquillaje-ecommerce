package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Repositories.CartRepository;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import mundo_maquillaje.ecommerce.Repositories.TrackingEventRepository;
import mundo_maquillaje.ecommerce.Repositories.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final ProfileRepository profileRepository;
    private final TransactionRepository transactionRepository;
    private final CartRepository cartRepository;

    // ─── Sales Summary ───────────────────────────────────────────────────────

    public Map<String, Object> getSalesSummary(String currencyCode, LocalDate startDate, LocalDate endDate) {
        LocalDate prevStart = startDate.minusWeeks(1);
        LocalDate prevEnd = endDate.minusWeeks(1);

        double current = orderRepository.sumOrderProductsByCurrencyAndDate(currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        double previous = orderRepository.sumOrderProductsByCurrencyAndDate(currencyCode, prevStart.atStartOfDay(), prevEnd.atTime(23, 59, 59));

        double change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        return Map.of(
                "current", current,
                "previous", previous,
                "change", Math.round(change * 100) / 100.0
        );
    }

    // ─── Orders Summary ──────────────────────────────────────────────────────

    public Map<String, Object> getOrdersSummary(LocalDate startDate, LocalDate endDate) {
        LocalDate prevStart = startDate.minusWeeks(1);
        LocalDate prevEnd = endDate.minusWeeks(1);

        long current = orderRepository.countOrdersByDate(startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        long previous = orderRepository.countOrdersByDate(prevStart.atStartOfDay(), prevEnd.atTime(23, 59, 59));

        double change = previous > 0 ? ((double) (current - previous) / previous) * 100 : 0;

        return Map.of(
                "current", current,
                "previous", previous,
                "change", Math.round(change * 100) / 100.0
        );
    }

    // ─── Visitors Summary ────────────────────────────────────────────────────

    public Map<String, Object> getVisitorsSummary(LocalDate startDate, LocalDate endDate) {
        LocalDate prevStart = startDate.minusWeeks(1);
        LocalDate prevEnd = endDate.minusWeeks(1);

        long current = trackingEventRepository.countUniqueVisitors(startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        long previous = trackingEventRepository.countUniqueVisitors(prevStart.atStartOfDay(), prevEnd.atTime(23, 59, 59));

        double change = previous > 0 ? ((double) (current - previous) / previous) * 100 : 0;

        return Map.of(
                "current", current,
                "previous", previous,
                "change", Math.round(change * 100) / 100.0
        );
    }

    // ── Top Categories ──────────────────────────────────────────────────────

    public Map<String, Object> getTopCategories(String currencyCode, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.findTopCategoriesByCurrency(
                currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        List<Map<String, Object>> categories = new ArrayList<>();
        double total = 0;
        for (Object[] row : results) {
            total += ((Number) row[1]).doubleValue();
        }

        for (Object[] row : results) {
            categories.add(Map.of(
                    "name", row[0],
                    "total", ((Number) row[1]).doubleValue(),
                    "percentage", total > 0 ? Math.round(((Number) row[1]).doubleValue() / total * 10000) / 100.0 : 0
            ));
        }

        return Map.of(
                "categories", categories,
                "total", total
        );
    }

    // ─── Revenue Over Time ───────────────────────────────────────────────────

    public Map<String, Object> getRevenueOverTime(String currencyCode, LocalDate startDate, LocalDate endDate, String groupBy) {
        List<Object[]> revenueData = transactionRepository.findRevenueOverTime(
                currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        List<Object[]> ordersData = orderRepository.findOrdersOverTime(
                currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        Map<String, Double> revenueMap = new LinkedHashMap<>();
        Map<String, Long> ordersMap = new LinkedHashMap<>();

        for (Object[] row : revenueData) {
            revenueMap.put(row[0].toString(), ((Number) row[1]).doubleValue());
        }
        for (Object[] row : ordersData) {
            ordersMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        // Fill all dates in range, including those without data
        List<String> labels = new ArrayList<>();
        List<Double> revenues = new ArrayList<>();
        List<Long> orders = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            String key = current.toString();
            labels.add(key);
            revenues.add(revenueMap.getOrDefault(key, 0.0));
            orders.add(ordersMap.getOrDefault(key, 0L));
            current = current.plusDays(1);
        }

        return Map.of(
                "labels", labels,
                "revenues", revenues,
                "orders", orders
        );
    }

    // ─── Conversion Funnel ───────────────────────────────────────────────────

    public Map<String, Map<String, Long>> getConversionFunnel(LocalDate startDate, LocalDate endDate) {
        LocalDate prevStart = startDate.minusDays(7);
        LocalDate prevEnd = endDate.minusDays(7);

        List<Object[]> currentResults = trackingEventRepository.countConversionEvents(
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        List<Object[]> prevResults = trackingEventRepository.countConversionEvents(
                prevStart.atStartOfDay(), prevEnd.atTime(23, 59, 59));

        Map<String, Long> current = new LinkedHashMap<>();
        Map<String, Long> previous = new LinkedHashMap<>();
        String[] keys = {"productViews", "addToCart", "checkoutStart", "purchase", "unpaidCarts"};
        for (String key : keys) {
            current.put(key, 0L);
            previous.put(key, 0L);
        }

        for (Object[] row : currentResults) {
            String eventType = (String) row[0];
            long count = ((Number) row[1]).longValue();
            switch (eventType) {
                case "PRODUCT_VIEW" -> current.put("productViews", count);
                case "ADD_TO_CART" -> current.put("addToCart", count);
                case "CHECKOUT_START" -> current.put("checkoutStart", count);
                case "PURCHASE" -> current.put("purchase", count);
            }
        }

        for (Object[] row : prevResults) {
            String eventType = (String) row[0];
            long count = ((Number) row[1]).longValue();
            switch (eventType) {
                case "PRODUCT_VIEW" -> previous.put("productViews", count);
                case "ADD_TO_CART" -> previous.put("addToCart", count);
                case "CHECKOUT_START" -> previous.put("checkoutStart", count);
                case "PURCHASE" -> previous.put("purchase", count);
            }
        }

        current.put("unpaidCarts", cartRepository.countUnpaidCarts(
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59)));
        previous.put("unpaidCarts", cartRepository.countUnpaidCarts(
                prevStart.atStartOfDay(), prevEnd.atTime(23, 59, 59)));

        Map<String, Map<String, Long>> result = new LinkedHashMap<>();
        result.put("current", current);
        result.put("previous", previous);
        return result;
    }

    // ─── Active Users ────────────────────────────────────────────────────────

    public Map<String, Object> getActiveUsers() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart = now.minusDays(30);
        LocalDateTime currentEnd = now;
        LocalDateTime prevStart = now.minusDays(60);
        LocalDateTime prevEnd = now.minusDays(30);

        List<Object[]> currentData = profileRepository.countActiveUsersByState(currentStart, currentEnd);
        List<Object[]> prevData = profileRepository.countActiveUsersByState(prevStart, prevEnd);

        Map<String, Long> currentMap = new LinkedHashMap<>();
        long total = 0;
        for (Object[] row : currentData) {
            String state = row[0] != null ? (String) row[0] : "Sin estado";
            long count = ((Number) row[1]).longValue();
            currentMap.put(state, count);
            total += count;
        }

        Map<String, Long> prevMap = new LinkedHashMap<>();
        for (Object[] row : prevData) {
            String state = row[0] != null ? (String) row[0] : "Sin estado";
            prevMap.put(state, ((Number) row[1]).longValue());
        }

        long prevTotal = prevMap.values().stream().mapToLong(Long::longValue).sum();
        double totalChange = prevTotal > 0 ? Math.round(((double) (total - prevTotal) / prevTotal) * 10000) / 100.0 : 0;

        List<Map<String, Object>> states = new ArrayList<>();
        for (Map.Entry<String, Long> entry : currentMap.entrySet()) {
            String name = entry.getKey();
            long count = entry.getValue();
            long prevCount = prevMap.getOrDefault(name, 0L);
            double change = prevCount > 0 ? Math.round(((double) (count - prevCount) / prevCount) * 10000) / 100.0 : 0;
            double percentage = total > 0 ? Math.round(count * 10000.0 / total) / 100.0 : 0;

            states.add(Map.of(
                    "state", name,
                    "count", count,
                    "percentage", percentage,
                    "change", change
            ));
        }

        return Map.of(
                "total", total,
                "change", totalChange,
                "states", states
        );
    }

    // ─── Monthly Goal Revenue ────────────────────────────────────────────────

    public double getCurrentMonthRevenue(String currencyCode) {
        YearMonth now = YearMonth.now();
        return getMonthRevenue(currencyCode, now.getMonthValue(), now.getYear());
    }

    public double getMonthRevenue(String currencyCode, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        return orderRepository.sumOrderProductsByCurrencyAndDate(currencyCode, start.atStartOfDay(), end.atTime(23, 59, 59));
    }
}
