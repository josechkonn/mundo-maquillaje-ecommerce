package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Currency;
import mundo_maquillaje.ecommerce.Repositories.CurrencyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final CurrencyRepository currencyRepository;

    public List<Currency> getAllCurrencies() {
        return currencyRepository.findAll();
    }

    public Currency getCurrencyById(UUID id) {
        return currencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Currency not found"));
    }

    @Transactional
    public Currency createCurrency(Currency currency) {
        return currencyRepository.save(currency);
    }

    @Transactional
    public Currency updateCurrency(UUID id, Currency details) {
        Currency currency = getCurrencyById(id);

        currency.setName(details.getName());
        currency.setCode(details.getCode());
        currency.setSymbol(details.getSymbol());
        currency.setExchangeRate(details.getExchangeRate());
        currency.setDecimalPlaces(details.getDecimalPlaces());
        currency.setSymbolPosition(details.getSymbolPosition());
        currency.setIsActive(details.getIsActive());

        return currencyRepository.save(currency);
    }

    @Transactional
    public void deleteCurrency(UUID id) {
        Currency currency = getCurrencyById(id);
        currencyRepository.delete(currency);
    }
}
