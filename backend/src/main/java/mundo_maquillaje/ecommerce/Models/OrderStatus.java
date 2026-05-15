package mundo_maquillaje.ecommerce.Models;

public enum OrderStatus {
    PENDING,      // Esperando verificación de pago
    PAID,         // Pago verificado
    PROCESSING,   // Preparando productos
    SHIPPED,      // En camino
    DELIVERED,    // Entregado
    CANCELLED     // Cancelado
}
