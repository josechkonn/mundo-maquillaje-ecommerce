package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

    private final OrderRepository orderRepository;

    public synchronized String generateOrderNumber() {
        int year = Year.now().getValue();

        long countForYear = orderRepository.countByCreatedAtBetween(
                java.time.LocalDateTime.of(year, 1, 1, 0, 0, 0),
                java.time.LocalDateTime.of(year, 12, 31, 23, 59, 59)
        );
        long nextNumber = countForYear + 1;

        return String.format("%07d/%d", nextNumber, year);
    }
}
