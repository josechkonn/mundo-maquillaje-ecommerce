package mundo_maquillaje.ecommerce;

import java.sql.*;
import java.util.Properties;
import java.io.InputStream;

public class DBDebug {
    public static void main(String[] args) throws Exception {
        Properties env = new Properties();
        try (InputStream is = DBDebug.class.getClassLoader().getResourceAsStream(".env.local.properties")) {
            if (is != null) env.load(is);
        }
        String url = env.getProperty("DB_URL", System.getenv("DB_URL"));
        String user = env.getProperty("DB_USERNAME", System.getenv("DB_USERNAME"));
        String pass = env.getProperty("DB_PASSWORD", System.getenv("DB_PASSWORD"));
        if (url == null) {
            System.out.println("No DB_URL found. Check .env.local or environment variables.");
            return;
        }
        try (Connection c = DriverManager.getConnection(url, user, pass)) {
            System.out.println("=== products_variations ===");
            try (Statement s = c.createStatement();
                 ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM products_variations")) {
                rs.next();
                System.out.println("Total rows: " + rs.getInt(1));
            }
            try (Statement s = c.createStatement();
                 ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM products_variations WHERE alert_quantity IS NULL")) {
                rs.next();
                System.out.println("Rows with NULL alert_quantity: " + rs.getInt(1));
            }
            try (Statement s = c.createStatement();
                 ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM products")) {
                rs.next();
                System.out.println("Total products: " + rs.getInt(1));
            }
            try (Statement s = c.createStatement();
                 ResultSet rs = s.executeQuery(
                     "SELECT pv.stock, pv.alert_quantity, p.name " +
                     "FROM products_variations pv " +
                     "JOIN products p ON pv.id_product = p.id " +
                     "LIMIT 5")) {
                System.out.println("\nFirst 5 variations:");
                while (rs.next()) {
                    System.out.println("  " + rs.getString("name") + " | stock=" + rs.getInt("stock") + " | alert=" + rs.getObject("alert_quantity"));
                }
            }
        }
    }
}
