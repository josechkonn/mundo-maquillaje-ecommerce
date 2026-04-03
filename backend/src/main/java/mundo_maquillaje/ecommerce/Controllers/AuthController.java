package mundo_maquillaje.ecommerce.Controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/sync-session")
    public ResponseEntity<Map<String, String>> syncSession(@RequestBody Map<String, String> payload) {
        String accessToken = payload.get("accessToken");
        String refreshToken = payload.get("refreshToken");

        boolean isLogout = accessToken == null || accessToken.trim().isEmpty();
        int maxAge = isLogout ? 0 : 7 * 24 * 60 * 60;

        ResponseCookie accessCookie = ResponseCookie.from("access_token", isLogout ? "" : accessToken)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax") // Critical for cross-port requests on localhost
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", isLogout ? "" : refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of("message",
                        "Cookies HttpOnly " + (isLogout ? "eliminadas" : "establecidas") + " con éxito"));
    }
}
