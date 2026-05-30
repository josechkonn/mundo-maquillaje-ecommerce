package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StateRepository extends JpaRepository<State, UUID> {
    Optional<State> findByName(String name);
}
