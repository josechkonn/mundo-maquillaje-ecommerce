package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Enums.Role;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    public Profile getProfile(UUID userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        profile.setLastAccessAt(LocalDateTime.now());
        profileRepository.save(profile);
        return profile;
    }

    public boolean isAdmin(UUID userId) {
        return profileRepository.findById(userId)
                .map(profile -> profile.getRole() == Role.ADMIN)
                .orElse(false);
    }

    public Role getUserRole(Authentication authentication) {
        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            return profileRepository.findById(userId)
                    .map(Profile::getRole)
                    .orElse(Role.USER);
        } catch (Exception e) {
            return Role.USER;
        }
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
