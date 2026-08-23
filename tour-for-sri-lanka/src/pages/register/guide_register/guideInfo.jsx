import { Fragment, useEffect, useRef, useState } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import Select from "react-select";
import { FaCheck, FaRegCalendarAlt, FaMap, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet";
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

const DEFAULT_MAP_CENTER = {
    lat: 6.9271,
    lng: 79.8612,
};

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const MARITAL_OPTIONS = [
    "Single",
    "Married",
    "Divorced",
    "Widowed",
];

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
    {
        label: "Account",
        done: true,
        number: "1",
    },
    {
        label: "Personal Info",
        number: "2",
        current: true,
    },
    {
        label: "Language & Skills",
        number: "3",
    },
    {
        label: "Pricing",
        number: "4",
    },
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

function MapPickerModal({
    initialPosition,
    onClose,
    onConfirm,
}) {
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

            const data = await response.json();

            setAddress(data.display_name || "");
        } catch {
            setAddress("");
        } finally {
            setLoadingAddress(false);
        }
    };

    useEffect(() => {
        reverseGeocode(position.lat, position.lng);
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
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

                const data = await response.json();

                setSearchResults(data);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
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
            (currentPosition) => {
                const latlng = {
                    lat: currentPosition.coords.latitude,
                    lng: currentPosition.coords.longitude,
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
        setAddress(result.display_name);
        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-[20px]">
            <div className="w-[600px] max-w-full rounded-[20px] bg-primary-2 p-[20px] text-text">
                <h2 className="mb-[10px] text-center text-[18px] font-bold">
                    Pick your address location
                </h2>

                <div className="relative w-full">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) =>
                            setSearchQuery(event.target.value)
                        }
                        placeholder="Search for a place (e.g. Galle Fort, Kandy)"
                        className="h-[45px] w-full rounded-[15px] bg-border/50 pl-[40px] pr-[15px] text-[12px] text-text placeholder:text-text/50"
                    />

                    <FaSearch className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[12px] text-primary-green/70" />

                    {(searching || searchResults.length > 0) && (
                        <div className="absolute left-0 top-[50px] z-[1001] max-h-[200px] w-full overflow-y-auto overflow-hidden rounded-[15px] bg-border">
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
                                        className="cursor-pointer border-b border-text/10 px-[15px] py-[10px] text-[12px] text-text last:border-none hover:bg-primary-green/40"
                                    >
                                        {result.display_name}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="mt-[15px] h-[350px] w-full overflow-hidden rounded-[15px]">
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

                        <LocationClickHandler
                            onPick={handlePick}
                        />

                        <RecenterMap position={position} />
                    </MapContainer>
                </div>

                <div className="mt-[15px] min-h-[40px] w-full rounded-[15px] bg-border/50 p-[10px] text-[12px]">
                    {loadingAddress
                        ? "Finding address..."
                        : address ||
                          "Click on the map to drop a pin"}
                </div>

                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="mt-[10px] w-full cursor-pointer text-left text-[12px] text-primary-green/80 underline"
                >
                    {locating
                        ? "Locating..."
                        : "Use my current location"}
                </button>

                <div className="mt-[15px] flex w-full gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-[45px] w-full cursor-pointer rounded-[20px] bg-border/50 text-[14px] font-bold transition-all duration-300 hover:bg-border/80"
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
                        disabled={!address}
                        className="h-[45px] w-full cursor-pointer rounded-[20px] bg-primary-green/50 text-[14px] font-bold transition-all duration-300 hover:bg-primary-green/80 disabled:cursor-not-allowed disabled:opacity-50"
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

    const genderOptions = GENDER_OPTIONS.map((item) => ({
        label: item,
        value: item,
    }));

    const maritalOptions = MARITAL_OPTIONS.map((item) => ({
        label: item,
        value: item,
    }));

    const ethnicityOptions = ETHNICITY_OPTIONS.map((item) => ({
        label: item,
        value: item,
    }));

    const provinceOptions = PROVINCE_OPTIONS.map((item) => ({
        label: item,
        value: item,
    }));

    const districtOptions = (
        PROVINCE_DISTRICTS[province?.value] || []
    ).map((item) => ({
        label: item,
        value: item,
    }));

    useEffect(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const data = JSON.parse(saved);

        setDateOfBirth(data.dateOfBirth || "");
        setAddress(data.address || "");
        setNIC(data.NIC || "");
        setAboutYourSelf(data.aboutYourSelf || "");

        if (
            data.latitude !== undefined &&
            data.longitude !== undefined
        ) {
            setCoordinates({
                lat: data.latitude,
                lng: data.longitude,
            });
        }

        if (data.gender) {
            setGender({
                label: data.gender,
                value: data.gender,
            });
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
    }, []);

    const buildFormData = () => {
        const oldData =
            JSON.parse(
                sessionStorage.getItem(STORAGE_KEY)
            ) || {};

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

        const nicRegex =
            /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/;

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

    const handleOpenMap = () => {
        setShowMapPicker(true);
    };

    const handleConfirmLocation = (picked) => {
        setAddress(picked.address);

        setCoordinates({
            lat: picked.lat,
            lng: picked.lng,
        });

        setShowMapPicker(false);
    };

    const handleProvinceChange = (selected) => {
        setProvince(selected);
        setDistrict(null);
    };

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-primary-1 to-primary-2">
            <div className="absolute left-0 top-0 z-10 flex w-full justify-center px-4 pt-6 sm:px-6 sm:pt-8 lg:pt-[50px]">
                <div className="flex w-full max-w-[1200px] justify-center lg:justify-start">
                    <div className="flex w-[260px] items-start sm:w-[340px] lg:w-[500px] xl:w-[550px]">
                        {STEPS.map((step, index) => (
                            <Fragment key={step.label}>
                                <div className="flex w-[40px] shrink-0 flex-col items-center sm:w-[58px] lg:w-[80px]">
                                    <div
                                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-[22px] sm:w-[22px] lg:h-[30px] lg:w-[30px] ${
                                            step.done
                                                ? "bg-primary-green/80"
                                                : step.current
                                                ? "bg-primary-green/30"
                                                : "bg-border/80"
                                        }`}
                                    >
                                        <span className="text-[7px] text-text sm:text-[9px] lg:text-[12px]">
                                            {step.done ? (
                                                <FaCheck />
                                            ) : (
                                                step.number
                                            )}
                                        </span>
                                    </div>

                                    <span className="mt-1 whitespace-nowrap text-center text-[6px] leading-tight text-text sm:text-[8px] lg:text-[12px]">
                                        {step.label}
                                    </span>
                                </div>

                                {index <
                                    STEPS.length - 1 && (
                                    <div className="mx-1 mt-[9px] flex-1 border-t-2 border-dashed border-text/50 sm:mt-[11px] lg:mt-[15px]" />
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6">
                <div className="flex w-full max-w-[1200px] flex-col items-center justify-center gap-10 lg:flex-row lg:justify-between lg:gap-20">
                    <div className="flex w-[180px] shrink-0 items-center justify-center sm:w-[220px] md:w-[400px] lg:w-[500px] xl:w-[550px]">
                        <img
                            src="/main_logo.png"
                            alt="Tours for Sri Lanka"
                            className="h-auto w-full object-contain"
                        />
                    </div>

                    <div className="login-card-anim flex w-full max-w-[500px] flex-col items-center rounded-[20px] bg-primary-2 px-4 py-[20px] text-text sm:px-8 sm:py-[30px]">
                        <h1 className="text-center text-[20px] font-bold text-text sm:text-[25px]">
                            Sign up as a Guide
                        </h1>

                        {err && (
                            <div className="mt-[5px] px-2 text-center text-[12px] text-[#9E4444]">
                                {err}
                            </div>
                        )}

                        <div className="relative mt-[20px] w-full">
                            <input
                                ref={dobRef}
                                type="date"
                                value={dateOfBirth}
                                max={
                                    new Date()
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(event) =>
                                    setDateOfBirth(
                                        event.target.value
                                    )
                                }
                                onClick={() => {
                                    try {
                                        dobRef.current?.showPicker();
                                    } catch {}
                                }}
                                className={`h-[50px] w-full rounded-[20px] bg-border/50 pl-[20px] pr-[45px] text-[12px] [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 ${
                                    dateOfBirth
                                        ? "text-text"
                                        : "text-transparent"
                                }`}
                            />

                            <FaRegCalendarAlt className="pointer-events-none absolute right-[20px] top-1/2 -translate-y-1/2 text-primary-green/70" />

                            {!dateOfBirth && (
                                <span className="pointer-events-none absolute left-[20px] top-1/2 -translate-y-1/2 text-[12px] text-text/50">
                                    Date of Birth
                                </span>
                            )}
                        </div>

                        <div className="relative mt-[10px] w-full">
                            <input
                                placeholder="Home Address"
                                value={address}
                                onChange={(event) =>
                                    setAddress(
                                        event.target.value
                                    )
                                }
                                className="h-[50px] w-full rounded-[20px] bg-border/50 pl-[20px] pr-[45px] text-[12px] text-text"
                            />

                            <button
                                type="button"
                                onClick={handleOpenMap}
                                className="absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer text-primary-green/80"
                            >
                                <FaMap />
                            </button>
                        </div>

                        <div className="mt-[10px] grid w-full grid-cols-1 gap-3 text-[12px] sm:grid-cols-2 sm:gap-4">
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

                        <div className="mt-[10px] grid w-full grid-cols-1 gap-3 text-[12px] sm:grid-cols-2 sm:gap-4">
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

                        <div className="mt-[10px] grid w-full grid-cols-1 gap-3 text-[12px] sm:grid-cols-2 sm:gap-4">
                            <input
                                placeholder="NIC"
                                value={NIC}
                                maxLength={12}
                                onChange={(event) => {
                                    const value =
                                        event.target.value;

                                    if (
                                        /^[0-9]{0,12}$/.test(
                                            value
                                        ) ||
                                        /^[0-9]{9}[vVxX]$/.test(
                                            value
                                        )
                                    ) {
                                        setNIC(value);
                                    }
                                }}
                                className="h-[50px] w-full rounded-[20px] bg-border/50 pl-[20px] text-[12px] text-text"
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

                        <div className="relative mt-[10px] w-full">
                            <textarea
                                placeholder="About Your Self"
                                value={aboutYourSelf}
                                maxLength={100}
                                onChange={(event) =>
                                    setAboutYourSelf(
                                        event.target.value
                                    )
                                }
                                className="h-[80px] w-full resize-none rounded-[20px] bg-border/50 pl-[20px] pr-[20px] pt-[15px] text-[12px] text-text"
                            />

                            <span className="absolute bottom-[10px] right-[20px] text-[10px] text-text/50">
                                {aboutYourSelf.length}/100
                            </span>
                        </div>

                        <div className="mt-[20px] grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="flex h-[50px] w-full cursor-pointer items-center justify-center rounded-[20px] bg-border/50 text-[16px] font-bold transition-all duration-300 hover:scale-95 hover:bg-border/80"
                            >
                                <GrFormPreviousLink className="text-[20px] font-bold" />
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex h-[50px] w-full cursor-pointer items-center justify-center rounded-[20px] bg-primary-green/50 text-[16px] font-bold transition-all duration-300 hover:scale-105 hover:bg-primary-green/80"
                            >
                                Next
                                <GrFormNextLink className="text-[20px] font-bold" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showMapPicker && (
                <MapPickerModal
                    initialPosition={coordinates}
                    onClose={() =>
                        setShowMapPicker(false)
                    }
                    onConfirm={handleConfirmLocation}
                />
            )}
        </div>
    );
}