package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
}
