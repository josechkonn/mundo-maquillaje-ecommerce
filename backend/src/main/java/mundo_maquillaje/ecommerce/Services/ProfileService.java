package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    public Profile getProfile(UUID userId) {
        return profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public boolean isAdmin(UUID userId) {
        return profileRepository.findById(userId)
                .map(profile -> "ADMIN".equalsIgnoreCase(profile.getRole()))
                .orElse(false);
    }

    /**
     * Extracts the user ID from the Supabase JWT.
     */
    public UUID getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
            throw new RuntimeException("Invalid authentication principal");
        }
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return UUID.fromString(jwt.getSubject());
    }

    /**
     * Combined check for controller use.
     */
    public boolean isAuthenticatedUserAdmin(Authentication authentication) {
        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            return isAdmin(userId);
        } catch (Exception e) {
            return false;
        }
    }
}
