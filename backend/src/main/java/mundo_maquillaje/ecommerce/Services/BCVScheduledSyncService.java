package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mundo_maquillaje.ecommerce.Models.Currency;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BCVScheduledSyncService {

    private final BCVCurrencyScraperService bcvScraperService;
    private final CurrencyService currencyService;

    /**
     * Sincroniza automáticamente la tasa del BCV todos los días a las 9:00 AM (hora Venezuela, UTC-4).
     * cron = segundos minutos hora dia-mes mes dia-semana
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "America/Caracas")
    public void syncDailyBCVRate() {
        log.info("[Scheduled] Iniciando sincronización automática de tasa BCV...");
        try {
            Double rate = bcvScraperService.fetchOfficialRate();
            Currency updated = currencyService.updateVESRateFromBCV(rate);
            log.info("[Scheduled] Tasa BCV actualizada automáticamente: {} VES/USD (moneda: {})",
                    rate, updated.getCode());
        } catch (Exception e) {
            log.error("[Scheduled] Falló la sincronización automática de BCV: {}", e.getMessage(), e);
        }
    }
}
