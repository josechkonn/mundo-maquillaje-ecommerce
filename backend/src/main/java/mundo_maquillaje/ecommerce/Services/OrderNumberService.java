package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Repositories.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

    private final OrderRepository orderRepository;

    public synchronized String generateOrderNumber() {
        int year = Year.now().getValue();
        String yearStr = String.valueOf(year);

        Pageable topOne = PageRequest.of(0, 1);
        List<String> lastNumbers = orderRepository.findOrderNumbersForYearDesc(yearStr, topOne);

        long nextNumber = 1;
        if (!lastNumbers.isEmpty()) {
            String last = lastNumbers.get(0);
            int slashIndex = last.indexOf('/');
            if (slashIndex > 0) {
                String numPart = last.substring(0, slashIndex);
                try {
                    nextNumber = Long.parseLong(numPart) + 1;
                } catch (NumberFormatException e) {
                    // Si por alguna razón no se puede parsear, usar 1
                }
            }
        }

        return String.format("%07d/%d", nextNumber, year);
    }
}
