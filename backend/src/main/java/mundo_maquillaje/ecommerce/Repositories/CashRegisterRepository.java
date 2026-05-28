package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.CashRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CashRegisterRepository extends JpaRepository<CashRegister, UUID> {
    List<CashRegister> findByIsActiveTrueOrderByNameAsc();
}
