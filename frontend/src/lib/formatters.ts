import { type Currency } from "../services/productService";

/**
 * Formatea un precio basado en los metadatos de la moneda proporcionada.
 */
export const formatPrice = (price: number, currency?: Currency): string => {
  if (!currency) return price.toString();

  const formattedNumber = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: currency.decimalPlaces || 0,
    maximumFractionDigits: currency.decimalPlaces || 0,
  }).format(price);

  if (currency.symbolPosition === "LEFT") {
    return `${currency.symbol} ${formattedNumber} ${currency.code}`;
  } else {
    return `${formattedNumber} ${currency.symbol}`;
  }
};

/**
 * Convierte un precio de una moneda origen a una destino usando un sistema encadenado
 * de tasas (USD -> VES -> COP).
 * 
 * @param amount Cantidad en la moneda origen
 * @param sourceCurrency Configuración de la moneda original del producto
 * @param targetCurrency Configuración de la moneda seleccionada por el usuario
 * @param allCurrencies Lista completa de monedas para obtener tasas cruzadas
 */
export const convertAndFormatPrice = (
  amount: number,
  sourceCurrency?: Currency,
  targetCurrency?: Currency | null,
  allCurrencies: Currency[] = []
): string => {
  if (!sourceCurrency || !targetCurrency) return formatPrice(amount, sourceCurrency);

  const srcCode = sourceCurrency.code.toUpperCase().trim();
  const tgtCode = targetCurrency.code.toUpperCase().trim();

  // Si son la misma moneda, no hay nada que convertir
  if (srcCode === tgtCode) return formatPrice(amount, targetCurrency);

  // Si no hay tasas cargadas, mostrar precio original sin convertir
  if (!allCurrencies || allCurrencies.length === 0) {
    return formatPrice(amount, sourceCurrency);
  }

  const getRate = (code: string) => {
    const c = allCurrencies.find(curr => {
      const dbCode = curr.code.toUpperCase().trim();
      const searchCode = code.toUpperCase().trim();
      return dbCode === searchCode ||
        (searchCode === "VES" && (dbCode === "VEF" || dbCode === "BS" || dbCode === "VES"));
    });
    return c?.exchangeRate || 1;
  };

  const rateVES = getRate("VES");
  const rateCOP = getRate("COP");

  let convertedValue = amount;

  const isVES = (c: string) => ["VES", "VEF", "BS"].includes(c);

  if (srcCode === "USD") {
    if (isVES(tgtCode)) {
      convertedValue = amount * rateVES;
    } else if (tgtCode === "COP") {
      convertedValue = amount * (rateVES * rateCOP);
    }
  }
  else if (isVES(srcCode)) {
    if (tgtCode === "USD") {
      convertedValue = amount / rateVES;
    } else if (tgtCode === "COP") {
      convertedValue = amount * rateCOP;
    }
  }
  else if (srcCode === "COP") {
    if (tgtCode === "USD") {
      convertedValue = amount / (rateVES * rateCOP);
    } else if (isVES(tgtCode)) {
      convertedValue = amount / rateCOP;
    }
  }
  else {
    const baseValue = amount / (sourceCurrency.exchangeRate || 1);
    convertedValue = baseValue * (targetCurrency.exchangeRate || 1);
  }


  return formatPrice(convertedValue, targetCurrency);
};
