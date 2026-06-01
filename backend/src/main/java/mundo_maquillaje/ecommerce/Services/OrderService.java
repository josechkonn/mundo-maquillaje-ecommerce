package mundo_maquillaje.ecommerce.Services;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.*;
import mundo_maquillaje.ecommerce.Models.Order;
import mundo_maquillaje.ecommerce.Models.OrderProduct;
import mundo_maquillaje.ecommerce.Models.OrderStatus;
import mundo_maquillaje.ecommerce.Models.PaymentMethod;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Models.Transaction;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.OrderDirection;
import mundo_maquillaje.ecommerce.Repositories.OrderProductRepository;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import mundo_maquillaje.ecommerce.Repositories.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;
    private final TransactionRepository transactionRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public Page<OrderListResponseDTO> getUserOrders(
            Authentication authentication,
            int page,
            int size,
            String search,
            String status,
            String sortBy,
            boolean sortDesc,
            String startDate,
            String endDate) {

        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        Profile profile = profileService.getProfile(userId);

        Sort sort = sortDesc ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Order> spec = buildSpecification(profile, status, startDate, endDate, search);

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        if (orderPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<UUID> orderIds = orderPage.getContent().stream()
                .map(Order::getId)
                .toList();

        Map<UUID, List<OrderProduct>> productsByOrder = orderProductRepository.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.groupingBy(op -> op.getOrder().getId()));

        Map<UUID, List<Transaction>> transactionsByOrder = transactionRepository.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.groupingBy(t -> t.getOrder().getId()));

        List<OrderListResponseDTO> dtoList = orderPage.getContent().stream()
                .map(order -> toDTO(order, productsByOrder, transactionsByOrder))
                .toList();

        return new PageImpl<>(dtoList, pageable, orderPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public OrderListResponseDTO getUserOrderById(Authentication authentication, UUID orderId) {
        UUID userId = profileService.getUserIdFromAuthentication(authentication);
        Profile profile = profileService.getProfile(userId);

        Order order = orderRepository.findByIdAndProfileWithDetails(orderId, profile)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        List<OrderProduct> products = orderProductRepository.findByOrderIdIn(List.of(orderId));
        List<Transaction> transactions = transactionRepository.findByOrderIdIn(List.of(orderId));

        Map<UUID, List<OrderProduct>> productsByOrder = new HashMap<>();
        productsByOrder.put(orderId, products);

        Map<UUID, List<Transaction>> transactionsByOrder = new HashMap<>();
        transactionsByOrder.put(orderId, transactions);

        return toDTO(order, productsByOrder, transactionsByOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderListResponseDTO> getAdminOrders(
            int page,
            int size,
            String search,
            String status,
            String sortBy,
            boolean sortDesc,
            String startDate,
            String endDate) {

        Sort sort = sortDesc ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Order> spec = buildAdminSpecification(status, startDate, endDate, search);

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        if (orderPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<UUID> orderIds = orderPage.getContent().stream()
                .map(Order::getId)
                .toList();

        Map<UUID, List<OrderProduct>> productsByOrder = orderProductRepository.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.groupingBy(op -> op.getOrder().getId()));

        Map<UUID, List<Transaction>> transactionsByOrder = transactionRepository.findByOrderIdIn(orderIds).stream()
                .collect(Collectors.groupingBy(t -> t.getOrder().getId()));

        List<OrderListResponseDTO> dtoList = orderPage.getContent().stream()
                .map(order -> toDTO(order, productsByOrder, transactionsByOrder))
                .toList();

        return new PageImpl<>(dtoList, pageable, orderPage.getTotalElements());
    }

    private Specification<Order> buildSpecification(
            Profile profile,
            String status,
            String startDate,
            String endDate,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("profile"), profile));

            if (status != null && !status.trim().isEmpty()) {
                try {
                    OrderStatus orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), orderStatus));
                } catch (IllegalArgumentException ignored) {}
            }

            LocalDateTime start = parseStartDate(startDate);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }

            LocalDateTime end = parseEndDate(endDate);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchStr = search.trim();
                UUID searchId = parseSearchId(searchStr);
                if (searchId != null) {
                    predicates.add(cb.equal(root.get("id"), searchId));
                } else {
                    Join<Order, PaymentMethod> paymentJoin = root.join("paymentMethod", JoinType.LEFT);
                    predicates.add(cb.or(
                            cb.like(cb.lower(paymentJoin.get("name")), "%" + searchStr.toLowerCase() + "%"),
                            cb.like(cb.lower(root.get("orderNumber")), "%" + searchStr.toLowerCase() + "%")
                    ));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Specification<Order> buildAdminSpecification(
            String status,
            String startDate,
            String endDate,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.trim().isEmpty()) {
                try {
                    OrderStatus orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), orderStatus));
                } catch (IllegalArgumentException ignored) {}
            }

            LocalDateTime start = parseStartDate(startDate);
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }

            LocalDateTime end = parseEndDate(endDate);
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchStr = search.trim();
                Join<Order, Profile> profileJoin = root.join("profile", JoinType.LEFT);
                Join<Order, PaymentMethod> paymentJoin = root.join("paymentMethod", JoinType.LEFT);
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), "%" + searchStr.toLowerCase() + "%"),
                        cb.like(cb.lower(profileJoin.get("name")), "%" + searchStr.toLowerCase() + "%"),
                        cb.like(cb.lower(profileJoin.get("email")), "%" + searchStr.toLowerCase() + "%")
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private OrderListResponseDTO toDTO(
            Order order,
            Map<UUID, List<OrderProduct>> productsByOrder,
            Map<UUID, List<Transaction>> transactionsByOrder) {

        return OrderListResponseDTO.builder()
                .id(order.getId().toString())
                .orderNumber(order.getOrderNumber())
                .userName(order.getProfile() != null ? order.getProfile().getName() : null)
                .userEmail(order.getProfile() != null ? order.getProfile().getEmail() : null)
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .shippedAt(order.getShippedAt())
                .currency(toCurrencyDTO(order.getCurrency()))
                .shippingAddress(toDirectionDTO(order.getShippingAddress()))
                .products(toProductDTOs(productsByOrder.getOrDefault(order.getId(), Collections.emptyList())))
                .paymentMethod(toPaymentMethodDTO(order.getPaymentMethod()))
                .transactions(toTransactionDTOs(transactionsByOrder.getOrDefault(order.getId(), Collections.emptyList())))
                .build();
    }

    private CurrencyDTO toCurrencyDTO(Currency currency) {
        if (currency == null) return null;
        return CurrencyDTO.builder()
                .id(currency.getId().toString())
                .name(currency.getName())
                .code(currency.getCode())
                .symbol(currency.getSymbol())
                .exchangeRate(currency.getExchangeRate())
                .decimalPlaces(currency.getDecimalPlaces())
                .symbolPosition(currency.getSymbolPosition())
                .build();
    }

    private OrderDirectionDTO toDirectionDTO(OrderDirection direction) {
        if (direction == null) return null;
        return OrderDirectionDTO.builder()
                .id(direction.getId().toString())
                .name(direction.getName())
                .fullname(direction.getFullname())
                .phone(direction.getPhone())
                .direction(direction.getDirection())
                .municipality(direction.getMunicipality())
                .parish(direction.getParish())
                .city(direction.getCity())
                .state(direction.getState())
                .build();
    }

    private List<OrderProductDTO> toProductDTOs(List<OrderProduct> products) {
        return products.stream()
                .map(this::toProductDTO)
                .collect(Collectors.toList());
    }

    private OrderProductDTO toProductDTO(OrderProduct product) {
        return OrderProductDTO.builder()
                .id(product.getId().toString())
                .productName(product.getProductName())
                .variationName(product.getVariationName())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .subtotal(product.getSubtotal())
                .discount(product.getDiscount())
                .taxAmount(product.getTaxAmount())
                .build();
    }

    private PaymentMethodDTO toPaymentMethodDTO(PaymentMethod paymentMethod) {
        if (paymentMethod == null) return null;
        return PaymentMethodDTO.builder()
                .id(paymentMethod.getId().toString())
                .name(paymentMethod.getName())
                .slug(paymentMethod.getSlug())
                .currency(toCurrencyDTO(paymentMethod.getCurrency()))
                .build();
    }

    private List<TransactionDTO> toTransactionDTOs(List<Transaction> transactions) {
        return transactions.stream()
                .map(this::toTransactionDTO)
                .collect(Collectors.toList());
    }

    private TransactionDTO toTransactionDTO(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId().toString())
                .amount(transaction.getAmount())
                .reference(transaction.getReference())
                .receiptUrl(transaction.getReceiptUrl())
                .status(transaction.getStatus() != null ? transaction.getStatus().name() : null)
                .currency(toCurrencyDTO(transaction.getCurrency()))
                .paymentMethod(toPaymentMethodDTO(transaction.getPaymentMethod()))
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    @Transactional
    public void cancelOrders(List<UUID> orderIds) {
        List<Order> orders = orderRepository.findAllById(orderIds);
        for (Order order : orders) {
            order.setStatus(OrderStatus.CANCELLED);
        }
        orderRepository.saveAll(orders);
    }

    private LocalDateTime parseStartDate(String startDate) {
        if (startDate == null || startDate.trim().isEmpty()) return null;
        try {
            return java.time.LocalDate.parse(startDate.trim()).atStartOfDay();
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDateTime parseEndDate(String endDate) {
        if (endDate == null || endDate.trim().isEmpty()) return null;
        try {
            return java.time.LocalDate.parse(endDate.trim()).atTime(23, 59, 59);
        } catch (Exception e) {
            return null;
        }
    }

    private UUID parseSearchId(String search) {
        if (search == null || search.trim().isEmpty()) return null;
        try {
            return UUID.fromString(search.trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
