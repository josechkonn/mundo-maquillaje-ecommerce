package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Transaction;
import mundo_maquillaje.ecommerce.Models.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByOrderIdIn(List<UUID> orderIds);

    @EntityGraph(attributePaths = { "order", "paymentMethod", "cashRegister", "currency" })
    Page<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = { "order", "paymentMethod", "cashRegister", "currency" })
    List<Transaction> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = { "order", "paymentMethod", "cashRegister", "currency" })
    List<Transaction> findByCashRegisterIdOrderByCreatedAtDesc(UUID cashRegisterId);

    @EntityGraph(attributePaths = { "order", "paymentMethod", "cashRegister", "currency" })
    @Query("SELECT t FROM Transaction t WHERE t.createdAt < :cursor AND t.createdAt >= :startDate AND t.createdAt <= :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findWithCursor(@Param("cursor") LocalDateTime cursor, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @EntityGraph(attributePaths = { "order", "paymentMethod", "cashRegister", "currency" })
    @Query("SELECT t FROM Transaction t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findFirstPage(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("""
        SELECT DATE(t.createdAt) as date, SUM(t.amount) as revenue
        FROM Transaction t JOIN t.currency c
        WHERE c.code = :currencyCode
          AND t.status IN ('PENDING', 'VERIFIED', 'COMPLETED')
          AND t.createdAt BETWEEN :start AND :end
        GROUP BY DATE(t.createdAt)
        ORDER BY date
        """)
    List<Object[]> findRevenueOverTime(@Param("currencyCode") String currencyCode, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM') as month, SUM(t.amount) as revenue
        FROM Transaction t JOIN t.currency c
        WHERE c.code = :currencyCode
          AND t.status IN ('PENDING', 'VERIFIED', 'COMPLETED')
          AND t.createdAt BETWEEN :start AND :end
        GROUP BY FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM')
        ORDER BY month
        """)
    List<Object[]> findRevenueOverTimeByMonth(@Param("currencyCode") String currencyCode, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t JOIN t.currency c
        WHERE c.code = :currencyCode
          AND t.status IN ('PENDING', 'VERIFIED', 'COMPLETED')
          AND t.createdAt BETWEEN :start AND :end
        """)
    double sumRevenueByCurrencyAndDate(@Param("currencyCode") String currencyCode, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.status IN ('PENDING', 'VERIFIED', 'COMPLETED')
          AND t.createdAt BETWEEN :start AND :end
        """)
    double sumAllRevenueByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT c.code, c.symbol, COALESCE(SUM(t.amount), 0)
        FROM Transaction t JOIN t.currency c
        WHERE t.status IN ('PENDING', 'VERIFIED', 'COMPLETED')
          AND t.createdAt BETWEEN :start AND :end
        GROUP BY c.code, c.symbol
        ORDER BY SUM(t.amount) DESC
        """)
    List<Object[]> findRevenueGroupedByCurrency(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT COALESCE(cat.name, 'Sin categoría'),
               t.amount,
               op.subtotal,
               COALESCE(op.discount, 0),
               o.id
        FROM Transaction t
        JOIN t.order o
        JOIN t.currency cur
        JOIN o.products op
        LEFT JOIN op.variation pv
        LEFT JOIN pv.product p
        LEFT JOIN p.category cat
        WHERE cur.code = :currencyCode
          AND t.status IN ('PENDING', 'VERIFIED', 'COMPLETED')
          AND t.createdAt BETWEEN :start AND :end
        """)
    List<Object[]> findTransactionLinesForCategories(
            @Param("currencyCode") String currencyCode,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
        SELECT t.id, t.type, t.status, t.amount, t.createdAt, t.description,
               c.code, c.symbol, pm.name, cr.name
        FROM Transaction t
        JOIN t.currency c
        LEFT JOIN t.paymentMethod pm
        LEFT JOIN t.cashRegister cr
        WHERE (:type IS NULL OR t.type = :type)
          AND t.createdAt BETWEEN :start AND :end
        ORDER BY t.createdAt DESC
        """)
    List<Object[]> findTransactionReport(@Param("type") TransactionType type, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
