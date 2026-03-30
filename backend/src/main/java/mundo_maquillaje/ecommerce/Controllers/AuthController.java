package mundo_maquillaje.ecommerce.Controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// Permitimos que el frontend de Vite pueda enviar las credentials/cookies (CORS)
@CrossOrigin(origins = {
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175", 
        "http://localhost:5176", 
        "http://localhost:5177"}, 
        allowCredentials = "true")
public class AuthController {

    @PostMapping("/sync-session")
    public ResponseEntity<Map<String, String>> syncSession(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String accessToken = payload.get("accessToken");
        String refreshToken = payload.get("refreshToken");

        // Condición: Si mandaron 'null' o vacío, el usuario se deslogueó => destrozamos las cookies de inmediato (max-age 0)
        boolean isLogout = accessToken == null || accessToken.trim().isEmpty();
        int maxAge = isLogout ? 0 : 7 * 24 * 60 * 60; // 7 días de duración

        // 1⃣ Cookie del Access Token (El que utilizaremos para validar endpoint Spring Security)
        Cookie accessCookie = new Cookie("access_token", isLogout ? "" : accessToken);
        accessCookie.setHttpOnly(true); // Bloquea acceso desde window.document.cookie
        accessCookie.setSecure(false);  // Solo false en localhost. En producción sobre https DEBE ser true.
        accessCookie.setPath("/");
        accessCookie.setMaxAge(maxAge);

        // 2⃣ Cookie del Refresh Token
        Cookie refreshCookie = new Cookie("refresh_token", isLogout ? "" : refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(maxAge);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(Map.of("message", "Cookies HttpOnly " + (isLogout ? "eliminadas" : "establecidas") + " con éxito"));
    }
}
