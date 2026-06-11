package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Enums.Role;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Models.State;
import mundo_maquillaje.ecommerce.Repositories.ProfileRepository;
import mundo_maquillaje.ecommerce.Repositories.StateRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final StateRepository stateRepository;

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

    public UUID getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
            throw new RuntimeException("Invalid authentication principal");
        }
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return UUID.fromString(jwt.getSubject());
    }

    public boolean isAuthenticatedUserAdmin(Authentication authentication) {
        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            return isAdmin(userId);
        } catch (Exception e) {
            return false;
        }
    }

    // ── Admin CRUD ──

    public Page<Profile> getAllProfiles(String search, String role, UUID stateId, Pageable pageable) {
        Role roleEnum = null;
        if (role != null && !role.isBlank()) {
            try {
                roleEnum = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore invalid role
            }
        }
        String searchParam = (search != null && !search.isBlank()) ? "%" + search.toLowerCase() + "%" : null;
        return profileRepository.findDTOByFilters(search, searchParam, roleEnum, stateId, pageable);
    }

    public Profile getProfileById(UUID id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Transactional
    public Profile createProfile(Profile profile) {
        if (profileRepository.existsByEmail(profile.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }
        if (profile.getId() == null) {
            profile.setId(UUID.randomUUID());
        }
        if (profile.getState() != null && profile.getState().getId() != null) {
            State state = stateRepository.findById(profile.getState().getId())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
            profile.setState(state);
        }
        return profileRepository.save(profile);
    }

    @Transactional
    public Profile updateProfile(UUID id, Profile profileDetails) {
        Profile profile = getProfileById(id);

        if (!profile.getEmail().equals(profileDetails.getEmail()) &&
            profileRepository.existsByEmail(profileDetails.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }

        profile.setName(profileDetails.getName());
        profile.setEmail(profileDetails.getEmail());
        profile.setPhone(profileDetails.getPhone());
        profile.setAvatarUrl(profileDetails.getAvatarUrl());
        profile.setRole(profileDetails.getRole());

        if (profileDetails.getState() != null && profileDetails.getState().getId() != null) {
            State state = stateRepository.findById(profileDetails.getState().getId())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
            profile.setState(state);
        } else {
            profile.setState(null);
        }

        return profileRepository.save(profile);
    }

    @Transactional
    public void deleteProfile(UUID id) {
        Profile profile = getProfileById(id);
        profileRepository.delete(profile);
    }

    @Transactional
    public Profile updateRole(UUID id, Role role) {
        Profile profile = getProfileById(id);
        profile.setRole(role);
        return profileRepository.save(profile);
    }

    public long getTotalCount() {
        return profileRepository.count();
    }

    public long getCountByRole(Role role) {
        return profileRepository.findByRole(role).size();
    }
}
