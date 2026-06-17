package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Enums.Role;
import mundo_maquillaje.ecommerce.Models.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    long countByLastAccessAtAfter(LocalDateTime date);

    @Query("SELECT s.name, COUNT(p) FROM Profile p LEFT JOIN p.state s WHERE p.lastAccessAt BETWEEN :start AND :end GROUP BY s.name ORDER BY COUNT(p) DESC")
    List<Object[]> countActiveUsersByState(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT DISTINCT p FROM Profile p LEFT JOIN FETCH p.state WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE :searchParam OR LOWER(p.email) LIKE :searchParam) " +
           "AND (:role IS NULL OR p.role = :role) " +
           "AND (:stateId IS NULL OR p.state.id = :stateId)",
           countQuery = "SELECT COUNT(p) FROM Profile p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE :searchParam OR LOWER(p.email) LIKE :searchParam) " +
           "AND (:role IS NULL OR p.role = :role) " +
           "AND (:stateId IS NULL OR p.state.id = :stateId)")
    Page<Profile> findDTOByFilters(@Param("search") String search,
                                   @Param("searchParam") String searchParam,
                                   @Param("role") Role role,
                                   @Param("stateId") UUID stateId,
                                   Pageable pageable);

    List<Profile> findByRole(Role role);

    boolean existsByEmail(String email);

    @Query("""
        SELECT DATE(p.createdAt), COUNT(p)
        FROM Profile p
        WHERE p.createdAt BETWEEN :start AND :end
        GROUP BY DATE(p.createdAt)
        ORDER BY DATE(p.createdAt)
        """)
    List<Object[]> countNewRegistrationsByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT pr.id, pr.name, pr.email, COUNT(o), SUM(o.totalAmount)
        FROM Order o
        JOIN o.profile pr
        JOIN o.currency c
        WHERE c.code = :currencyCode
          AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
          AND o.createdAt BETWEEN :start AND :end
        GROUP BY pr.id, pr.name, pr.email
        ORDER BY COUNT(o) DESC
        """)
    List<Object[]> findTopCustomersByCurrency(@Param("currencyCode") String currencyCode, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
