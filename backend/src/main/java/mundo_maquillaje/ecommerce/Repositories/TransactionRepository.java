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

    @Query("""
        SELECT FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM') as month, SUM(t.amount) as revenue
        FROM Transaction t JOIN t.currency c
        WHERE c.code = :currencyCode
          AND t.status = 'VERIFIED'
          AND t.createdAt BETWEEN :start AND :end
        GROUP BY FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM')
        ORDER BY month
        """)
    List<Object[]> findRevenueOverTimeByMonth(@Param("currencyCode") String currencyCode, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t JOIN t.currency c
        WHERE c.code = :currencyCode
          AND t.status = 'VERIFIED'
          AND t.createdAt BETWEEN :start AND :end
        """)
    double sumRevenueByCurrencyAndDate(@Param("currencyCode") String currencyCode, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.status = 'VERIFIED'
          AND t.createdAt BETWEEN :start AND :end
        """)
    double sumAllRevenueByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT c.code, c.symbol, COALESCE(SUM(t.amount), 0)
        FROM Transaction t JOIN t.currency c
        WHERE t.status = 'VERIFIED'
          AND t.createdAt BETWEEN :start AND :end
        GROUP BY c.code, c.symbol
        ORDER BY SUM(t.amount) DESC
        """)
    List<Object[]> findRevenueGroupedByCurrency(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
