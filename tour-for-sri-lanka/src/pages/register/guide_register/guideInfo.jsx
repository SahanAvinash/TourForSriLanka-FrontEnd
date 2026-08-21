import { Fragment, useEffect, useRef, useState } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import Select from "react-select";
import { FaCheck, FaRegCalendarAlt, FaMap, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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

const STORAGE_KEY = "GuideRegister";

const DEFAULT_MAP_CENTER = { lat: 6.9271, lng: 79.8612 };

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const MARITAL_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
const ETHNICITY_OPTIONS = [
    "Sinhalese",
    "Tamil",
    "Moor",
    "Burgher",
    "Malay",
    "Other",
];
const PROVINCE_OPTIONS = [
    "Western",
    "Central",
    "Southern",
    "Northern",
    "Eastern",
    "North Western",
    "North Central",
    "Uva",
    "Sabaragamuwa",
];
const PROVINCE_DISTRICTS = {
    Western: ["Colombo", "Gampaha", "Kalutara"],
    Central: ["Kandy", "Matale", "Nuwara Eliya"],
    Southern: ["Galle", "Matara", "Hambantota"],
    Northern: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
    Eastern: ["Batticaloa", "Ampara", "Trincomalee"],
    "North Western": ["Kurunegala", "Puttalam"],
    "North Central": ["Anuradhapura", "Polonnaruwa"],
    Uva: ["Badulla", "Monaragala"],
    Sabaragamuwa: ["Ratnapura", "Kegalle"],
};

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Personal Info", number: "2", current: true },
    { label: "Language & Skills", number: "3" },
    { label: "Pricing", number: "4" },
];

const selectStyles = {
    control: (base) => ({
        ...base,
        width: "100%",
        minHeight: "50px",
        borderRadius: "20px",
        backgroundColor:
            "color-mix(in srgb, var(--color-border) 50%, transparent)",
        border: "none",
        boxShadow: "none",
    }),

    menu: (base) => ({
        ...base,
        backgroundColor: "var(--color-border)",
    }),

    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),

    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
            ? "var(--color-primary-green)"
            : "var(--color-border)",
        color: "var(--color-text)",
        cursor: "pointer",
        fontSize: "12px"
    }),

    singleValue: (base) => ({
        ...base,
        color: "var(--color-text)",
        paddingLeft: "10px",
    }),

    placeholder: (base) => ({
        ...base,
        color: "var(--color-text)",
        opacity: 0.5,
        paddingLeft: "10px",
    }),

    input: (base) => ({
        ...base,
        color: "var(--color-text)",
    }),
};

const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
};

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

