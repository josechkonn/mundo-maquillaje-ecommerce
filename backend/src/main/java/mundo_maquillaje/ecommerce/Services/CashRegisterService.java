package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.CashRegister;
import mundo_maquillaje.ecommerce.Repositories.CashRegisterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CashRegisterService {

    private final CashRegisterRepository cashRegisterRepository;

    public List<CashRegister> getAllCashRegisters() {
        return cashRegisterRepository.findAll();
    }

    public List<CashRegister> getActiveCashRegisters() {
        return cashRegisterRepository.findByIsActiveTrueOrderByNameAsc();
    }

    public CashRegister getCashRegisterById(UUID id) {
        return cashRegisterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));
    }

    @Transactional
    public CashRegister createCashRegister(CashRegister cashRegister) {
        return cashRegisterRepository.save(cashRegister);
    }

    @Transactional
    public CashRegister updateCashRegister(UUID id, CashRegister details) {
        CashRegister existing = getCashRegisterById(id);

        existing.setName(details.getName());
        existing.setDescription(details.getDescription());
        existing.setCurrency(details.getCurrency());
        existing.setIsActive(details.getIsActive());

        return cashRegisterRepository.save(existing);
    }

    @Transactional
    public void deleteCashRegister(UUID id) {
        CashRegister existing = getCashRegisterById(id);
        cashRegisterRepository.delete(existing);
    }
}
