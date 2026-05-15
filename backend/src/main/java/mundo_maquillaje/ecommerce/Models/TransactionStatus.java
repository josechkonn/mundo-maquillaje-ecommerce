package mundo_maquillaje.ecommerce.Models;

public enum TransactionStatus {
    PENDING,    // Pago subido, esperando revisión
    VERIFIED,   // Pago confirmado
    REJECTED    // Pago rechazado (ej. referencia falsa o monto incorrecto)
}
