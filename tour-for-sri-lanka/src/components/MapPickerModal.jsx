import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_MAP_CENTER = { lat: 6.9271, lng: 79.8612 };

function LocationClickHandler({ onPick }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng);
        },
    });
    return null;
}

function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position]);
    return null;
}

export default function MapPickerModal({ initialPosition, onClose, onConfirm, title }) {
    const [position, setPosition] = useState(initialPosition || DEFAULT_MAP_CENTER);
    const [address, setAddress] = useState("");
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [locating, setLocating] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    const reverseGeocode = async (lat, lng) => {
        setLoadingAddress(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            setAddress(data.display_name || "");
        } catch (error) {
            setAddress("");
        }
        setLoadingAddress(false);
    };

    useEffect(() => {
        reverseGeocode(position.lat, position.lng);
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=lk`);
                const data = await res.json();
                setSearchResults(data);
            } catch (error) {
                setSearchResults([]);
            }
            setSearching(false);
        }, 500);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery]);

    const handlePick = (latlng) => {
        setPosition(latlng);
        reverseGeocode(latlng.lat, latlng.lng);
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(latlng);
                reverseGeocode(latlng.lat, latlng.lng);
                setLocating(false);
            },
            () => setLocating(false)
        );
    };

    const handleSelectResult = (result) => {
        const latlng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setPosition(latlng);
        setAddress(result.display_name);
        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] px-[20px]">
            <div className="w-[600px] max-w-full bg-primary-2 text-text rounded-[20px] p-[20px] flex flex-col items-center">
                <h2 className="text-[18px] font-bold mb-[10px]">{title || "Pick a location"}</h2>

                <div className="w-full relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a place (e.g. Galle Fort, Kandy)"
                        className="w-full h-[45px] text-[12px] bg-border/50 rounded-[15px] pl-[40px] pr-[15px] text-text placeholder:text-text/50"
                    />
                    <FaSearch className="absolute left-[15px] top-1/2 -translate-y-1/2 text-primary-green/70 text-[12px]" />

                    {(searching || searchResults.length > 0) && (
                        <div className="absolute top-[50px] left-0 w-full bg-border rounded-[15px] overflow-hidden z-[1001] max-h-[200px] overflow-y-auto">
                            {searching && (
                                <div className="px-[15px] py-[10px] text-[12px] text-text/70">Searching...</div>
                            )}
                            {!searching && searchResults.map((result, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSelectResult(result)}
                                    className="px-[15px] py-[10px] text-[12px] text-text cursor-pointer hover:bg-primary-green/40 border-b border-text/10 last:border-none"
                                >
                                    {result.display_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-full h-[350px] rounded-[15px] overflow-hidden mt-[15px]">
                    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={position} />
                        <LocationClickHandler onPick={handlePick} />
                        <RecenterMap position={position} />
                    </MapContainer>
                </div>

                <div className="w-full mt-[15px] text-[12px] bg-border/50 rounded-[15px] p-[10px] min-h-[40px]">
                    {loadingAddress ? "Finding address..." : (address || "Click on the map to drop a pin")}
                </div>

                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="w-full mt-[10px] text-[12px] text-left text-primary-green/80 underline cursor-pointer"
                >
                    {locating ? "Locating..." : "Use my current location"}
                </button>

                <div className="w-full mt-[15px] flex justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-[45px] bg-border/50 font-bold text-[14px] rounded-[20px] hover:bg-border/80 transition-all duration-300 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm({ address, lat: position.lat, lng: position.lng })}
                        disabled={!address}
                        className="w-full h-[45px] bg-primary-green/50 font-bold text-[14px] rounded-[20px] hover:bg-primary-green/80 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                        Confirm location
                    </button>
                </div>
            </div>
        </div>
    );
}