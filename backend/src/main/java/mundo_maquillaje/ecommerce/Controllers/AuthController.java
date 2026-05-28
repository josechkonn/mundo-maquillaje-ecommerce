package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        try {
            UUID userId = profileService.getUserIdFromAuthentication(authentication);
            Profile profile = profileService.getProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
        }
    }

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
                .sameSite("Lax")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", isLogout ? "" : refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(Map.of("message",
                        "Cookies HttpOnly " + (isLogout ? "eliminadas" : "establecidas") + " con éxito"));
    }
}
