import { Fragment, useEffect, useRef, useState } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaMap, FaSearch } from "react-icons/fa";
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";
import COUNTRIES from "../../../data/countryCode";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const STORAGE_KEY = "HotelOwnerRegister";

const DEFAULT_MAP_CENTER = {
    lat: 6.9271,
    lng: 79.8612,
};

const HOTEL_TYPE_OPTIONS = [
    "Hotel",
    "Resort",
    "Boutique Hotel",
    "Guest House",
    "Villa",
    "Homestay",
    "Bed & Breakfast",
    "Eco Lodge",
    "Apartment Hotel",
    "Hostel",
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
    Northern: [
        "Jaffna",
        "Kilinochchi",
        "Mannar",
        "Vavuniya",
        "Mullaitivu",
    ],
    Eastern: ["Batticaloa", "Ampara", "Trincomalee"],
    "North Western": ["Kurunegala", "Puttalam"],
    "North Central": ["Anuradhapura", "Polonnaruwa"],
    Uva: ["Badulla", "Monaragala"],
    Sabaragamuwa: ["Ratnapura", "Kegalle"],
};

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Hotel Information", current: true, number: "2" },
    { label: "Facilities", number: "3" },
    { label: "Verification", number: "4" },
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
        fontSize: "12px",
    }),
    singleValue: (base) => ({
        ...base,
        color: "var(--color-text)",
        paddingLeft: "10px",
        fontSize: "12px",
    }),
    placeholder: (base) => ({
        ...base,
        color: "var(--color-text)",
        opacity: 0.5,
        paddingLeft: "10px",
        fontSize: "12px",
    }),
    input: (base) => ({
        ...base,
        color: "var(--color-text)",
    }),
};

function LocationClickHandler({ onPick }) {
    useMapEvents({
        click(event) {
            onPick(event.latlng);
        },
    });

    return null;
}

function RecenterMap({ position }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [map, position]);

    return null;
}

