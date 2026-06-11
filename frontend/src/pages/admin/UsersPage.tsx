import { useState, useEffect, useCallback } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { userService, type UserProfile } from "../../services/userService";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import UserForm from "./users/UserForm";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import UsersSkeleton from "../../components/admin/skeletons/UsersSkeleton";

const ROLES = [
  { label: "Admin", value: "ADMIN" },
  { label: "Empleado", value: "EMPLOYEE" },
  { label: "Cliente", value: "USER" },
];

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  EMPLOYEE: "bg-blue-100 text-blue-700",
  USER: "bg-neutral-100 text-neutral-600",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Empleado",
  USER: "Cliente",
};

const UsersPage = () => {
  const profile = useAuthStore(state => state.profile);
  const currentUserId = profile?.id || "";

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDesc, setSortDesc] = useState(true);

  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        page: currentPage - 1,
        size: pageSize,
        sortBy,
        sortDir: sortDesc ? "desc" : "asc",
      });
      setUsers(res.content);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalElements);
    } catch {
      toast.error("No se pudieron cargar los usuarios.");
    }
    setLoading(false);
  }, [search, roleFilter, currentPage, sortBy, sortDesc]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (key: string, desc: boolean) => {
    setSortBy(key);
    setSortDesc(desc);
  };

  const columns: ColumnDef<UserProfile>[] = [
    {
      key: "avatar",
      header: "",
      className: "w-16",
      render: (u) => (
        <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-100 bg-neutral-100 flex-shrink-0 flex items-center justify-center">
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-brand-400">
              {u.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Nombre",
      className: "min-w-[200px]",
      sortable: true,
      render: (u) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-text-base truncate">{u.name}</p>
            {u.id === currentUserId && (
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 text-[9px] font-bold">TÚ</span>
            )}
          </div>
          <p className="text-p-xs text-text-muted truncate">{u.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      className: "w-40",
      render: (u) => (
        <span className="text-sm text-text-muted">{u.phone || "—"}</span>
      ),
    },
    {
      key: "role",
      header: "Rol",
      className: "w-32 text-center",
      sortable: true,
      render: (u) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${ROLE_BADGE[u.role] || ROLE_BADGE.USER}`}>
          {ROLE_LABEL[u.role] || u.role}
        </span>
      ),
    },
    {
      key: "state",
      header: "Estado",
      className: "w-36",
      render: (u) => (
        <span className="text-sm text-text-muted">{u.state?.name || "—"}</span>
      ),
    },
    {
      key: "lastAccessAt",
      header: "Último acceso",
      className: "w-44",
      sortable: true,
      render: (u) => (
        <span className="text-sm text-text-muted">
          {u.lastAccessAt ? new Date(u.lastAccessAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "Nunca"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Registrado",
      className: "w-40",
      sortable: true,
      render: (u) => (
        <span className="text-sm text-text-muted">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </span>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Usuario eliminado correctamente.");
    } catch {
      toast.error("No se pudo eliminar el usuario.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    for (const id of selectedIds) {
      try { await userService.deleteUser(id); } catch { }
    }
    setUsers((prev) => prev.filter((u) => !selectedIds.has(u.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} usuarios eliminados.`);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkRole = async (role: "USER" | "EMPLOYEE" | "ADMIN") => {
    for (const id of selectedIds) {
      try {
        const updated = await userService.updateRole(id, role);
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: updated.role } : u));
      } catch { }
    }
    setSelectedIds(new Set());
    toast.success(`Rol actualizado para ${selectedIds.size} usuarios.`);
  };

  const handleSaveForm = async (data: Partial<UserProfile>) => {
    try {
      if (editingUser) {
        const updated = await userService.updateUser(editingUser.id, data);
        setUsers((prev) => prev.map((u) => u.id === editingUser.id ? updated : u));
      } else {
        const created = await userService.createUser(data);
        setUsers((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingUser(null);
      toast.success(editingUser ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar");
      throw err;
    }
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <UserForm
          user={editingUser}
          onSave={handleSaveForm}
          onCancel={() => { setShowForm(false); setEditingUser(null); }}
        />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete === "bulk") handleBulkDelete();
          else if (confirmDelete) handleDelete(confirmDelete);
        }}
        title={confirmDelete === "bulk" ? "Eliminar usuarios" : "Eliminar usuario"}
        message={
          confirmDelete === "bulk"
            ? `¿Estás seguro de eliminar ${selectedIds.size} usuarios? Esta acción no se puede deshacer.`
            : "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
        }
        loading={deleting}
      />

      {loading ? <UsersSkeleton /> : (
      <DataTable
        title="Usuarios"
        titleInfo={`${totalItems || 0} usuarios registrados`}
        columns={columns}
        data={users}
        isLoading={false}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onSearch={setSearch}
        searchPlaceholder="Buscar por nombre o email..."
        sortBy={sortBy}
        sortDesc={sortDesc}
        onSort={handleSort}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(u) => u.id}
        onEdit={(u) => { setEditingUser(u as UserProfile); setShowForm(true); }}
        onDelete={(u) => setConfirmDelete(u.id)}
        onTrashClick={() => setConfirmDelete("bulk")}
        trashButtonTitle="Eliminar usuarios"
        filters={[
          {
            key: "role",
            label: "Rol",
            options: ROLES,
            value: roleFilter,
            onChange: (v) => { setRoleFilter(v); setCurrentPage(1); },
          },
        ]}
        renderHeaderActions={(
          <div className="w-full flex justify-between sm:w-auto sm:justify-start sm:gap-3">
            <button
              onClick={() => { setEditingUser(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500 shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Crear
            </button>
          </div>
        )}
        headerExtra={selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-brand-50 rounded-2xl border border-brand-100 animate-fade-in mt-6">
            <span className="text-sm font-medium text-text-base">{selectedIds.size} seleccionados</span>
            <div className="w-px h-5 bg-brand-200" />
            <button onClick={() => handleBulkRole("ADMIN")} className="text-sm font-medium text-purple-600 hover:text-purple-700">Admin</button>
            <button onClick={() => handleBulkRole("EMPLOYEE")} className="text-sm font-medium text-blue-600 hover:text-blue-700">Empleado</button>
            <button onClick={() => handleBulkRole("USER")} className="text-sm font-medium text-text-muted hover:text-text-base">Cliente</button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-sm text-text-muted hover:text-text-base">Limpiar</button>
          </div>
        )}
        renderEmpty={(
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <p className="text-text-muted font-medium text-lg mb-2">No hay usuarios</p>
            <p className="text-text-muted text-sm mb-6">Crea tu primer usuario para empezar.</p>
            <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500">
              <PlusIcon className="w-5 h-5" />
              Crear usuario
            </button>
          </div>
        )}
      />)}
    </>
  );
};

export default UsersPage;
