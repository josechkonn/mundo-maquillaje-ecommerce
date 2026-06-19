package mundo_maquillaje.ecommerce.Repositories;

import jakarta.persistence.LockModeType;
import mundo_maquillaje.ecommerce.Models.OrderNumberSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderNumberSequenceRepository extends JpaRepository<OrderNumberSequence, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OrderNumberSequence> findByYear(Integer year);
}
