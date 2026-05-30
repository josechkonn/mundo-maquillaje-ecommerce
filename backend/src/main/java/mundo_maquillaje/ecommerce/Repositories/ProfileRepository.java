package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Profile;
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
}
