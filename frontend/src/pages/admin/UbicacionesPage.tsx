import { useState, useEffect, useCallback } from "react";
import { PlusIcon, MapPinIcon, PencilIcon, TrashIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { locationService, type StateItem, type CityItem, type MunicipalityItem, type ParishItem } from "../../services/locationService";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import UbicacionesSkeleton from "../../components/admin/skeletons/UbicacionesSkeleton";

type Level = "state" | "city" | "municipality" | "parish";

const UbicacionesPage = () => {
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityItem[]>([]);
  const [parishes, setParishes] = useState<ParishItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedState, setSelectedState] = useState<StateItem | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityItem | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityItem | null>(null);

  const [searchStates, setSearchStates] = useState("");
  const [searchCities, setSearchCities] = useState("");
  const [searchMunicipalities, setSearchMunicipalities] = useState("");
  const [searchParishes, setSearchParishes] = useState("");

  const [modalLevel, setModalLevel] = useState<Level | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ level: Level; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationService.getStates();
      setStates(data);
    } catch {
      toast.error("Error al cargar estados.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStates(); }, [fetchStates]);

  useEffect(() => {
    if (selectedState) {
      locationService.getCities(selectedState.id).then(setCities).catch(() => toast.error("Error al cargar ciudades"));
      setSelectedCity(null);
      setMunicipalities([]);
      setParishes([]);
    } else {
      setCities([]);
      setMunicipalities([]);
      setParishes([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedCity) {
      locationService.getMunicipalities(selectedCity.id).then(setMunicipalities).catch(() => toast.error("Error al cargar municipios"));
      setSelectedMunicipality(null);
      setParishes([]);
    } else {
      setMunicipalities([]);
      setParishes([]);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedMunicipality) {
      locationService.getParishes(selectedMunicipality.id).then(setParishes).catch(() => toast.error("Error al cargar parroquias"));
    } else {
      setParishes([]);
    }
  }, [selectedMunicipality]);

  const openCreate = (level: Level) => {
    setModalLevel(level);
    setEditingName("");
    setEditId(null);
  };

  const openEdit = (level: Level, name: string, id: string) => {
    setModalLevel(level);
    setEditingName(name);
    setEditId(id);
  };

  const handleSave = async () => {
    if (!editingName.trim()) { toast.error("El nombre es obligatorio."); return; }
    setSaving(true);
    try {
      if (editId) {
        if (modalLevel === "state") {
          await locationService.updateState(editId, { name: editingName.trim() });
          toast.success("Estado actualizado.");
        } else if (modalLevel === "city" && selectedState) {
          await locationService.updateCity(editId, { name: editingName.trim(), stateId: selectedState.id });
          toast.success("Ciudad actualizada.");
        } else if (modalLevel === "municipality" && selectedCity) {
          await locationService.updateMunicipality(editId, { name: editingName.trim(), cityId: selectedCity.id });
          toast.success("Municipio actualizado.");
        } else if (modalLevel === "parish" && selectedMunicipality) {
          await locationService.updateParish(editId, { name: editingName.trim(), municipalityId: selectedMunicipality.id });
          toast.success("Parroquia actualizada.");
        }
      } else {
        if (modalLevel === "state") {
          await locationService.createState({ name: editingName.trim() });
          toast.success("Estado creado.");
        } else if (modalLevel === "city" && selectedState) {
          await locationService.createCity({ name: editingName.trim(), stateId: selectedState.id });
          toast.success("Ciudad creada.");
        } else if (modalLevel === "municipality" && selectedCity) {
          await locationService.createMunicipality({ name: editingName.trim(), cityId: selectedCity.id });
          toast.success("Municipio creado.");
        } else if (modalLevel === "parish" && selectedMunicipality) {
          await locationService.createParish({ name: editingName.trim(), municipalityId: selectedMunicipality.id });
          toast.success("Parroquia creada.");
        }
      }
      setModalLevel(null);
      await fetchStates();
      if (selectedState) {
        const cs = await locationService.getCities(selectedState.id);
        setCities(cs);
      }
      if (selectedCity) {
        const muns = await locationService.getMunicipalities(selectedCity.id);
        setMunicipalities(muns);
      }
      if (selectedMunicipality) {
        const pars = await locationService.getParishes(selectedMunicipality.id);
        setParishes(pars);
      }
    } catch {
      toast.error("Error al guardar.");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      if (confirmDelete.level === "state") {
        await locationService.deleteState(confirmDelete.id);
        if (selectedState?.id === confirmDelete.id) { setSelectedState(null); setSelectedCity(null); setSelectedMunicipality(null); }
        toast.success("Estado eliminado.");
      } else if (confirmDelete.level === "city") {
        await locationService.deleteCity(confirmDelete.id);
        if (selectedCity?.id === confirmDelete.id) { setSelectedCity(null); setSelectedMunicipality(null); }
        toast.success("Ciudad eliminada.");
      } else if (confirmDelete.level === "municipality") {
        await locationService.deleteMunicipality(confirmDelete.id);
        if (selectedMunicipality?.id === confirmDelete.id) setSelectedMunicipality(null);
        toast.success("Municipio eliminado.");
      } else {
        await locationService.deleteParish(confirmDelete.id);
        toast.success("Parroquia eliminada.");
      }
      await fetchStates();
      if (selectedState) {
        const cs = await locationService.getCities(selectedState.id);
        setCities(cs);
      }
      if (selectedCity) {
        const muns = await locationService.getMunicipalities(selectedCity.id);
        setMunicipalities(muns);
      }
      if (selectedMunicipality) {
        const pars = await locationService.getParishes(selectedMunicipality.id);
        setParishes(pars);
      }
    } catch {
      toast.error("Error al eliminar.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const filteredStates = states.filter(s => s.name.toLowerCase().includes(searchStates.toLowerCase()));
  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(searchCities.toLowerCase()));
  const filteredMunicipalities = municipalities.filter(m => m.name.toLowerCase().includes(searchMunicipalities.toLowerCase()));
  const filteredParishes = parishes.filter(p => p.name.toLowerCase().includes(searchParishes.toLowerCase()));

  const levelConfig: Record<Level, { title: string; placeholder: string }> = {
    state: { title: "Estado", placeholder: "Ej: Zulia" },
    city: { title: "Ciudad", placeholder: "Ej: Maracaibo" },
    municipality: { title: "Municipio", placeholder: "Ej: Maracaibo" },
    parish: { title: "Parroquia", placeholder: "Ej: Bolívar" },
  };

  const renderColumn = (level: Level, items: { id: string; name: string }[], selected: { id: string } | null, onSelect: (item: { id: string; name: string }) => void, search: string, onSearch: (v: string) => void, count: number, parentLabel?: string) => {
    const cfg = levelConfig[level];
    return (
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-base">{cfg.title}s</h3>
            {parentLabel && <p className="text-p-xs text-text-muted mt-0.5">{parentLabel}</p>}
            <p className="text-p-xs text-text-muted mt-0.5">{count} {cfg.title.toLowerCase()}s</p>
          </div>
          <button onClick={() => openCreate(level)} className="p-2 rounded-xl bg-brand-50 text-brand-500 hover:bg-brand-100 transition-colors" title={`Agregar ${cfg.title.toLowerCase()}`}>
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-neutral-50">
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder={`Buscar ${cfg.title.toLowerCase()}s...`} className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-brand-200 bg-neutral-50" />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <MapPinIcon className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
              <p className="text-p-xs text-text-muted">No hay {cfg.title.toLowerCase()}s</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {items.map(item => {
                const isSelected = selected?.id === item.id;
                return (
                  <div key={item.id} className={`flex items-center gap-2 px-4 py-3 transition-colors cursor-pointer ${isSelected ? "bg-brand-50" : "hover:bg-neutral-50"}`} onClick={() => onSelect(item)}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-brand-500" : "bg-neutral-300"}`} />
                    <span className={`flex-1 text-sm truncate ${isSelected ? "font-bold text-brand-700" : "text-text-base"}`}>{item.name}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                      <button onClick={e => { e.stopPropagation(); openEdit(level, item.name, item.id); }} className="p-1.5 rounded-lg hover:bg-neutral-100 text-text-muted hover:text-brand-500 transition-colors" title="Editar">
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelete({ level, id: item.id, name: item.name }); }} className="p-1.5 rounded-lg hover:bg-danger-50 text-text-muted hover:text-danger-500 transition-colors" title="Eliminar">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">Ubicaciones</h2>
          <p className="text-p-s md:text-p-b text-text-muted mt-1">Gestiona estados, ciudades, municipios y parroquias del país.</p>
        </div>
      </div>

      {loading ? <UbicacionesSkeleton /> : (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Column 1: States */}
        <div className="group">
          {renderColumn("state", filteredStates, selectedState, (item) => { setSelectedState(item as StateItem); }, searchStates, setSearchStates, states.length)}
        </div>

        {/* Column 2: Cities */}
        <div className="group">
          {selectedState ? (
            renderColumn("city", filteredCities, selectedCity, (item) => setSelectedCity(item as CityItem), searchCities, setSearchCities, cities.length, `en ${selectedState.name}`)
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center">
              <MapPinIcon className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-text-muted">Selecciona un estado</p>
              <p className="text-p-xs text-text-muted mt-1">para ver sus ciudades</p>
            </div>
          )}
        </div>

        {/* Column 3: Municipalities */}
        <div className="group">
          {selectedCity ? (
            renderColumn("municipality", filteredMunicipalities, selectedMunicipality, (item) => setSelectedMunicipality(item as MunicipalityItem), searchMunicipalities, setSearchMunicipalities, municipalities.length, `en ${selectedCity.name}`)
          ) : selectedState ? (
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center">
              <MapPinIcon className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-text-muted">Selecciona una ciudad</p>
              <p className="text-p-xs text-text-muted mt-1">para ver sus municipios</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center">
              <MapPinIcon className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-text-muted">Selecciona un estado</p>
              <p className="text-p-xs text-text-muted mt-1">para ver sus municipios</p>
            </div>
          )}
        </div>

        {/* Column 4: Parishes */}
        <div className="group">
          {selectedMunicipality ? (
            renderColumn("parish", filteredParishes, null, () => {}, searchParishes, setSearchParishes, parishes.length, `en ${selectedMunicipality.name}`)
          ) : selectedCity ? (
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center">
              <MapPinIcon className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-text-muted">Selecciona un municipio</p>
              <p className="text-p-xs text-text-muted mt-1">para ver sus parroquias</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center">
              <MapPinIcon className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-text-muted">Selecciona un estado</p>
              <p className="text-p-xs text-text-muted mt-1">para ver sus parroquias</p>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb (mobile) */}
      <div className="lg:hidden mt-4 flex items-center gap-1 text-p-xs text-text-muted">
        <span>{states.length} estados</span>
        {selectedState && (<> <ChevronRightIcon className="w-3 h-3" /> <span>{cities.length} ciudades</span> </>)}
        {selectedCity && (<> <ChevronRightIcon className="w-3 h-3" /> <span>{municipalities.length} municipios</span> </>)}
        {selectedMunicipality && (<> <ChevronRightIcon className="w-3 h-3" /> <span>{parishes.length} parroquias</span> </>)}
      </div>
      </>)}

      {/* Edit/Create Modal */}
      <Modal
        isOpen={modalLevel !== null}
        onClose={() => setModalLevel(null)}
        maxWidth="sm"
        header={
          <div>
            <h3 className="text-lg font-bold text-neutral-800">{editId ? "Editar" : "Nuevo"} {levelConfig[modalLevel || "state"].title}</h3>
            <p className="text-p-xs text-text-muted">{editId ? "Modifica el nombre" : "Ingresa el nombre del nuevo"} {levelConfig[modalLevel || "state"].title.toLowerCase()}.</p>
          </div>
        }
        footer={
          <>
            <button onClick={() => setModalLevel(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-base hover:bg-neutral-50 transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-brand-400 text-white text-sm font-bold hover:bg-brand-500 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {editId ? "Guardar" : "Crear"}
            </button>
          </>
        }
      >
        <div className="px-6 py-5">
          <input
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            placeholder={levelConfig[modalLevel || "state"].placeholder}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-200 bg-white"
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
          />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title={`Eliminar ${confirmDelete ? levelConfig[confirmDelete.level].title.toLowerCase() : ""}`}
        message={`¿Eliminar "${confirmDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleting}
      />
    </>
  );
};

export default UbicacionesPage;
