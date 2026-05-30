package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Config.Permissions;
import mundo_maquillaje.ecommerce.Enums.Role;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final ProfileService profileService;

    public void requirePermission(Authentication authentication, String permission) {
        Role role = profileService.getUserRole(authentication);
        if (role == null || !Permissions.getPermissionsForRole(role).contains(permission)) {
            throw new AccessDeniedException("Acceso denegado. Permiso requerido: " + permission);
        }
    }
}
