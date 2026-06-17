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
        LocalDate prevStart = startDate.minusDays((int) (endDate.toEpochDay() - startDate.toEpochDay() + 1));
        LocalDate prevEnd = startDate.minusDays(1);

        double current = transactionRepository.sumRevenueByCurrencyAndDate(currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        double previous = transactionRepository.sumRevenueByCurrencyAndDate(currencyCode, prevStart.atStartOfDay(), prevEnd.atTime(23, 59, 59));

        double change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        return Map.of(
                "current", current,
                "previous", previous,
                "change", Math.round(change * 100) / 100.0
        );
    }

    // ─── Orders Summary ──────────────────────────────────────────────────────

    public Map<String, Object> getOrdersSummary(LocalDate startDate, LocalDate endDate) {
        LocalDate prevStart = startDate.minusDays((int) (endDate.toEpochDay() - startDate.toEpochDay() + 1));
        LocalDate prevEnd = startDate.minusDays(1);

        long current = orderRepository.countOrdersByStatusAndDate(startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        long previous = orderRepository.countOrdersByStatusAndDate(prevStart.atStartOfDay(), prevEnd.atTime(23, 59, 59));

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
        List<Object[]> rows = transactionRepository.findTransactionLinesForCategories(
                currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        // group by order ID → list of [catName, lineTotal]
        Map<UUID, List<Object[]>> byOrder = new LinkedHashMap<>();
        // order ID → total transaction amount (sum of all transactions for this order)
        Map<UUID, Double> orderAmounts = new HashMap<>();

        for (Object[] row : rows) {
            UUID orderId = (UUID) row[4];
            byOrder.putIfAbsent(orderId, new ArrayList<>());
            byOrder.get(orderId).add(new Object[]{row[0], ((Number) row[2]).doubleValue() - ((Number) row[3]).doubleValue()});
            orderAmounts.put(orderId, ((Number) row[1]).doubleValue());
        }

        Map<String, Double> categoryTotals = new LinkedHashMap<>();

        for (Map.Entry<UUID, List<Object[]>> entry : byOrder.entrySet()) {
            UUID orderId = entry.getKey();
            List<Object[]> lines = entry.getValue();
            double orderAmount = orderAmounts.get(orderId);

            double orderSubtotal = 0;
            Map<String, Double> catSubtotals = new LinkedHashMap<>();
            for (Object[] line : lines) {
                String catName = (String) line[0];
                double lineTotal = (Double) line[1];
                catSubtotals.merge(catName, lineTotal, Double::sum);
                orderSubtotal += lineTotal;
            }

            if (orderSubtotal > 0 && orderAmount > 0) {
                for (Map.Entry<String, Double> catEntry : catSubtotals.entrySet()) {
                    double attribution = orderAmount * (catEntry.getValue() / orderSubtotal);
                    categoryTotals.merge(catEntry.getKey(), attribution, Double::sum);
                }
            }
        }

        double total = categoryTotals.values().stream().mapToDouble(Double::doubleValue).sum();

        List<Map.Entry<String, Double>> sorted = new ArrayList<>(categoryTotals.entrySet());
        sorted.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        List<Map<String, Object>> categories = new ArrayList<>();
        for (Map.Entry<String, Double> entry : sorted) {
            categories.add(Map.of(
                    "name", entry.getKey(),
                    "total", entry.getValue(),
                    "percentage", total > 0 ? Math.round(entry.getValue() / total * 10000) / 100.0 : 0
            ));
        }

        return Map.of(
                "categories", categories,
                "total", total
        );
    }

    // ─── Revenue Over Time ───────────────────────────────────────────────────

    public Map<String, Object> getRevenueOverTime(String currencyCode, LocalDate startDate, LocalDate endDate, String groupBy) {
        boolean byMonth = "month".equals(groupBy);
        List<Object[]> revenueData;
        List<Object[]> ordersData;
        if (byMonth) {
            revenueData = transactionRepository.findRevenueOverTimeByMonth(
                    currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
            ordersData = orderRepository.findOrdersOverTimeByMonth(
                    currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        } else {
            revenueData = transactionRepository.findRevenueOverTime(
                    currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
            ordersData = orderRepository.findOrdersOverTime(
                    currencyCode, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        }

        Map<String, Double> revenueMap = new LinkedHashMap<>();
        Map<String, Long> ordersMap = new LinkedHashMap<>();

        for (Object[] row : revenueData) {
            revenueMap.put(row[0].toString(), ((Number) row[1]).doubleValue());
        }
        for (Object[] row : ordersData) {
            ordersMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        // Fill all dates/months in range, including those without data
        List<String> labels = new ArrayList<>();
        List<Double> revenues = new ArrayList<>();
        List<Long> orders = new ArrayList<>();

        if (byMonth) {
            LocalDate current = startDate.withDayOfMonth(1);
            while (!current.isAfter(endDate)) {
                String key = current.getYear() + "-" + String.format("%02d", current.getMonthValue());
                labels.add(key);
                revenues.add(revenueMap.getOrDefault(key, 0.0));
                orders.add(ordersMap.getOrDefault(key, 0L));
                current = current.plusMonths(1);
            }
        } else {
            LocalDate current = startDate;
            while (!current.isAfter(endDate)) {
                String key = current.toString();
                labels.add(key);
                revenues.add(revenueMap.getOrDefault(key, 0.0));
                orders.add(ordersMap.getOrDefault(key, 0L));
                current = current.plusDays(1);
            }
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
        return transactionRepository.sumRevenueByCurrencyAndDate(currencyCode, start.atStartOfDay(), end.atTime(23, 59, 59));
    }

    // ─── Breakdown by Currency ───────────────────────────────────────────────

    public List<Map<String, Object>> getSalesByCurrency(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = transactionRepository.findRevenueGroupedByCurrency(
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        List<Map<String, Object>> list = new ArrayList<>();
        double grandTotal = results.stream().mapToDouble(r -> ((Number) r[2]).doubleValue()).sum();

        for (Object[] row : results) {
            double amount = ((Number) row[2]).doubleValue();
            list.add(Map.of(
                    "currencyCode", row[0],
                    "symbol", row[1] != null ? row[1] : "",
                    "amount", amount,
                    "percentage", grandTotal > 0 ? Math.round(amount / grandTotal * 10000) / 100.0 : 0
            ));
        }
        return list;
    }

    public List<Map<String, Object>> getOrdersByCurrency(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.findOrdersGroupedByCurrency(
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        List<Map<String, Object>> list = new ArrayList<>();
        long grandTotal = results.stream().mapToLong(r -> ((Number) r[2]).longValue()).sum();

        for (Object[] row : results) {
            long count = ((Number) row[2]).longValue();
            list.add(Map.of(
                    "currencyCode", row[0],
                    "symbol", row[1] != null ? row[1] : "",
                    "count", count,
                    "percentage", grandTotal > 0 ? Math.round((double) count / grandTotal * 10000) / 100.0 : 0
            ));
        }
        return list;
    }

    // ─── Orders by Status ─────────────────────────────────────────────────────

    public Map<String, Object> getOrdersByStatus(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.countOrdersByStatus(
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        Map<String, Long> byStatus = new LinkedHashMap<>();
        long total = 0;
        for (Object[] row : results) {
            String status = row[0].toString();
            long count = ((Number) row[1]).longValue();
            byStatus.put(status, count);
            total += count;
        }

        return Map.of("total", total, "byStatus", byStatus);
    }
}
