package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.OrderNumberSequence;
import mundo_maquillaje.ecommerce.Repositories.OrderNumberSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

    private final OrderNumberSequenceRepository sequenceRepository;

    @Transactional
    public String generateOrderNumber() {
        int year = Year.now().getValue();

        OrderNumberSequence sequence = sequenceRepository.findByYear(year)
                .orElseGet(() -> {
                    OrderNumberSequence newSeq = OrderNumberSequence.builder()
                            .year(year)
                            .lastNumber(0L)
                            .build();
                    return sequenceRepository.save(newSeq);
                });

        long nextNumber = sequence.getLastNumber() + 1;
        sequence.setLastNumber(nextNumber);
        sequenceRepository.save(sequence);

        return String.format("%07d/%d", nextNumber, year);
    }
}
