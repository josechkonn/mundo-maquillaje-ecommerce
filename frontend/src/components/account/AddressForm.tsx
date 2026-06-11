import React, { useState, useEffect, useRef, useCallback } from "react";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import { locationService, type LocationItem } from "../../services/locationService";

interface Address {
  id?: string;
  name: string;
  fullname: string;
  phone: string;
  direction: string;
  city: string;
  stateId: string;
  cityId: string;
  municipalityId: string;
  parishId: string;
  stateName?: string;
  cityName?: string;
  municipalityName?: string;
  parishName?: string;
}

interface AddressFormProps {
  initialData?: Address | null;
  onSubmit: (data: Address) => void;
  onCancel: () => void;
  isLoading?: boolean;
  hideHeader?: boolean;
}

const SearchableSelect: React.FC<{
  label: string;
  placeholder: string;
  options: LocationItem[];
  value: string;
  onChange: (id: string, name: string) => void;
  disabled?: boolean;
  loading?: boolean;
}> = ({ label, placeholder, options, value, onChange, disabled = false, loading = false }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedName = options.find(o => o.id === value)?.name || "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setSearch("");
  }, [options]);

  const filtered = search
    ? options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <label className="block text-p-s font-semibold text-text-base mb-1.5">{label}</label>
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full h-[46px] px-4 rounded-full border border-neutral-300 bg-white text-p-s flex items-center justify-between cursor-pointer transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-brand-400"}
          ${open ? "border-brand-400 ring-2 ring-brand-100" : ""}`}
      >
        <span className={selectedName ? "text-text-base" : "text-text-muted"}>
          {loading ? "Cargando..." : selectedName || placeholder}
        </span>
        <svg className={`w-4 h-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
          <div className="p-2 border-b border-neutral-100">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full h-[36px] px-3 rounded-full bg-neutral-50 border border-neutral-200 text-p-s focus:outline-none focus:border-brand-400"
              autoFocus
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-p-xs text-text-muted">Sin resultados</p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { onChange(opt.id, opt.name); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-p-s transition-colors hover:bg-brand-50
                    ${opt.id === value ? "bg-brand-100 text-brand-700 font-semibold" : "text-text-base"}`}
                >
                  {opt.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AddressForm = ({ initialData, onSubmit, onCancel, isLoading, hideHeader = false }: AddressFormProps) => {
  const [formData, setFormData] = useState<Address>({
    name: "",
    fullname: "",
    phone: "",
    direction: "",
    city: "",
    stateId: "",
    cityId: "",
    municipalityId: "",
    parishId: "",
  });

  const [states, setStates] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [municipalities, setMunicipalities] = useState<LocationItem[]>([]);
  const [parishes, setParishes] = useState<LocationItem[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingMun, setLoadingMun] = useState(false);
  const [loadingPar, setLoadingPar] = useState(false);
  const [statesLoaded, setStatesLoaded] = useState(false);

  useEffect(() => {
    locationService.getStates().then(setStates).catch(() => {}).finally(() => setStatesLoaded(true));
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.stateId) {
        setLoadingCities(true);
        locationService.getCities(initialData.stateId)
          .then(cs => {
            setCities(cs);
            if (initialData.cityId) {
              setLoadingMun(true);
              locationService.getMunicipalities(initialData.cityId)
                .then(muns => {
                  setMunicipalities(muns);
                  if (initialData.municipalityId) {
                    setLoadingPar(true);
                    locationService.getParishes(initialData.municipalityId)
                      .then(pars => setParishes(pars))
                      .finally(() => setLoadingPar(false));
                  }
                })
                .finally(() => setLoadingMun(false));
            }
          })
          .finally(() => setLoadingCities(false));
      }
    }
  }, [initialData]);

  const handleStateChange = useCallback((id: string, name: string) => {
    setFormData(prev => ({ ...prev, stateId: id, cityId: "", municipalityId: "", parishId: "" }));
    setCities([]);
    setMunicipalities([]);
    setParishes([]);
    if (id) {
      setLoadingCities(true);
      locationService.getCities(id)
        .then(setCities)
        .finally(() => setLoadingCities(false));
    }
  }, []);

  const handleCityChange = useCallback((id: string, name: string) => {
    setFormData(prev => ({ ...prev, city: name, cityId: id, municipalityId: "", parishId: "" }));
    setMunicipalities([]);
    setParishes([]);
    if (id) {
      setLoadingMun(true);
      locationService.getMunicipalities(id)
        .then(setMunicipalities)
        .finally(() => setLoadingMun(false));
    }
  }, []);

  const handleMunicipalityChange = useCallback((id: string) => {
    setFormData(prev => ({ ...prev, municipalityId: id, parishId: "" }));
    setParishes([]);
    if (id) {
      setLoadingPar(true);
      locationService.getParishes(id)
        .then(setParishes)
        .finally(() => setLoadingPar(false));
    }
  }, []);

  const handleParishChange = useCallback((id: string) => {
    setFormData(prev => ({ ...prev, parishId: id }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-8">
          <button
            onClick={onCancel}
            type="button"
            className="flex items-center gap-2 text-text-muted hover:text-text-base transition-colors mb-4 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-p-s font-medium">Volver</span>
          </button>
          <h2 className="text-h4-s md:text-h4-b font-bold text-text-base mb-6">
            Editar o agregar dirección
          </h2>
          <div className="border-t border-neutral-800 w-full mb-10"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <FormField
            label="Nombre del receptor:"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Emi"
            required
            roundedClass="rounded-full"
          />
          <FormField
            label="Numero de telefono:"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0412-1578413"
            required
            roundedClass="rounded-full"
          />

          <SearchableSelect
            label="Estado:"
            placeholder="Selecciona un estado"
            options={states}
            value={formData.stateId}
            onChange={handleStateChange}
            disabled={!statesLoaded}
            loading={!statesLoaded}
          />
          <SearchableSelect
            label="Ciudad:"
            placeholder="Selecciona una ciudad"
            options={cities}
            value={formData.cityId}
            onChange={handleCityChange}
            disabled={!formData.stateId}
            loading={loadingCities}
          />

          <SearchableSelect
            label="Municipio:"
            placeholder="Selecciona un municipio"
            options={municipalities}
            value={formData.municipalityId}
            onChange={handleMunicipalityChange}
            disabled={!formData.cityId}
            loading={loadingMun}
          />
          <SearchableSelect
            label="Parroquia:"
            placeholder="Selecciona una parroquia"
            options={parishes}
            value={formData.parishId}
            onChange={handleParishChange}
            disabled={!formData.municipalityId}
            loading={loadingPar}
          />

          <FormField
            label="Dirección:"
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            placeholder="Prolongación calle 9"
            required
            roundedClass="rounded-full"
          />
          <FormField
            label="Nombre de dirección:"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Casa"
            required
            roundedClass="rounded-full"
          />
        </div>

        <div className="flex pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            className="!px-16 !py-4 !rounded-2xl !bg-brand-400 !w-auto shadow-lg shadow-brand-100 font-bold"
          >
            {initialData ? "Guardar Cambios" : "Agregar Dirección"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