function MapPickerModal({ initialPosition, onClose, onConfirm }) {
    const [position, setPosition] = useState(
        initialPosition || DEFAULT_MAP_CENTER
    );
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
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );

            if (!response.ok) {
                throw new Error("Reverse geocoding failed");
            }

            const data = await response.json();
            setAddress(data.display_name || "");
        } catch (error) {
            setAddress("");
        } finally {
            setLoadingAddress(false);
        }
    };

    useEffect(() => {
        reverseGeocode(position.lat, position.lng);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setSearching(true);

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        searchQuery
                    )}&limit=5&countrycodes=lk`
                );

                if (!response.ok) {
                    throw new Error("Search failed");
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery]);

    const handlePick = (latlng) => {
        setPosition(latlng);
        reverseGeocode(latlng.lat, latlng.lng);
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (positionData) => {
                const latlng = {
                    lat: positionData.coords.latitude,
                    lng: positionData.coords.longitude,
                };

                setPosition(latlng);
                reverseGeocode(latlng.lat, latlng.lng);
                setLocating(false);
            },
            () => {
                setLocating(false);
            }
        );
    };

    const handleSelectResult = (result) => {
        const latlng = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
        };

        setPosition(latlng);
        setAddress(result.display_name || "");
        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] px-[20px]">
            <div className="w-[600px] max-w-full bg-primary-2 text-text rounded-[20px] p-[20px] flex flex-col items-center">
                <h2 className="text-[18px] font-bold mb-[10px]">
                    Pick your hotel location
                </h2>

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
                                <div className="px-[15px] py-[10px] text-[12px] text-text/70">
                                    Searching...
                                </div>
                            )}

                            {!searching &&
                                searchResults.map((result, index) => (
                                    <div
                                        key={`${result.place_id}-${index}`}
                                        onClick={() =>
                                            handleSelectResult(result)
                                        }
                                        className="px-[15px] py-[10px] text-[12px] text-text cursor-pointer hover:bg-primary-green/40 border-b border-text/10 last:border-none"
                                    >
                                        {result.display_name}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="w-full h-[350px] rounded-[15px] overflow-hidden mt-[15px]">
                    <MapContainer
                        center={position}
                        zoom={13}
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        <Marker position={position} />

                        <LocationClickHandler onPick={handlePick} />

                        <RecenterMap position={position} />
                    </MapContainer>
                </div>

                <div className="w-full mt-[15px] text-[12px] bg-border/50 rounded-[15px] p-[10px] min-h-[40px]">
                    {loadingAddress
                        ? "Finding address..."
                        : address || "Click on the map to drop a pin"}
                </div>

                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="w-full mt-[10px] text-[12px] text-left text-primary-green/80 underline cursor-pointer"
                >
                    {locating
                        ? "Locating..."
                        : "Use my current location"}
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
                        onClick={() =>
                            onConfirm({
                                address,
                                lat: position.lat,
                                lng: position.lng,
                            })
                        }
                        disabled={!address || loadingAddress}
                        className="w-full h-[45px] bg-primary-green/50 font-bold text-[14px] rounded-[20px] hover:bg-primary-green/80 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                        Confirm location
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function HotelInformation() {
    const navigate = useNavigate();

    const [hotelName, setHotelName] = useState("");
    const [hotelType, setHotelType] = useState(null);
    const [shortDescription, setShortDescription] = useState("");
    const [phone1, setPhone1] = useState("");
    const [phone2, setPhone2] = useState("");
    const [province, setProvince] = useState(null);
    const [district, setDistrict] = useState(null);
    const [location, setLocation] = useState("");
    const [coordinates, setCoordinates] = useState(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [dialCode, setDialCode] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [existingMobile, setExistingMobile] = useState("");
    const [err, setErr] = useState("");

    const hotelTypeOptions = HOTEL_TYPE_OPTIONS.map((type) => ({
        label: type,
        value: type,
    }));

    const provinceOptions = PROVINCE_OPTIONS.map((provinceName) => ({
        label: provinceName,
        value: provinceName,
    }));

    const districtOptions = (
        PROVINCE_DISTRICTS[province?.value] || []
    ).map((districtName) => ({
        label: districtName,
        value: districtName,
    }));

    const handleProvinceChange = (selected) => {
        setProvince(selected);
        setDistrict(null);
    };

    useEffect(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        try {
            const data = JSON.parse(saved);

            setHotelName(data.hotelName || "");
            setShortDescription(data.shortDescription || "");
            setPhone1(data.phone1 || "");
            setPhone2(data.phone2 || "");
            setLocation(data.location || "");

            if (
                data.latitude !== undefined &&
                data.latitude !== null &&
                data.longitude !== undefined &&
                data.longitude !== null
            ) {
                setCoordinates({
                    lat: Number(data.latitude),
                    lng: Number(data.longitude),
                });
            }

            let matchedCountry = null;

            if (data.country) {
                matchedCountry = COUNTRIES.find(
                    (country) =>
                        `${country.flag} ${country.name}` === data.country
                );

                if (matchedCountry) {
                    setDialCode(matchedCountry.dial);
                    setCountryCode(matchedCountry.code);
                }
            }

            if (data.mobile) {
                const savedMobile =
                    matchedCountry &&
                    data.mobile.startsWith(matchedCountry.dial)
                        ? data.mobile.slice(matchedCountry.dial.length)
                        : data.mobile;

                setExistingMobile(savedMobile);
            }

            if (data.hotelType) {
                setHotelType({
                    label: data.hotelType,
                    value: data.hotelType,
                });
            }

            if (data.province) {
                setProvince({
                    label: data.province,
                    value: data.province,
                });
            }

            if (data.district) {
                setDistrict({
                    label: data.district,
                    value: data.district,
                });
            }
        } catch (error) {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const buildFormData = () => {
        const savedData =
            JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};

        return {
            ...savedData,
            hotelName,
            hotelType: hotelType?.value || "",
            shortDescription,
            phone1,
            phone2,
            province: province?.value || "",
            district: district?.value || "",
            location,
            latitude: coordinates?.lat ?? null,
            longitude: coordinates?.lng ?? null,
        };
    };

    const handlePrevious = () => {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(buildFormData())
        );

        navigate(-1);
    };

    const handleNext = () => {
        if (
            !hotelName ||
            !hotelType ||
            !phone1 ||
            !province ||
            !district ||
            !location
        ) {
            setErr("Please fill all required fields");
            return;
        }

        if (
            countryCode &&
            !isValidPhoneNumber(phone1, countryCode)
        ) {
            setErr("Please enter a valid Phone 1 number");
            return;
        }

        if (
            phone2 &&
            countryCode &&
            !isValidPhoneNumber(phone2, countryCode)
        ) {
            setErr("Please enter a valid Phone 2 number");
            return;
        }

        if (
            existingMobile &&
            (phone1 === existingMobile || phone2 === existingMobile)
        ) {
            setErr(
                "Phone 1 or Phone 2 cannot be the same as your mobile number"
            );
            return;
        }

        if (phone1 && phone2 && phone1 === phone2) {
            setErr("Phone 1 and Phone 2 cannot be the same");
            return;
        }

        setErr("");

        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(buildFormData())
        );

        navigate("/hotelfacilities");
    };

    const handleConfirmLocation = (pickedLocation) => {
        setLocation(pickedLocation.address);
        setCoordinates({
            lat: pickedLocation.lat,
            lng: pickedLocation.lng,
        });
        setShowMapPicker(false);
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
                                            {step.done ? (
                                                <FaCheck />
                                            ) : (
                                                step.number
                                            )}
                                        </span>
                                    </div>

                                    <span className="mt-1 text-text text-[6px] sm:text-[8px] lg:text-[12px] text-center leading-tight whitespace-nowrap">
                                        {step.label}
                                    </span>
                                </div>

                                {index < STEPS.length - 1 && (
                                    <div className="flex-1 mt-[9px] sm:mt-[11px] lg:mt-[15px] border-t-2 border-dashed border-text/50 mx-1" />
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
                            Sign up as Hotel Owner
                        </h1>

                        {err && (
                            <div className="text-[#9E4444] text-[12px] text-center mt-[5px] px-2">
                                {err}
                            </div>
                        )}

                        <div className="mt-[20px] w-full">
                            <input
                                placeholder="Hotel Name"
                                value={hotelName}
                                onChange={(e) =>
                                    setHotelName(e.target.value)
                                }
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
                            />
                        </div>

                        <div className="mt-[10px] w-full">
                            <Select
                                options={hotelTypeOptions}
                                value={hotelType}
                                onChange={setHotelType}
                                placeholder="Hotel Type"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="mt-[10px] w-full relative">
                            <textarea
                                placeholder="Short Description"
                                value={shortDescription}
                                maxLength={1000}
                                onChange={(e) =>
                                    setShortDescription(e.target.value)
                                }
                                className="w-full h-[70px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] pt-[15px] pr-[20px] resize-none"
                            />

                            <span className="absolute right-[20px] bottom-[10px] text-[10px] text-text/50">
                                {shortDescription.length}/1000
                            </span>
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="h-[50px] bg-border/50 rounded-[20px] flex items-center relative">
                                <div className="absolute pl-[20px] text-[12px] text-text">
                                    {dialCode || "+"}
                                </div>

                                <input
                                    placeholder="Phone 1"
                                    value={phone1}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            );

                                        if (
                                            countryCode &&
                                            validatePhoneNumberLength(
                                                value,
                                                countryCode
                                            ) === "TOO_LONG"
                                        ) {
                                            return;
                                        }

                                        setPhone1(value);
                                    }}
                                    className="w-full h-[50px] text-text text-[12px] bg-transparent rounded-[20px] pl-[60px]"
                                />
                            </div>

                            <div className="h-[50px] bg-border/50 rounded-[20px] flex items-center relative">
                                <div className="absolute pl-[20px] text-[12px] text-text">
                                    {dialCode || "+"}
                                </div>

                                <input
                                    placeholder="Phone 2"
                                    value={phone2}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            );

                                        if (
                                            countryCode &&
                                            validatePhoneNumberLength(
                                                value,
                                                countryCode
                                            ) === "TOO_LONG"
                                        ) {
                                            return;
                                        }

                                        setPhone2(value);
                                    }}
                                    className="w-full h-[50px] text-text text-[12px] bg-transparent rounded-[20px] pl-[60px]"
                                />
                            </div>
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                            <Select
                                options={provinceOptions}
                                value={province}
                                onChange={handleProvinceChange}
                                placeholder="Province"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />

                            <Select
                                options={districtOptions}
                                value={district}
                                onChange={setDistrict}
                                placeholder={
                                    province
                                        ? "District"
                                        : "Select province first"
                                }
                                isDisabled={!province}
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="mt-[10px] w-full relative">
                            <input
                                id="hotel-location-input"
                                placeholder="Select your location on map or paste address"
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] pr-[45px]"
                            />

                            <button
                                type="button"
                                onClick={() => setShowMapPicker(true)}
                                className="absolute right-[15px] top-1/2 -translate-y-1/2 text-primary-green/80 cursor-pointer"
                            >
                                <FaMap />
                            </button>
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