function MapPickerModal({ initialPosition, onClose, onConfirm }) {
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
                <h2 className="text-[18px] font-bold mb-[10px]">Pick your address location</h2>

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

export default function GuideInformation() {
    const navigate = useNavigate();
    const dobRef = useRef(null);

    const [dateOfBirth, setDateOfBirth] = useState("");
    const [address, setAddress] = useState("");
    const [coordinates, setCoordinates] = useState(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [gender, setGender] = useState(null);
    const [maritalStatus, setMaritalStatus] = useState(null);
    const [ethnicity, setEthnicity] = useState(null);
    const [province, setProvince] = useState(null);
    const [NIC, setNIC] = useState("");
    const [district, setDistrict] = useState(null);
    const [aboutYourSelf, setAboutYourSelf] = useState("");

    const [err, setErr] = useState("");

    const genderOptions = GENDER_OPTIONS.map((g) => ({
        label: g,
        value: g,
    }));

    const maritalOptions = MARITAL_OPTIONS.map((m) => ({
        label: m,
        value: m,
    }));

    const ethnicityOptions = ETHNICITY_OPTIONS.map((e) => ({
        label: e,
        value: e,
    }));

    const provinceOptions = PROVINCE_OPTIONS.map((p) => ({
        label: p,
        value: p,
    }));

    const districtOptions = (
        PROVINCE_DISTRICTS[province?.value] || []
    ).map((d) => ({ label: d, value: d }));

    const handleProvinceChange = (selected) => {
        setProvince(selected);
        setDistrict(null);
    };

    useEffect(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const data = JSON.parse(saved);

        setDateOfBirth(data.dateOfBirth || "");
        setAddress(data.address || "");
        setNIC(data.NIC || "");
        setAboutYourSelf(data.aboutYourSelf || "");

        if (data.latitude && data.longitude) {
            setCoordinates({ lat: data.latitude, lng: data.longitude });
        }

        if (data.gender) {
            setGender({ label: data.gender, value: data.gender });
        }

        if (data.maritalStatus) {
            setMaritalStatus({
                label: data.maritalStatus,
                value: data.maritalStatus,
            });
        }

        if (data.ethnicity) {
            setEthnicity({
                label: data.ethnicity,
                value: data.ethnicity,
            });
        }

        if (data.province) {
            setProvince({ label: data.province, value: data.province });
        }

        if (data.district) {
            setDistrict({ label: data.district, value: data.district });
        }
    }, []);

    const buildFormData = () => {
        const oldData =
            JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};

        return {
            ...oldData,
            dateOfBirth,
            address,
            latitude: coordinates?.lat,
            longitude: coordinates?.lng,
            gender: gender?.value,
            maritalStatus: maritalStatus?.value,
            ethnicity: ethnicity?.value,
            province: province?.value,
            NIC,
            district: district?.value,
            aboutYourSelf,
        };
    };

    const handlePrevious = () => {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(buildFormData())
        );

        navigate(-1);
    };

    const handleOpenMap = () => {
        setShowMapPicker(true);
    };

    const handleConfirmLocation = (picked) => {
        setAddress(picked.address);
        setCoordinates({ lat: picked.lat, lng: picked.lng });
        setShowMapPicker(false);
    };

    const handleNext = () => {
        if (
            !dateOfBirth ||
            !address ||
            !gender ||
            !maritalStatus ||
            !ethnicity ||
            !province ||
            !NIC ||
            !district
        ) {
            setErr("Please fill all required fields");
            return;
        }

        const dobDate = new Date(dateOfBirth);
        const today = new Date();

        if (dobDate > today) {
            setErr("Date of birth cannot be in the future");
            return;
        }

        if (calculateAge(dateOfBirth) < 18) {
            setErr(
                "You must be at least 18 years old to register as a guide"
            );
            return;
        }

        const nicRegex = /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/;

        if (!nicRegex.test(NIC)) {
            setErr("Please enter a valid NIC Number");
            return;
        }

        setErr("");

        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(buildFormData())
        );

        navigate("/guidelanguageskills");
    };

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-r from-primary-1 to-primary-2 overflow-x-hidden">

            <div className="absolute top-0 left-0 w-full flex justify-center px-4 sm:px-6 pt-6 sm:pt-8 lg:pt-[50px] z-10">
                <div className="w-full max-w-[1200px] flex justify-center lg:justify-start">
                    <div className="w-[260px] sm:w-[340px] lg:w-[500px] xl:w-[550px] flex items-start">
                        {STEPS.map((step, index) => (
                            <Fragment key={step.label}>
                                <div className="flex flex-col items-center w-[40px] sm:w-[58px] lg:w-[80px] shrink-0">
                                    <div
                                        className={`w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] lg:w-[30px] lg:h-[30px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                                            step.done
                                                ? "bg-primary-green/80"
                                                : step.current
                                                ? "bg-primary-green/30"
                                                : "bg-border/80"
                                        }`}
                                    >
                                        <span className="text-text text-[7px] sm:text-[9px] lg:text-[12px]">
                                            {step.done ? <FaCheck /> : step.number}
                                        </span>
                                    </div>

                                    <span className="mt-1 text-text text-[6px] sm:text-[8px] lg:text-[12px] text-center leading-tight whitespace-nowrap">
                                        {step.label}
                                    </span>
                                </div>

                                {index < STEPS.length - 1 && (
                                    <div className="flex-1 mt-[9px] sm:mt-[11px] lg:mt-[15px] border-t-2 border-dashed border-text/50 mx-1"></div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 py-10">
                <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-10 lg:gap-20">

                    <div className="w-[180px] sm:w-[220px] md:w-[400px] lg:w-[500px] xl:w-[550px] flex items-center justify-center shrink-0">
                        <img
                            src="/main_logo.png"
                            alt="Tours for Sri Lanka"
                            className="w-full h-auto object-contain"
                        />
                    </div>

                    <div className="login-card-anim w-full max-w-[500px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-8">
                        <h1 className="text-[20px] sm:text-[25px] font-bold text-text text-center">
                            Sign up as a Guide
                        </h1>

                        {err && (
                            <div className="text-[#9E4444] text-[12px] text-center mt-[5px] px-2">
                                {err}
                            </div>
                        )}

                        <div className="mt-[20px] w-full relative">
                            <input
                                ref={dobRef}
                                type="date"
                                value={dateOfBirth}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                onClick={() => {
                                    try {
                                        dobRef.current?.showPicker();
                                    } catch {
                                        // Some browsers don't support showPicker()
                                    }
                                }}
                                className={`w-full h-[50px] text-[12px] bg-border/50 rounded-[20px] pl-[20px] pr-[45px] [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                                    dateOfBirth ? "text-text" : "text-transparent"
                                }`}
                            />

                            <FaRegCalendarAlt className="absolute right-[20px] top-1/2 -translate-y-1/2 text-primary-green/70 pointer-events-none" />

                            {!dateOfBirth && (
                                <span className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[12px] text-text/50 pointer-events-none">
                                    Date of Birth
                                </span>
                            )}
                        </div>

                        <div className="mt-[10px] w-full relative">
                            <input
                                placeholder="Home Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] pr-[45px]"
                            />
                            <button
                                type="button"
                                onClick={handleOpenMap}
                                className="absolute right-[15px] top-1/2 -translate-y-1/2 text-primary-green/80 cursor-pointer"
                            >
                                <FaMap />
                            </button>
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                            <Select
                                options={genderOptions}
                                value={gender}
                                onChange={setGender}
                                placeholder="Gender"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />

                            <Select
                                options={maritalOptions}
                                value={maritalStatus}
                                onChange={setMaritalStatus}
                                placeholder="Marital Status"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                            <Select
                                options={ethnicityOptions}
                                value={ethnicity}
                                onChange={setEthnicity}
                                placeholder="Ethnicity"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />

                            <Select
                                options={provinceOptions}
                                value={province}
                                onChange={handleProvinceChange}
                                placeholder="Province"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                            <input
                                placeholder="NIC"
                                value={NIC}
                                maxLength={12}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (
                                        /^[0-9]{0,12}$/.test(value) ||
                                        /^[0-9]{9}[vVxX]$/.test(value)
                                    ) {
                                        setNIC(value);
                                    }
                                }}
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
                            />

                            <Select
                                options={districtOptions}
                                value={district}
                                onChange={setDistrict}
                                placeholder={
                                    province ? "District" : "Select province first"
                                }
                                isDisabled={!province}
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="mt-[10px] w-full relative">
                            <textarea
                                placeholder="About Your Self"
                                value={aboutYourSelf}
                                maxLength={100}
                                onChange={(e) =>
                                    setAboutYourSelf(e.target.value)
                                }
                                className="w-full h-[80px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] pt-[15px] pr-[20px] resize-none"
                            />

                            <span className="absolute right-[20px] bottom-[10px] text-[10px] text-text/50">
                                {aboutYourSelf.length}/100
                            </span>
                        </div>

                        <div className="mt-[20px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="w-full h-[50px] bg-border/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-border/80 transition-all duration-300 hover:scale-95 cursor-pointer"
                            >
                                <GrFormPreviousLink className="font-bold text-[20px]" />
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full h-[50px] bg-primary-green/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 cursor-pointer"
                            >
                                Next
                                <GrFormNextLink className="font-bold text-[20px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showMapPicker && (
                <MapPickerModal
                    initialPosition={coordinates}
                    onClose={() => setShowMapPicker(false)}
                    onConfirm={handleConfirmLocation}
                />
            )}
        </div>
    );
}