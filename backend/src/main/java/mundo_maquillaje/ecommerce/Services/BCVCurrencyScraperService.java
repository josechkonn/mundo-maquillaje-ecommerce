package mundo_maquillaje.ecommerce.Services;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import javax.net.ssl.*;
import java.io.IOException;
import java.security.cert.X509Certificate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class BCVCurrencyScraperService {

    private static final String BCV_URL = "https://www.bcv.org.ve/";
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    // Pattern to match BCV rate format: 558,64360000 or 36,35 etc.
    private static final Pattern RATE_PATTERN = Pattern.compile("(?i)d[oó]lar.*?(\\d{1,3}(?:[.,]\\d+))");
    private static final Pattern NUMBER_PATTERN = Pattern.compile("(\\d{1,3})[.,](\\d{1,8})");

    static {
        disableSSLVerification();
    }

    private static void disableSSLVerification() {
        try {
            SSLContext sc = getUnsafeSSLContext();
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        } catch (Exception e) {
            log.error("Error configuring SSL", e);
        }
    }

    private static SSLContext getUnsafeSSLContext() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                public void checkClientTrusted(X509Certificate[] certs, String authType) { }
                public void checkServerTrusted(X509Certificate[] certs, String authType) { }
            }
        };
        SSLContext sc = SSLContext.getInstance("TLS");
        sc.init(null, trustAllCerts, new java.security.SecureRandom());
        return sc;
    }

    public Double fetchOfficialRate() {
        try {
            log.info("Fetching BCV rate from {}...", BCV_URL);

            Document doc = Jsoup.connect(BCV_URL)
                    .userAgent(USER_AGENT)
                    .timeout(20000)
                    .header("Accept", "text/html,application/xhtml+xml")
                    .header("Accept-Language", "es-ES,es;q=0.9")
                    .followRedirects(true)
                    .get();

            // Strategy 1: Look for #dolar or #dollar sections
            String rate = extractFromSection(doc, "#dolar", "#dollar", "#usd", "#euro", ".dolar", ".dollar", ".usd");
            if (rate != null) return parseRate(rate);

            // Strategy 2: Search all text for "Dólar" or "USD" near numbers
            rate = extractFromText(doc.body().text());
            if (rate != null) return parseRate(rate);

            // Strategy 3: Look in tables
            rate = extractFromTables(doc);
            if (rate != null) return parseRate(rate);

            // Strategy 4: Look in any element containing "Dólar" text
            rate = extractFromDollarElements(doc);
            if (rate != null) return parseRate(rate);

            throw new RuntimeException("No se encontró la tasa USD en bcv.org.ve");

        } catch (IOException e) {
            log.error("Error fetching BCV", e);
            throw new RuntimeException("Error de conexión con BCV: " + e.getMessage());
        }
    }

    private String extractFromSection(Document doc, String... selectors) {
        for (String selector : selectors) {
            try {
                Elements elements = doc.select(selector);
                for (Element el : elements) {
                    String text = el.text().trim();
                    if (text.toLowerCase().contains("dólar") || text.toLowerCase().contains("dolar") || text.toLowerCase().contains("usd")) {
                        String rate = findRateNumber(text);
                        if (rate != null) {
                            log.info("Found rate in selector {}: {}", selector, rate);
                            return rate;
                        }
                    }
                    // Check children
                    for (Element child : el.children()) {
                        String childRate = findRateNumber(child.text());
                        if (childRate != null) {
                            log.info("Found rate in child of {}: {}", selector, childRate);
                            return childRate;
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("Selector {} failed: {}", selector, e.getMessage());
            }
        }
        return null;
    }

    private String extractFromText(String text) {
        // Look for "Dólar" followed by a number within 100 chars
        Matcher m = RATE_PATTERN.matcher(text);
        if (m.find()) {
            String match = m.group(1);
            log.info("Found rate in body text: {}", match);
            return match;
        }
        return null;
    }

    private String extractFromTables(Document doc) {
        Elements tables = doc.select("table");
        for (Element table : tables) {
            String tableText = table.text().toLowerCase();
            if (tableText.contains("dólar") || tableText.contains("dolar") || tableText.contains("usd")) {
                String rate = findRateNumber(table.text());
                if (rate != null) {
                    log.info("Found rate in table: {}", rate);
                    return rate;
                }
            }
        }
        return null;
    }

    private String extractFromDollarElements(Document doc) {
        Elements elements = doc.select("*:matchesOwn((?i)d[oó]lar|usd)");
        for (Element el : elements) {
            // Check parent and siblings
            Element parent = el.parent();
            if (parent != null) {
                String rate = findRateNumber(parent.text());
                if (rate != null) return rate;
            }
            // Check next siblings
            Element next = el.nextElementSibling();
            if (next != null) {
                String rate = findRateNumber(next.text());
                if (rate != null) return rate;
            }
        }
        return null;
    }

    private String findRateNumber(String text) {
        if (text == null) return null;
        // Match numbers like 558,64360000 or 36,35 or 4.500,00
        Matcher m = NUMBER_PATTERN.matcher(text);
        while (m.find()) {
            String candidate = m.group(0);
            // Skip if it looks like a date or year
            if (candidate.matches("\\d{4}")) continue;
            // For BCV, the rate should be > 1 (USD to VES)
            try {
                String normalized = candidate.replace(".", "").replace(",", ".");
                double value = Double.parseDouble(normalized);
                if (value > 1.0) {
                    return candidate;
                }
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private Double parseRate(String rateText) {
        try {
            // BCV uses comma as decimal separator in Spanish locale
            // e.g., "558,64360000" -> "558.64360000"
            // But might also use dots for thousands: "4.500,00" -> "4500.00"
            String normalized = rateText;
            if (rateText.contains(",") && rateText.contains(".")) {
                // Format: 4.500,00 (dot = thousands, comma = decimal)
                normalized = rateText.replace(".", "").replace(",", ".");
            } else if (rateText.contains(",")) {
                // Format: 558,64360000 (comma = decimal)
                normalized = rateText.replace(",", ".");
            }
            double rate = Double.parseDouble(normalized.trim());
            log.info("Parsed BCV rate: {}", rate);
            return rate;
        } catch (NumberFormatException e) {
            log.error("Failed to parse rate: {}", rateText, e);
            throw new RuntimeException("Formato de tasa inválido: " + rateText);
        }
    }
}
