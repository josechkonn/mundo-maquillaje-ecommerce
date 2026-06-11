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
import mundo_maquillaje.ecommerce.Models.ShippingMethod;
import mundo_maquillaje.ecommerce.Models.Transaction;
import mundo_maquillaje.ecommerce.Models.TransactionStatus;
import mundo_maquillaje.ecommerce.Models.TransactionType;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.OrderDirection;
import mundo_maquillaje.ecommerce.Models.ProductVariation;
import mundo_maquillaje.ecommerce.Repositories.CurrencyRepository;
import mundo_maquillaje.ecommerce.Repositories.OrderProductRepository;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import mundo_maquillaje.ecommerce.Repositories.PaymentMethodRepository;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import mundo_maquillaje.ecommerce.Repositories.ShippingMethodRepository;
import mundo_maquillaje.ecommerce.Repositories.ProductVariationRepository;
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
    private final ProfileRepository profileRepository;
    private final CurrencyRepository currencyRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ShippingMethodRepository shippingMethodRepository;
    private final ProductVariationRepository productVariationRepository;

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
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
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
    public OrderListResponseDTO getAdminOrderById(UUID orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
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
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
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

    @Transactional
    public void deleteOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        // Restore stock for each product variation
        List<OrderProduct> orderProducts = orderProductRepository.findByOrderIdIn(List.of(orderId));
        for (OrderProduct op : orderProducts) {
            if (op.getVariation() != null) {
                ProductVariation variation = op.getVariation();
                variation.setStock(variation.getStock() + op.getQuantity());
                productVariationRepository.save(variation);
            }
        }

        // Delete transactions (no cascade from Order to Transaction)
        List<Transaction> transactions = transactionRepository.findByOrderIdIn(List.of(orderId));
        transactionRepository.deleteAll(transactions);

        // Delete the order — CascadeType.ALL handles OrderProduct and OrderDirection
        orderRepository.delete(order);
    }

    @Transactional
    public Transaction verifyOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Solo se pueden verificar pedidos pendientes");
        }

        Transaction transaction = new Transaction();
        transaction.setOrder(order);
        transaction.setPaymentMethod(order.getPaymentMethod());
        transaction.setCurrency(order.getCurrency());
        transaction.setAmount(order.getTotalAmount());
        transaction.setReference(order.getPaymentReference());
        transaction.setReceiptUrl(order.getReceiptUrl());
        transaction.setStatus(TransactionStatus.VERIFIED);
        transaction.setType(TransactionType.ORDER_PAYMENT);
        transactionRepository.save(transaction);

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        return transaction;
    }

    @Transactional
    public Transaction rejectOrder(UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Solo se pueden rechazar pedidos pendientes");
        }

        Transaction transaction = new Transaction();
        transaction.setOrder(order);
        transaction.setPaymentMethod(order.getPaymentMethod());
        transaction.setCurrency(order.getCurrency());
        transaction.setAmount(order.getTotalAmount());
        transaction.setReference(order.getPaymentReference());
        transaction.setReceiptUrl(order.getReceiptUrl());
        transaction.setStatus(TransactionStatus.REJECTED);
        transaction.setType(TransactionType.ORDER_PAYMENT);
        transaction.setDescription(reason);
        transactionRepository.save(transaction);

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        return transaction;
    }

    @Transactional
    public OrderListResponseDTO updateOrder(UUID orderId, Map<String, Object> body) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        if (body.containsKey("status")) {
            order.setStatus(OrderStatus.valueOf(body.get("status").toString().toUpperCase()));
        }

        // If the order is (or was just set to) PAID, ensure a VERIFIED transaction exists
        if (order.getStatus() == OrderStatus.PAID) {
            List<Transaction> existingTx = transactionRepository.findByOrderIdIn(List.of(orderId));
            boolean hasVerified = existingTx.stream().anyMatch(t -> t.getStatus() == TransactionStatus.VERIFIED);
            boolean hasPending = existingTx.stream().anyMatch(t -> t.getStatus() == TransactionStatus.PENDING);
            if (!hasVerified) {
                if (hasPending) {
                    Transaction tx = existingTx.stream().filter(t -> t.getStatus() == TransactionStatus.PENDING).findFirst().get();
                    tx.setStatus(TransactionStatus.VERIFIED);
                    transactionRepository.save(tx);
                } else {
                    Transaction tx = new Transaction();
                    tx.setOrder(order);
                    tx.setPaymentMethod(order.getPaymentMethod());
                    tx.setCurrency(order.getCurrency());
                    tx.setAmount(order.getTotalAmount());
                    tx.setReference(order.getPaymentReference());
                    tx.setReceiptUrl(order.getReceiptUrl());
                    tx.setStatus(TransactionStatus.VERIFIED);
                    tx.setType(TransactionType.ORDER_PAYMENT);
                    transactionRepository.save(tx);
                }
            }
        }

        if (body.containsKey("currencyId") && body.get("currencyId") != null && !body.get("currencyId").toString().trim().isEmpty()) {
            UUID currencyId = UUID.fromString(body.get("currencyId").toString());
            Currency newCurrency = currencyRepository.findById(currencyId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Moneda no encontrada"));
            order.setCurrency(newCurrency);
        }
        if (body.containsKey("shippingCost")) {
            order.setShippingCost(Double.parseDouble(body.get("shippingCost").toString()));
        }
        if (body.containsKey("discountAmount")) {
            order.setDiscountAmount(Double.parseDouble(body.get("discountAmount").toString()));
        }
        if (body.containsKey("taxAmount")) {
            order.setTaxAmount(Double.parseDouble(body.get("taxAmount").toString()));
        }

        recalculateTotal(order);
        orderRepository.save(order);

        List<OrderProduct> products = orderProductRepository.findByOrderIdIn(List.of(orderId));
        List<Transaction> transactions = transactionRepository.findByOrderIdIn(List.of(orderId));
        Map<UUID, List<OrderProduct>> productsByOrder = new HashMap<>();
        productsByOrder.put(orderId, products);
        Map<UUID, List<Transaction>> transactionsByOrder = new HashMap<>();
        transactionsByOrder.put(orderId, transactions);
        return toDTO(order, productsByOrder, transactionsByOrder);
    }

    @Transactional
    public OrderListResponseDTO addProductToOrder(UUID orderId, Map<String, Object> body) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        OrderProduct product = new OrderProduct();
        product.setOrder(order);
        product.setProductName(body.get("productName").toString());
        product.setVariationName(body.getOrDefault("variationName", "").toString());
        product.setPrice(Double.parseDouble(body.get("price").toString()));
        product.setQuantity(Integer.parseInt(body.get("quantity").toString()));
        product.setDiscount(body.containsKey("discount") ? Double.parseDouble(body.get("discount").toString()) : 0.0);
        product.setTaxAmount(body.containsKey("taxAmount") ? Double.parseDouble(body.get("taxAmount").toString()) : 0.0);

        double qty = product.getQuantity();
        double price = product.getPrice();
        double discount = product.getDiscount();
        double tax = product.getTaxAmount();
        product.setSubtotal(qty * price * (1 - discount / 100) * (1 + tax / 100));

        orderProductRepository.save(product);

        recalculateTotalsForOrder(order);
        orderRepository.save(order);

        List<OrderProduct> products = orderProductRepository.findByOrderIdIn(List.of(orderId));
        List<Transaction> transactions = transactionRepository.findByOrderIdIn(List.of(orderId));
        Map<UUID, List<OrderProduct>> productsByOrder = new HashMap<>();
        productsByOrder.put(orderId, products);
        Map<UUID, List<Transaction>> transactionsByOrder = new HashMap<>();
        transactionsByOrder.put(orderId, transactions);
        return toDTO(order, productsByOrder, transactionsByOrder);
    }

    @Transactional
    public OrderListResponseDTO updateOrderProduct(UUID orderId, UUID productId, Map<String, Object> body) {
        OrderProduct product = orderProductRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        if (!product.getOrder().getId().equals(orderId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto no pertenece a este pedido");
        }

        if (body.containsKey("productName")) product.setProductName(body.get("productName").toString());
        if (body.containsKey("variationName")) product.setVariationName(body.get("variationName").toString());
        if (body.containsKey("price")) product.setPrice(Double.parseDouble(body.get("price").toString()));
        if (body.containsKey("quantity")) product.setQuantity(Integer.parseInt(body.get("quantity").toString()));
        if (body.containsKey("discount")) product.setDiscount(Double.parseDouble(body.get("discount").toString()));
        if (body.containsKey("taxAmount")) product.setTaxAmount(Double.parseDouble(body.get("taxAmount").toString()));

        double qty = product.getQuantity();
        double price = product.getPrice();
        double discount = product.getDiscount();
        double tax = product.getTaxAmount();
        product.setSubtotal(qty * price * (1 - discount / 100) * (1 + tax / 100));

        orderProductRepository.save(product);

        recalculateTotalsForOrder(product.getOrder());
        orderRepository.save(product.getOrder());

        List<OrderProduct> products = orderProductRepository.findByOrderIdIn(List.of(orderId));
        List<Transaction> transactions = transactionRepository.findByOrderIdIn(List.of(orderId));
        Map<UUID, List<OrderProduct>> productsByOrder = new HashMap<>();
        productsByOrder.put(orderId, products);
        Map<UUID, List<Transaction>> transactionsByOrder = new HashMap<>();
        transactionsByOrder.put(orderId, transactions);
        return toDTO(product.getOrder(), productsByOrder, transactionsByOrder);
    }

    @Transactional
    public OrderListResponseDTO removeProductFromOrder(UUID orderId, UUID productId) {
        OrderProduct product = orderProductRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        if (!product.getOrder().getId().equals(orderId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto no pertenece a este pedido");
        }

        orderProductRepository.delete(product);

        Order order = product.getOrder();
        recalculateTotalsForOrder(order);
        orderRepository.save(order);

        List<OrderProduct> products = orderProductRepository.findByOrderIdIn(List.of(orderId));
        List<Transaction> transactions = transactionRepository.findByOrderIdIn(List.of(orderId));
        Map<UUID, List<OrderProduct>> productsByOrder = new HashMap<>();
        productsByOrder.put(orderId, products);
        Map<UUID, List<Transaction>> transactionsByOrder = new HashMap<>();
        transactionsByOrder.put(orderId, transactions);
        return toDTO(order, productsByOrder, transactionsByOrder);
    }

    @Transactional
    public OrderListResponseDTO createAdminOrder(UUID profileId, Map<String, Object> body) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        Currency currency = currencyRepository.findById(
                UUID.fromString(body.get("currencyId").toString()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Moneda no encontrada"));

        PaymentMethod paymentMethod = paymentMethodRepository.findById(
                UUID.fromString(body.get("paymentMethodId").toString()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Método de pago no encontrado"));

        ShippingMethod shippingMethod = shippingMethodRepository.findById(
                UUID.fromString(body.get("shippingMethodId").toString()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Método de envío no encontrado"));

        Order order = new Order();
        order.setProfile(profile);
        order.setCurrency(currency);
        order.setPaymentMethod(paymentMethod);
        order.setShippingMethod(shippingMethod);
        order.setShippingCost(body.containsKey("shippingCost") ? Double.parseDouble(body.get("shippingCost").toString()) : 0.0);
        order.setDiscountAmount(body.containsKey("discountAmount") ? Double.parseDouble(body.get("discountAmount").toString()) : 0.0);
        order.setTaxAmount(0.0);
        order.setSubtotal(0.0);
        order.setTotalAmount(0.0);
        order.setPaymentReference(body.containsKey("paymentReference") ? body.get("paymentReference").toString() : null);
        order.setReceiptUrl(body.containsKey("receiptUrl") ? body.get("receiptUrl").toString() : null);
        order.setStatus(body.containsKey("status") ? OrderStatus.valueOf(body.get("status").toString().toUpperCase()) : OrderStatus.PENDING);

        order = orderRepository.save(order);

        // --- Shipping address ---
        if (body.containsKey("shippingAddress")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> addr = (Map<String, Object>) body.get("shippingAddress");
            OrderDirection direction = new OrderDirection();
            direction.setOrder(order);
            direction.setName(addr.getOrDefault("name", "").toString());
            direction.setFullname(addr.getOrDefault("fullname", "").toString());
            direction.setPhone(addr.getOrDefault("phone", "").toString());
            direction.setDirection(addr.getOrDefault("direction", "").toString());
            direction.setCity(addr.getOrDefault("city", "").toString());
            direction.setState(addr.getOrDefault("state", "").toString());
            direction.setMunicipality(addr.getOrDefault("municipality", "").toString());
            direction.setParish(addr.getOrDefault("parish", "").toString());
            order.setShippingAddress(direction);
        }

        // --- Products ---
        if (body.containsKey("products")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> productsData = (List<Map<String, Object>>) body.get("products");
            double subtotalSum = 0.0;

            for (Map<String, Object> p : productsData) {
                OrderProduct op = new OrderProduct();
                op.setOrder(order);
                op.setProductName(p.getOrDefault("productName", "").toString());
                op.setVariationName(p.getOrDefault("variationName", "").toString());
                op.setPrice(Double.parseDouble(p.get("price").toString()));
                op.setQuantity(Integer.parseInt(p.get("quantity").toString()));
                op.setDiscount(p.containsKey("discount") ? Double.parseDouble(p.get("discount").toString()) : 0.0);
                op.setTaxAmount(p.containsKey("taxAmount") ? Double.parseDouble(p.get("taxAmount").toString()) : 0.0);
                double qty = op.getQuantity();
                double price = op.getPrice();
                double discount = op.getDiscount();
                double tax = op.getTaxAmount();
                op.setSubtotal(qty * price * (1 - discount / 100) * (1 + tax / 100));
                subtotalSum += op.getSubtotal();
                orderProductRepository.save(op);
            }

            order.setSubtotal(subtotalSum);
            order.setTotalAmount(subtotalSum + order.getShippingCost() - order.getDiscountAmount());
            order = orderRepository.save(order);
        }

        // --- Transaction (if receipt or reference exists) ---
        if ((order.getReceiptUrl() != null && !order.getReceiptUrl().isBlank()) ||
            (order.getPaymentReference() != null && !order.getPaymentReference().isBlank())) {
            Transaction transaction = new Transaction();
            transaction.setOrder(order);
            transaction.setPaymentMethod(paymentMethod);
            transaction.setCurrency(currency);
            transaction.setAmount(order.getTotalAmount());
            transaction.setReference(order.getPaymentReference());
            transaction.setReceiptUrl(order.getReceiptUrl());
            transaction.setStatus(TransactionStatus.PENDING);
            transaction.setType(TransactionType.ORDER_PAYMENT);
            transactionRepository.save(transaction);
        }

        List<OrderProduct> savedProducts = orderProductRepository.findByOrderIdIn(List.of(order.getId()));
        List<Transaction> savedTransactions = transactionRepository.findByOrderIdIn(List.of(order.getId()));
        Map<UUID, List<OrderProduct>> productsByOrder = new HashMap<>();
        productsByOrder.put(order.getId(), savedProducts);
        Map<UUID, List<Transaction>> transactionsByOrder = new HashMap<>();
        transactionsByOrder.put(order.getId(), savedTransactions);

        return toDTO(order, productsByOrder, transactionsByOrder);
    }

    private void recalculateTotal(Order order) {
        List<OrderProduct> products = orderProductRepository.findByOrderIdIn(List.of(order.getId()));
        double subtotal = products.stream().mapToDouble(OrderProduct::getSubtotal).sum();
        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal + order.getShippingCost() - order.getDiscountAmount());
    }

    private void recalculateTotalsForOrder(Order order) {
        recalculateTotal(order);
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
