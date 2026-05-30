package mundo_maquillaje.ecommerce.Config;

import mundo_maquillaje.ecommerce.Enums.Role;

import java.util.List;
import java.util.Map;

public final class Permissions {

    public static final String ACCESS_ADMIN = "access.admin";
    public static final String VIEW_DASHBOARD = "view.dashboard";
    public static final String MANAGE_PRODUCTS = "manage.products";
    public static final String MANAGE_ORDERS = "manage.orders";
    public static final String MANAGE_USERS = "manage.users";
    public static final String MANAGE_CATEGORIES = "manage.categories";
    public static final String MANAGE_DISCOUNTS = "manage.discounts";
    public static final String VIEW_REPORTS = "view.reports";
    public static final String MANAGE_SETTINGS = "manage.settings";

    private static final Map<Role, List<String>> ROLE_PERMISSIONS = Map.of(
        Role.USER, List.of(),
        Role.EMPLOYEE, List.of(
            ACCESS_ADMIN,
            VIEW_DASHBOARD,
            MANAGE_ORDERS,
            VIEW_REPORTS
        ),
        Role.ADMIN, List.of(
            ACCESS_ADMIN,
            VIEW_DASHBOARD,
            MANAGE_PRODUCTS,
            MANAGE_ORDERS,
            MANAGE_USERS,
            MANAGE_CATEGORIES,
            MANAGE_DISCOUNTS,
            VIEW_REPORTS,
            MANAGE_SETTINGS
        )
    );

    public static List<String> getPermissionsForRole(Role role) {
        return ROLE_PERMISSIONS.getOrDefault(role, List.of());
    }

    private Permissions() {}
}
