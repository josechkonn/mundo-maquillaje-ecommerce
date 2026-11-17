package mundo_maquillaje.ecommerce.Controllers;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.CashRegister;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Models.Transaction;
import mundo_maquillaje.ecommerce.Models.TransactionStatus;
import mundo_maquillaje.ecommerce.Models.TransactionType;
import mundo_maquillaje.ecommerce.Repositories.CashRegisterRepository;
import mundo_maquillaje.ecommerce.Repositories.CurrencyRepository;
import mundo_maquillaje.ecommerce.Repositories.TransactionRepository;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final CashRegisterRepository cashRegisterRepository;
    private final CurrencyRepository currencyRepository;
    private final PermissionService permissionService;

    @GetMapping
    public Map<String, Object> getAllTransactions(
            Authentication authentication,
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "20") int size) {
        permissionService.requirePermission(authentication, "access.admin");
        PageRequest pageable = PageRequest.of(0, size);
        List<Transaction> transactions;
        String nextCursor = null;

        LocalDateTime startDt = LocalDateTime.of(2000, 1, 1, 0, 0, 0);
        LocalDateTime endDt = LocalDateTime.of(2099, 12, 31, 23, 59, 59);
        if (startDate != null && !startDate.isEmpty()) {
            startDt = LocalDateTime.parse(startDate + "T00:00:00");
        }
        if (endDate != null && !endDate.isEmpty()) {
            endDt = LocalDateTime.parse(endDate + "T23:59:59");
        }

        if (cursor != null && !cursor.isEmpty()) {
            LocalDateTime cursorDate = LocalDateTime.parse(cursor);
            transactions = transactionRepository.findWithCursor(cursorDate, startDt, endDt, pageable);
        } else {
            transactions = transactionRepository.findFirstPage(startDt, endDt, pageable);
        }

        if (!transactions.isEmpty()) {
            nextCursor = transactions.get(transactions.size() - 1).getCreatedAt().toString();
        }

        return Map.of(
                "content", transactions,
                "nextCursor", nextCursor != null ? nextCursor : "",
                "hasMore", !transactions.isEmpty() && transactions.size() == size
        );
    }

    @PostMapping("/{cashRegisterId}/deposit")
    public ResponseEntity<?> deposit(Authentication authentication,
                                     @PathVariable UUID cashRegisterId,
                                     @RequestBody DepositWithdrawRequest request) {
        permissionService.requirePermission(authentication, "manage.settings");

        CashRegister cashRegister = cashRegisterRepository.findById(cashRegisterId)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));

        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        cashRegister.setBalance(cashRegister.getBalance().add(BigDecimal.valueOf(request.getAmount())));
        cashRegisterRepository.save(cashRegister);

        Transaction tx = new Transaction();
        tx.setCashRegister(cashRegister);
        tx.setCurrency(cashRegister.getCurrency());
        tx.setType(TransactionType.DEPOSIT);
        tx.setAmount(request.getAmount());
        tx.setDescription(request.getDescription());
        tx.setReference(request.getReference());
        tx.setStatus(TransactionStatus.COMPLETED);

        Transaction saved = transactionRepository.save(tx);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{cashRegisterId}/withdraw")
    public ResponseEntity<?> withdraw(Authentication authentication,
                                      @PathVariable UUID cashRegisterId,
                                      @RequestBody DepositWithdrawRequest request) {
        permissionService.requirePermission(authentication, "manage.settings");

        CashRegister cashRegister = cashRegisterRepository.findById(cashRegisterId)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));

        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        BigDecimal withdrawAmount = BigDecimal.valueOf(request.getAmount());
        if (cashRegister.getBalance().compareTo(withdrawAmount) < 0) {
            throw new IllegalArgumentException("Fondos insuficientes en la caja");
        }

        cashRegister.setBalance(cashRegister.getBalance().subtract(withdrawAmount));
        cashRegisterRepository.save(cashRegister);

        Transaction tx = new Transaction();
        tx.setCashRegister(cashRegister);
        tx.setCurrency(cashRegister.getCurrency());
        tx.setType(TransactionType.WITHDRAW);
        tx.setAmount(request.getAmount());
        tx.setDescription(request.getDescription());
        tx.setReference(request.getReference());
        tx.setStatus(TransactionStatus.COMPLETED);

        Transaction saved = transactionRepository.save(tx);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/cash-register/{cashRegisterId}")
    public List<Transaction> getTransactionsByCashRegister(Authentication authentication, @PathVariable UUID cashRegisterId) {
        permissionService.requirePermission(authentication, "access.admin");
        return transactionRepository.findByCashRegisterIdOrderByCreatedAtDesc(cashRegisterId);
    }

    @Data
    public static class DepositWithdrawRequest {
        private Double amount;
        private String description;
        private String reference;
    }
}
