package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByOrderIdIn(List<UUID> orderIds);

    @Query("""
        SELECT DATE(t.createdAt) as date, SUM(t.amount) as revenue
        FROM Transaction t JOIN t.currency c
        WHERE c.code = :currencyCode
          AND t.status = 'VERIFIED'
          AND t.createdAt BETWEEN :start AND :end
        GROUP BY DATE(t.createdAt)
        ORDER BY date
        """)
    List<Object[]> findRevenueOverTime(@Param("currencyCode") String currencyCode, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
