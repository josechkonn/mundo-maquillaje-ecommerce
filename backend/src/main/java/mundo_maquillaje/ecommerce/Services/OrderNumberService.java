package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.OrderNumberSequence;
import mundo_maquillaje.ecommerce.Repositories.OrderNumberSequenceRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

    private final OrderNumberSequenceRepository sequenceRepository;

    @Transactional
    public synchronized String generateOrderNumber() {
        int year = Year.now().getValue();

        for (int attempt = 0; attempt < 3; attempt++) {
            try {
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
            } catch (DataIntegrityViolationException e) {
                if (attempt == 2) {
                    throw new RuntimeException("No se pudo generar el número de orden después de 3 intentos", e);
                }
                try {
                    Thread.sleep(50L * (attempt + 1));
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrumpido al generar número de orden", ie);
                }
            }
        }

        throw new RuntimeException("No se pudo generar el número de orden");
    }
}
