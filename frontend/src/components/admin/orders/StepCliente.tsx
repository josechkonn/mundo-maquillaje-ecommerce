import { useState, useEffect, useCallback, useRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon, UserIcon, MapPinIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { userService, type UserProfile } from "../../../services/userService";
import { addressService, type AddressData } from "../../../services/addressService";
import { locationService, type StateItem, type CityItem, type MunicipalityItem, type ParishItem } from "../../../services/locationService";

export interface ShippingAddressData {
  name: string;
  fullname: string;
  phone: string;
  direction: string;
  city: string;
  state: string;
  municipality: string;
  parish: string;
}

interface StepClienteProps {
  selectedClient: UserProfile | null;
  onSelectClient: (client: UserProfile | null) => void;
  address: ShippingAddressData;
  onAddressChange: (addr: ShippingAddressData) => void;
  onEnterNext: () => void;
}

const StepCliente = ({ selectedClient, onSelectClient, address, onAddressChange, onEnterNext }: StepClienteProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityItem[]>([]);
  const [parishes, setParishes] = useState<ParishItem[]>([]);

  const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    locationService.getStates().then(setStates).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadAddresses(selectedClient.id, selectedClient.name);
    }
  }, [selectedClient]);

  const searchUsers = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await userService.getUsers({ search: query, page: 0, size: 8 });
      setResults(res.content || []);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(value), 300);
  };

  const loadAddresses = async (clientId: string, clientName: string) => {
    setLoadingAddresses(true);
    setSavedAddresses([]);
    setSelectedAddressId(null);
    setShowManualForm(false);
    try {
      const data = await addressService.getUserAddresses(clientId);
      setSavedAddresses(data);
      if (data.length > 0) {
        handleSelectAddress(data[0], clientName);
      } else {
        setShowManualForm(true);
      }
    } catch {
      setShowManualForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSelectClient = (client: UserProfile) => {
    onSelectClient(client);
    setSearchTerm(`${client.name} (${client.email})`);
    setShowResults(false);
    onAddressChange({
      name: "", fullname: client.name || "", phone: "", direction: "", city: "",
      state: "", municipality: "", parish: "",
    });
    setCities([]);
    setMunicipalities([]);
    setParishes([]);
  };

  const handleClearClient = () => {
    onSelectClient(null);
    setSearchTerm("");
    setResults([]);
    setSavedAddresses([]);
    setSelectedAddressId(null);
    setShowManualForm(false);
  };

  const handleSelectAddress = async (addr: AddressData, clientFallbackName?: string) => {
    setSelectedAddressId(addr.id || null);
    setShowManualForm(false);

    let cityName = addr.city || "";
    let cityData: CityItem[] = [];

    if (addr.stateId) {
      try {
        cityData = await locationService.getCities(addr.stateId);
        setCities(cityData);
      } catch {}
      if (!cityName && addr.cityId) {
        const found = cityData.find(c => c.id === addr.cityId);
        if (found) cityName = found.name;
      }
    }

    onAddressChange({
      name: addr.name || "",
      fullname: addr.fullname || clientFallbackName || selectedClient?.name || "",
      phone: addr.phone || "",
      direction: addr.direction || "",
      city: cityName,
      state: addr.stateName || "",
      municipality: addr.municipalityName || "",
      parish: addr.parishName || "",
    });

    if (addr.stateId && cityName) {
      const foundCity = cityData.find(c => c.name === cityName);
      if (foundCity && addr.municipalityName) {
        try {
          const munData = await locationService.getMunicipalities(foundCity.id);
          setMunicipalities(munData);
          if (addr.parishName) {
            const foundMun = munData.find(m => m.name === addr.municipalityName);
            if (foundMun) {
              const parData = await locationService.getParishes(foundMun.id);
              setParishes(parData);
            }
          }
        } catch {}
      }
    }
  };

  const handleManualAddress = () => {
    setSelectedAddressId(null);
    setShowManualForm(true);
    onAddressChange({
      name: "", fullname: selectedClient?.name || "", phone: "", direction: "", city: "",
      state: "", municipality: "", parish: "",
    });
    setCities([]);
    setMunicipalities([]);
    setParishes([]);
  };

  const updateAddress = (field: keyof ShippingAddressData, value: string) => {
    setSelectedAddressId(null);
    onAddressChange({ ...address, [field]: value });
  };

  const handleStateChange = async (stateId: string) => {
    const state = states.find(s => s.id === stateId);
    setSelectedAddressId(null);
    onAddressChange({
      ...address,
      state: state?.name || "",
      city: "",
      municipality: "",
      parish: "",
    });
    setCities([]);
    setMunicipalities([]);
    setParishes([]);
    if (stateId) {
      try {
        const data = await locationService.getCities(stateId);
        setCities(data);
      } catch {}
    }
  };

  const handleCityChange = async (cityId: string) => {
    const c = cities.find(ci => ci.id === cityId);
    setSelectedAddressId(null);
    onAddressChange({
      ...address,
      city: c?.name || "",
      municipality: "",
      parish: "",
    });
    setMunicipalities([]);
    setParishes([]);
    if (cityId) {
      try {
        const data = await locationService.getMunicipalities(cityId);
        setMunicipalities(data);
      } catch {}
    }
  };

  const handleMunicipalityChange = async (municipalityId: string) => {
    const mun = municipalities.find(m => m.id === municipalityId);
    setSelectedAddressId(null);
    onAddressChange({
      ...address,
      municipality: mun?.name || "",
      parish: "",
    });
    setParishes([]);
    if (municipalityId) {
      try {
        const data = await locationService.getParishes(municipalityId);
        setParishes(data);
      } catch {}
    }
  };

  const currentStateId = states.find(s => s.name === address.state)?.id || "";
  const currentCityId = cities.find(c => c.name === address.city)?.id || "";
  const currentMunicipalityId = municipalities.find(m => m.name === address.municipality)?.id || "";

  const hasValidAddress =
    address.fullname.trim() &&
    address.phone.trim() &&
    address.direction.trim() &&
    address.state.trim() &&
    address.city.trim();

  const isValid = selectedClient && hasValidAddress;

  return (
    <div className="space-y-6">
      {/* Buscador de cliente */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-extrabold text-lg">1</div>
          <div>
            <h3 className="text-lg font-extrabold text-neutral-800">Cliente</h3>
            <p className="text-sm text-neutral-500">Busca y selecciona el cliente para este pedido</p>
          </div>
        </div>

        <div ref={searchRef} className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder="Buscar cliente por nombre o email..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-neutral-300 bg-white text-sm font-medium text-neutral-800 placeholder-neutral-400 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
            />
            {selectedClient && (
              <button onClick={handleClearClient} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {showResults && (
            <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-neutral-200 shadow-xl animate-fade-in overflow-hidden">
              {isSearching ? (
                <div className="p-6 text-center text-sm text-neutral-400">Buscando...</div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center text-sm text-neutral-400">No se encontraron clientes</div>
              ) : (
                results.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-brand-50 transition-colors text-left border-b border-neutral-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      {client.avatarUrl ? (
                        <img src={client.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-brand-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-800 truncate">{client.name || "Sin nombre"}</p>
                      <p className="text-xs text-neutral-500 truncate">{client.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      client.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                      client.role === "EMPLOYEE" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {client.role === "ADMIN" ? "Admin" : client.role === "EMPLOYEE" ? "Empleado" : "Cliente"}
                    </span>
                  </button>
                ))
              )}
          </div>
        )}
      </div>

        {selectedClient && (
          <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-green-50 rounded-2xl border border-green-200">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <p className="text-sm font-medium text-green-800">
              Cliente seleccionado: <strong>{selectedClient.name}</strong> ({selectedClient.email})
            </p>
          </div>
        )}
      </div>

      {/* Dirección de envío */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-sm">
            <MapPinIcon className="w-4 h-4" />
          </div>
          <h4 className="text-base font-bold text-neutral-700">Dirección de envío</h4>
        </div>

        {selectedClient && loadingAddresses && (
          <div className="flex items-center gap-3 py-4 text-sm text-neutral-500">
            <div className="w-5 h-5 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
            Cargando direcciones...
          </div>
        )}

        {selectedClient && !loadingAddresses && savedAddresses.length > 0 && !showManualForm && (
          <div className="space-y-3 mb-4">
            <p className="text-xs text-neutral-500 font-medium">Direcciones guardadas de {selectedClient.name}:</p>
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => handleSelectAddress(addr)}
                className={`w-full text-left rounded-2xl p-4 border-2 transition-all ${
                  selectedAddressId === addr.id
                    ? "border-brand-400 bg-brand-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-brand-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-800">{addr.fullname}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">{addr.direction}</p>
                    <p className="text-xs text-neutral-500">
                      {addr.city}{addr.municipalityName ? `, ${addr.municipalityName}` : ""}{addr.stateName ? `, ${addr.stateName}` : ""}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">Telf: {addr.phone}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 mt-0.5 ${
                    selectedAddressId === addr.id ? "border-brand-400 bg-brand-400" : "border-neutral-300"
                  }`}>
                    {selectedAddressId === addr.id && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
            <button
              onClick={handleManualAddress}
              className="flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Usar otra dirección
            </button>
          </div>
        )}

        {selectedClient && !loadingAddresses && savedAddresses.length === 0 && (
          <div className="mb-4 py-3 px-4 bg-amber-50 rounded-2xl border border-amber-200">
            <p className="text-sm text-amber-800 font-medium">
              Este cliente no tiene direcciones guardadas. Ingresa una manualmente.
            </p>
          </div>
        )}

        {(showManualForm || savedAddresses.length === 0) && selectedClient && (
          <>
            {showManualForm && savedAddresses.length > 0 && (
              <button
                onClick={() => setShowManualForm(false)}
                className="flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors mb-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Volver a direcciones guardadas
              </button>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Nombre completo</label>
              <input type="text" value={address.fullname} onChange={(e) => updateAddress("fullname", e.target.value)}
                placeholder="Nombre y apellido" className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all placeholder-neutral-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Teléfono</label>
              <input type="text" value={address.phone} onChange={(e) => updateAddress("phone", e.target.value)}
                placeholder="+58 412 123 4567" className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all placeholder-neutral-400" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Dirección</label>
              <input type="text" value={address.direction} onChange={(e) => updateAddress("direction", e.target.value)}
                placeholder="Calle, casa, edificio, local..." className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all placeholder-neutral-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Estado</label>
              <select value={currentStateId} onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all">
                <option value="">Seleccionar...</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Ciudad</label>
              <select value={currentCityId} onChange={(e) => handleCityChange(e.target.value)}
                disabled={!currentStateId}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Seleccionar...</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Municipio</label>
              <select value={currentMunicipalityId} onChange={(e) => handleMunicipalityChange(e.target.value)}
                disabled={!currentCityId}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Seleccionar...</option>
                {municipalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Parroquia</label>
              <select value={parishes.find(p => p.name === address.parish)?.id || ""} onChange={(e) => {
                const p = parishes.find(par => par.id === e.target.value);
                updateAddress("parish", p?.name || "");
              }}
                disabled={!currentMunicipalityId}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Seleccionar...</option>
                {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          </>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onEnterNext}
          disabled={!isValid}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold bg-brand-400 text-white hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Siguiente
          <ChevronDownIcon className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default StepCliente;
