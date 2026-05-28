package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.CheckoutRequestDTO;
import mundo_maquillaje.ecommerce.Models.*;
import mundo_maquillaje.ecommerce.Repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;
    private final OrderDirectionRepository orderDirectionRepository;
    private final TransactionRepository transactionRepository;
    private final ShippingMethodRepository shippingMethodRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final AddressRepository addressRepository;
    private final ProductVariationRepository productVariationRepository;
    private final ProfileRepository profileRepository;
    private final CartService cartService;
    private final OrderNumberService orderNumberService;
    private final CurrencyRepository currencyRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final DiscountCodeService discountCodeService;

    @Transactional
    public Order processCheckout(UUID userId, CheckoutRequestDTO request, String receiptUrl) {
        if (request.getAddressId() == null) {
            throw new RuntimeException("Debes seleccionar una dirección de envío");
        }
        if (request.getShippingMethodId() == null) {
            throw new RuntimeException("Debes seleccionar un método de envío");
        }
        if (request.getPaymentMethodId() == null) {
            throw new RuntimeException("Debes seleccionar un método de pago");
        }
        if (receiptUrl == null || receiptUrl.trim().isEmpty()) {
            throw new RuntimeException("Debes subir el comprobante de pago");
        }
        if (request.getPaymentReference() == null || request.getPaymentReference().trim().isEmpty()) {
            throw new RuntimeException("Debes ingresar la referencia del pago");
        }

        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<CartProduct> cartItems = cartService.getCartItems(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
        
        ShippingMethod shipping = shippingMethodRepository.findById(request.getShippingMethodId())
                .orElseThrow(() -> new RuntimeException("Método de envío no encontrado"));
        
        PaymentMethod payment = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));

        Currency targetCurrency = payment.getCurrency();
        List<Currency> allCurrencies = currencyRepository.findAll();

        Order order = new Order();
        order.setProfile(user);
        order.setShippingMethod(shipping);
        order.setPaymentMethod(payment);
        order.setCurrency(targetCurrency);
        order.setOrderNumber(orderNumberService.generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        
        double subtotal = 0.0;
        List<OrderProduct> orderProducts = new ArrayList<>();
        
        for (CartProduct cartItem : cartItems) {
            ProductVariation variation = cartItem.getVariation();

            ProductVariation lockedVariation = productVariationRepository.findByIdWithLock(variation.getId())
                    .orElseThrow(() -> new RuntimeException("Variación no encontrada: " + variation.getProduct().getName()));

            if (lockedVariation.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para: " + lockedVariation.getProduct().getName());
            }

            lockedVariation.setStock(lockedVariation.getStock() - cartItem.getQuantity());
            productVariationRepository.save(lockedVariation);

            Currency sourceCurrency = lockedVariation.getProduct().getCurrency();

            double convertedPrice = convertCurrency(
                    lockedVariation.getPrice(),
                    sourceCurrency,
                    targetCurrency,
                    allCurrencies
            );

            OrderProduct op = new OrderProduct();
            op.setOrder(order);
            op.setVariation(lockedVariation);
            op.setProductName(lockedVariation.getProduct().getName());
            op.setVariationName(lockedVariation.getAttributeValue());
            op.setPrice(convertedPrice);
            op.setQuantity(cartItem.getQuantity());
            op.setSubtotal(convertedPrice * cartItem.getQuantity());
            
            subtotal += op.getSubtotal();
            orderProducts.add(op);
        }

        double shippingCost = 0.0;
        String methodName = shipping.getName().toLowerCase();
        
        if (methodName.contains("delivery")) {
            if (shipping.getFreeShippingThreshold() != null && subtotal >= shipping.getFreeShippingThreshold()) {
                shippingCost = 0.0;
            } else {
                Currency usdCurrency = currencyRepository.findByCode("USD")
                        .orElseThrow(() -> new RuntimeException("Moneda USD no encontrada"));
                double convertedShipping = convertCurrency(
                        shipping.getPrice(),
                        usdCurrency,
                        targetCurrency,
                        allCurrencies
                );
                shippingCost = convertedShipping;
            }
        }

        double discountAmount = 0.0;
        if (request.getDiscountCode() != null && !request.getDiscountCode().trim().isEmpty()) {
            String targetCurrencyCode = targetCurrency != null ? targetCurrency.getCode() : null;
            Map<String, Object> validation = discountCodeService.validateDiscountCode(request.getDiscountCode().trim(), subtotal, targetCurrencyCode);
            if (Boolean.TRUE.equals(validation.get("valid"))) {
                discountAmount = (double) validation.get("discountAmount");
                String discountIdStr = (String) validation.get("discountId");
                if (discountIdStr != null) {
                    DiscountCode dc = discountCodeRepository.findById(UUID.fromString(discountIdStr)).orElse(null);
                    if (dc != null) {
                        dc.setTimesUsed(dc.getTimesUsed() != null ? dc.getTimesUsed() + 1 : 1);
                        discountCodeRepository.save(dc);
                    }
                }
            }
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingCost(shippingCost);
        order.setTotalAmount(subtotal + shippingCost - discountAmount);
        
        Order savedOrder = orderRepository.save(order);
        List<OrderProduct> savedProducts = orderProductRepository.saveAll(orderProducts);

        OrderDirection od = new OrderDirection();
        od.setOrder(savedOrder);
        od.setName(address.getName());
        od.setFullname(address.getFullname());
        od.setPhone(address.getPhone());
        od.setDirection(address.getDirection());
        od.setMunicipality(address.getMunicipality());
        od.setParish(address.getParish());
        od.setCity(address.getCity());
        od.setState(address.getState());
        OrderDirection savedDirection = orderDirectionRepository.save(od);

        Transaction transaction = new Transaction();
        transaction.setOrder(savedOrder);
        transaction.setPaymentMethod(payment);
        transaction.setCurrency(targetCurrency);
        transaction.setAmount(savedOrder.getTotalAmount());
        transaction.setReference(request.getPaymentReference());
        transaction.setReceiptUrl(receiptUrl);
        transaction.setStatus(TransactionStatus.PENDING);
        transactionRepository.save(transaction);

        cartService.clearCart(userId);

        savedOrder.setProducts(savedProducts);
        savedOrder.setShippingAddress(savedDirection);

        for (OrderProduct op : savedProducts) {
            ProductVariation v = op.getVariation();
            if (v != null) {
                v.getImages().size();
                v.getProduct().getName();
            }
        }

        return savedOrder;
    }

    private double convertCurrency(double amount, Currency sourceCurrency, Currency targetCurrency, List<Currency> allCurrencies) {
        if (sourceCurrency == null || targetCurrency == null) return amount;

        String srcCode = sourceCurrency.getCode().toUpperCase().trim();
        String tgtCode = targetCurrency.getCode().toUpperCase().trim();

        if (srcCode.equals(tgtCode)) return amount;

        if (allCurrencies == null || allCurrencies.isEmpty()) return amount;

        double rateVES = getRate("VES", allCurrencies);
        double rateCOP = getRate("COP", allCurrencies);

        double convertedValue = amount;

        if (srcCode.equals("USD")) {
            if (isVES(tgtCode)) {
                convertedValue = amount * rateVES;
            } else if (tgtCode.equals("COP")) {
                convertedValue = amount * (rateVES * rateCOP);
            }
        } else if (isVES(srcCode)) {
            if (tgtCode.equals("USD")) {
                convertedValue = amount / rateVES;
            } else if (tgtCode.equals("COP")) {
                convertedValue = amount * rateCOP;
            }
        } else if (srcCode.equals("COP")) {
            if (tgtCode.equals("USD")) {
                convertedValue = amount / (rateVES * rateCOP);
            } else if (isVES(tgtCode)) {
                convertedValue = amount / rateCOP;
            }
        } else {
            double baseValue = amount / (sourceCurrency.getExchangeRate() != null ? sourceCurrency.getExchangeRate() : 1);
            convertedValue = baseValue * (targetCurrency.getExchangeRate() != null ? targetCurrency.getExchangeRate() : 1);
        }

        return convertedValue;
    }

    private double getRate(String code, List<Currency> allCurrencies) {
        for (Currency c : allCurrencies) {
            String dbCode = c.getCode().toUpperCase().trim();
            String searchCode = code.toUpperCase().trim();
            if (dbCode.equals(searchCode) ||
                (searchCode.equals("VES") && (dbCode.equals("VEF") || dbCode.equals("BS") || dbCode.equals("VES")))) {
                return c.getExchangeRate() != null ? c.getExchangeRate() : 1;
            }
        }
        return 1;
    }

    private boolean isVES(String code) {
        return code.equals("VES") || code.equals("VEF") || code.equals("BS");
    }
}
