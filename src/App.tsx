import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, FlaskConical, LocateFixed, MapPin, Navigation, Search, X } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fullAddress, getLocations, type Location } from "./locations";
import { MarqiiHours } from "./MarqiiHours";

type LocationResult = { location: Location; distance?: number };

function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians(bLat - aLat);
  const dLng = radians(bLng - aLng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(aLat)) * Math.cos(radians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function FitMap({ results, userPosition }: { results: LocationResult[]; userPosition?: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = results.map(({ location }) => [location.latitude, location.longitude]);
    if (userPosition) points.push(userPosition);
    if (points.length === 1) map.setView(points[0], 12);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [42, 42], maxZoom: 12 });
  }, [map, results, userPosition]);

  return null;
}

function StoreDetails({ location, onClose }: { location: Location; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const address = fullAddress(location);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  useEffect(() => {
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="store-modal" role="dialog" aria-modal="true" aria-labelledby="store-dialog-title">
        <button ref={closeButton} className="modal-close" onClick={onClose} aria-label="Close store details"><X size={21} /></button>
        <p className="store-kind">{location.serviceType === "catering" ? "Catering only" : "Sub Zero location"}</p>
        <h2 id="store-dialog-title">{location.shortName}</h2>
        <div className="detail-address"><MapPin size={18} /><span>{address}</span></div>
        {location.phone && <a className="detail-phone" href={`tel:${location.phone.replace(/\D/g, "")}`}>{location.phone}</a>}
        {location.marqiiEmbedId && <div className="modal-hours"><h3>Store hours</h3><MarqiiHours embedId={location.marqiiEmbedId} /></div>}
        <div className="modal-actions">
          <a className="action primary" href={directionsUrl} target="_blank" rel="noreferrer"><Navigation size={17} /> Get directions</a>
          {location.orderUrl && <a className="action secondary" href={location.orderUrl} target="_blank" rel="noreferrer">Order online <ExternalLink size={16} /></a>}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>(() => getLocations());
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Location | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number]>();
  const [status, setStatus] = useState("");

  useEffect(() => {
    const refreshLocations = () => setLocations(getLocations());
    window.addEventListener("storage", refreshLocations);
    window.addEventListener("subzero-locations-updated", refreshLocations);
    return () => {
      window.removeEventListener("storage", refreshLocations);
      window.removeEventListener("subzero-locations-updated", refreshLocations);
    };
  }, []);

  const visibleLocations = useMemo(() => locations.filter((location) => location.isActive !== false && location.showLocationPage !== false), [locations]);
  const states = useMemo(() => [...new Set(visibleLocations.map((location) => location.state))].sort(), [visibleLocations]);
  const counts = useMemo(() => visibleLocations.reduce<Record<string, number>>((all, location) => ({ ...all, [location.state]: (all[location.state] ?? 0) + 1 }), {}), [visibleLocations]);

  const results = useMemo<LocationResult[]>(() => {
    const normalized = query.trim().toLowerCase();
    return visibleLocations
      .filter((location) => !selectedState || location.state === selectedState)
      .filter((location) => !normalized || `${location.name} ${fullAddress(location)}`.toLowerCase().includes(normalized))
      .map((location) => ({
        location,
        distance: userPosition ? distanceMiles(userPosition[0], userPosition[1], location.latitude, location.longitude) : undefined,
      }))
      .sort((a, b) => userPosition ? (a.distance ?? 0) - (b.distance ?? 0) : a.location.state.localeCompare(b.location.state) || a.location.city.localeCompare(b.location.city));
  }, [query, selectedState, userPosition, visibleLocations]);

  function search(event: React.FormEvent) {
    event.preventDefault();
    setSelectedState(null);
    setQuery(draftQuery);
    setStatus(draftQuery.trim() ? `Showing locations matching ${draftQuery.trim()}.` : "Showing all locations.");
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus("Location access is not supported by this browser. Search by city, state, or ZIP code.");
      return;
    }
    setStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition([coords.latitude, coords.longitude]);
        setDraftQuery("");
        setQuery("");
        setSelectedState(null);
        setStatus("Stores are sorted by distance from your location.");
      },
      () => setStatus("We couldn’t access your location. Search by city, state, or ZIP code instead."),
      { timeout: 8000 },
    );
  }

  const mapResults = results.length ? results : visibleLocations.map((location) => ({ location }));

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="header-inner">
          <a className="back-link" href="/"><ArrowLeft size={20} /> <span>Back</span></a>
          <a className="brand" href="/" aria-label="Sub Zero Nitrogen Ice Cream home">
            <span className="brand-mark"><FlaskConical size={23} /></span>
            <span><strong>SUB ZERO</strong><small>NITROGEN ICE CREAM</small></span>
          </a>
          <h1>Store Locator</h1>
        </div>
      </header>

      <main id="main-content">
        <section className="page-intro">
          <p className="eyebrow">Nitrogen ice cream near you</p>
          <h2>Find our difference</h2>
          <p>Locate the nearest Sub Zero store and plan your visit.</p>
        </section>

        <section className="locator-shell" aria-label="Store search">
          <div className="search-card">
            <div className="search-card-title"><span><Search size={20} /></span><h2>Find stores near you</h2></div>
            <form onSubmit={search}>
              <label className="sr-only" htmlFor="store-search">City, state, or ZIP code</label>
              <input id="store-search" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Enter a city, state, or ZIP code" />
              <button className="search-button" type="submit"><Search size={17} /> Search</button>
            </form>
            <div className="location-action"><button type="button" onClick={useCurrentLocation}><LocateFixed size={17} /> Use my current location</button></div>
            <p className="status" aria-live="polite">{status}</p>
          </div>

          <section className="map-card" aria-labelledby="map-title">
            <div className="card-heading"><h2 id="map-title">{selectedState ? `Stores in ${selectedState}` : query ? `${results.length} location${results.length === 1 ? "" : "s"} found` : "All store locations"}</h2></div>
            <div className="map-frame">
              <MapContainer center={[39.8283, -98.5795]} zoom={4} scrollWheelZoom keyboard dragging touchZoom doubleClickZoom zoomControl>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FitMap results={mapResults} userPosition={userPosition} />
                {mapResults.map(({ location }) => (
                  <CircleMarker key={location.id} center={[location.latitude, location.longitude]} radius={8} pathOptions={{ color: "#fff", weight: 2, fillColor: location.serviceType === "catering" ? "#2468a2" : "#d92332", fillOpacity: 1 }}>
                    <Popup><strong>{location.shortName}</strong><br />{fullAddress(location)}<br /><button className="popup-button" onClick={() => setSelectedStore(location)}>View details</button></Popup>
                  </CircleMarker>
                ))}
                {userPosition && <CircleMarker center={userPosition} radius={8} pathOptions={{ color: "#fff", weight: 2, fillColor: "#239357", fillOpacity: 1 }}><Popup>Your location</Popup></CircleMarker>}
              </MapContainer>
            </div>
            <div className="map-legend" aria-label="Map legend"><span><i className="red-dot" /> Store locations</span><span><i className="blue-dot" /> Catering only</span>{userPosition && <span><i className="green-dot" /> Your location</span>}</div>
          </section>

          <section className="browse-card" aria-labelledby="browse-title">
            <div className="card-heading"><h2 id="browse-title">Browse by state</h2></div>
            <div className="state-filters">
              <button className={!selectedState ? "active" : ""} onClick={() => setSelectedState(null)}>All <span>{visibleLocations.length}</span></button>
              {states.map((state) => <button key={state} className={selectedState === state ? "active" : ""} onClick={() => { setSelectedState(state); setQuery(""); setDraftQuery(""); }}>{state} <span>{counts[state]}</span></button>)}
            </div>
            {selectedState && (
              <div className="state-store-index">
                {results.map(({ location }) => (
                  <button key={location.id} onClick={() => setSelectedStore(location)}>
                    <strong>{location.name.replace(/\s*[—-]\s*/g, " ")}</strong>
                    <small>{location.city}, {location.state}</small>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="results-section" aria-labelledby="results-title">
            <h2 id="results-title">{results.length} location{results.length === 1 ? "" : "s"} found</h2>
            <div className="result-list">
              {results.map(({ location, distance }) => {
                const address = fullAddress(location);
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
                return (
                  <article key={location.id} className="result-card">
                    <div className="result-main">
                      <div className="result-copy">
                        <p>{location.serviceType === "catering" ? "Catering only" : location.state}</p>
                        <h3>{location.shortName}</h3>
                        <a className="result-address" href={directionsUrl} target="_blank" rel="noreferrer"><MapPin size={16} /> <span>{address}</span></a>
                        {location.phone && <a className="result-phone" href={`tel:${location.phone.replace(/\D/g, "")}`}>{location.phone}</a>}
                      </div>
                      {distance !== undefined && <strong className="result-distance">{distance.toFixed(1)} miles away</strong>}
                    </div>
                    {location.marqiiEmbedId && <div className="result-hours"><h4>Store hours</h4><MarqiiHours embedId={location.marqiiEmbedId} /></div>}
                    <div className="result-actions">
                      <a href={directionsUrl} target="_blank" rel="noreferrer"><Navigation size={16} /> Get directions</a>
                      <button onClick={() => setSelectedStore(location)}>View details</button>
                    </div>
                  </article>
                );
              })}
              {!results.length && <div className="empty-state"><h3>No locations match that search.</h3><button onClick={() => { setDraftQuery(""); setQuery(""); setSelectedState(null); }}>Show all locations</button></div>}
            </div>
          </section>
        </section>
      </main>

      <footer><p>Sub Zero Nitrogen Ice Cream</p><a href="#main-content">Find a location</a></footer>
      {selectedStore && <StoreDetails location={selectedStore} onClose={() => setSelectedStore(null)} />}
    </div>
  );
}
