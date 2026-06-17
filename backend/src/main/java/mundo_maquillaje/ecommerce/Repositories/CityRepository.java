package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CityRepository extends JpaRepository<City, UUID> {
    List<City> findByStateIdOrderByName(UUID stateId);
}
