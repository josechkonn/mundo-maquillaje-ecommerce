package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.DTO.CheckoutRequestDTO;
import mundo_maquillaje.ecommerce.Models.*;
import mundo_maquillaje.ecommerce.Repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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

    @Transactional
    public Order processCheckout(UUID userId, CheckoutRequestDTO request, String receiptUrl) {
        // 1. Obtener Usuario y Carrito
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<CartProduct> cartItems = cartService.getCartItems(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // 2. Obtener Dirección, Envío y Pago
        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
        
        ShippingMethod shipping = shippingMethodRepository.findById(request.getShippingMethodId())
                .orElseThrow(() -> new RuntimeException("Método de envío no encontrado"));
        
        PaymentMethod payment = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));

        // 3. Crear la Orden (Cabecera)
        Order order = new Order();
        order.setProfile(user);
        order.setShippingMethod(shipping);
        order.setPaymentMethod(payment);
        order.setStatus(OrderStatus.PENDING);
        
        // 4. Procesar Productos, Validar Stock y Calcular Totales
        double subtotal = 0.0;
        List<OrderProduct> orderProducts = new ArrayList<>();
        
        for (CartProduct cartItem : cartItems) {
            ProductVariation variation = cartItem.getVariation();
            
            // Validar stock una última vez
            if (variation.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para: " + variation.getProduct().getName());
            }

            // Descontar Stock
            variation.setStock(variation.getStock() - cartItem.getQuantity());
            productVariationRepository.save(variation);

            // Crear Detalle Inmutable
            OrderProduct op = new OrderProduct();
            op.setOrder(order);
            op.setVariation(variation);
            op.setProductName(variation.getProduct().getName());
            op.setVariationName(variation.getAttributeValue()); // Ajustar según tu modelo
            op.setPrice(variation.getPrice());
            op.setQuantity(cartItem.getQuantity());
            op.setSubtotal(variation.getPrice() * cartItem.getQuantity());
            
            subtotal += op.getSubtotal();
            orderProducts.add(op);
        }

        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal + shipping.getPrice()); // Simplificado: Subtotal + Envío
        
        // 5. Guardar Orden y Detalles
        Order savedOrder = orderRepository.save(order);
        orderProductRepository.saveAll(orderProducts);

        // 6. Guardar Snapshot de Dirección (OrderDirection)
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
        orderDirectionRepository.save(od);

        // 7. Crear Transacción Inicial con el Comprobante
        Transaction transaction = new Transaction();
        transaction.setOrder(savedOrder);
        transaction.setPaymentMethod(payment);
        transaction.setAmount(savedOrder.getTotalAmount());
        transaction.setReference(request.getPaymentReference());
        transaction.setReceiptUrl(receiptUrl);
        transaction.setStatus(TransactionStatus.PENDING);
        transactionRepository.save(transaction);

        // 8. Vaciar Carrito
        cartService.clearCart(userId);

        return savedOrder;
    }
}
