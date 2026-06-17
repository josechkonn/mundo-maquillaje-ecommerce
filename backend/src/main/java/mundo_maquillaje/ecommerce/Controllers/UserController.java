package mundo_maquillaje.ecommerce.Controllers;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Enums.Role;
import mundo_maquillaje.ecommerce.Models.Profile;
import mundo_maquillaje.ecommerce.Services.PermissionService;
import mundo_maquillaje.ecommerce.Services.ProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final ProfileService profileService;
    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) UUID stateId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Page<Profile> pageResult = profileService.getAllProfiles(search, role, stateId, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(Map.of(
                "content", pageResult.getContent(),
                "totalElements", pageResult.getTotalElements(),
                "totalPages", pageResult.getTotalPages(),
                "number", pageResult.getNumber(),
                "size", pageResult.getSize()
        ));
    }

    @GetMapping("/{id}")
    public Profile getUserById(@PathVariable UUID id) {
        return profileService.getProfileById(id);
    }

    @PostMapping
    public ResponseEntity<?> createUser(Authentication authentication, @RequestBody Profile profile) {
        permissionService.requirePermission(authentication, "manage.users");
        try {
            Profile created = profileService.createProfile(profile);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(Authentication authentication, @PathVariable UUID id, @RequestBody Profile profile) {
        permissionService.requirePermission(authentication, "manage.users");
        try {
            Profile updated = profileService.updateProfile(id, profile);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(Authentication authentication, @PathVariable UUID id) {
        permissionService.requirePermission(authentication, "manage.users");
        try {
            profileService.deleteProfile(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(Authentication authentication, @PathVariable UUID id, @RequestBody Map<String, String> body) {
        permissionService.requirePermission(authentication, "manage.users");
        try {
            Role role = Role.valueOf(body.get("role").toUpperCase());
            Profile updated = profileService.updateRole(id, role);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication) {
        permissionService.requirePermission(authentication, "manage.users");
        return ResponseEntity.ok(Map.of(
                "total", profileService.getTotalCount(),
                "admins", profileService.getCountByRole(Role.ADMIN),
                "employees", profileService.getCountByRole(Role.EMPLOYEE),
                "users", profileService.getCountByRole(Role.USER)
        ));
    }
}
