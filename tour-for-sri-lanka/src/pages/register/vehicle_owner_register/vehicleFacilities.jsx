import { API_BASE_URL } from "../../../config/api";
import { Fragment, useEffect, useState } from "react";
import { FaCheck, FaUpload } from "react-icons/fa";
import {
    GrFormNextLink,
    GrFormPreviousLink,
} from "react-icons/gr";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "VehicleOwnerRegister";
const MAX_PHOTOS = 5;
const API_URL = `${API_BASE_URL}/api/transport/upload-photo`;

const LUGGAGE_OPTIONS = {
    car: [
        { value: 1, label: "Small (1 bag)" },
        { value: 2, label: "Medium (2 bags)" },
    ],
    van: [
        { value: 2, label: "Medium (2–4 bags)" },
        { value: 3, label: "Large (5–8 bags)" },
    ],
    bus: [
        { value: 3, label: "Medium storage" },
        { value: 4, label: "Large storage" },
    ],
    jeep: [{ value: 1, label: "Small (1–2 bags)" }],
};

const MAX_PASSENGERS = {
    car: 7,
    van: 15,
    bus: 60,
    jeep: 8,
};

const FUEL_TYPES = [
    { value: "petrol", label: "Petrol" },
    { value: "diesel", label: "Diesel" },
    { value: "electric", label: "Electric" },
    { value: "hybrid", label: "Hybrid" },
];

const DISTRICTS = [
    { value: "ampara", label: "Ampara" },
    { value: "anuradhapura", label: "Anuradhapura" },
    { value: "badulla", label: "Badulla" },
    { value: "batticaloa", label: "Batticaloa" },
    { value: "colombo", label: "Colombo" },
    { value: "galle", label: "Galle" },
    { value: "gampaha", label: "Gampaha" },
    { value: "hambantota", label: "Hambantota" },
    { value: "jaffna", label: "Jaffna" },
    { value: "kalutara", label: "Kalutara" },
    { value: "kandy", label: "Kandy" },
    { value: "kegalle", label: "Kegalle" },
    { value: "kilinochchi", label: "Kilinochchi" },
    { value: "kurunegala", label: "Kurunegala" },
    { value: "mannar", label: "Mannar" },
    { value: "matale", label: "Matale" },
    { value: "matara", label: "Matara" },
    { value: "monaragala", label: "Monaragala" },
    { value: "mullaitivu", label: "Mullaitivu" },
    { value: "nuwara-eliya", label: "Nuwara Eliya" },
    { value: "polonnaruwa", label: "Polonnaruwa" },
    { value: "puttalam", label: "Puttalam" },
    { value: "ratnapura", label: "Ratnapura" },
    { value: "trincomalee", label: "Trincomalee" },
    { value: "vavuniya", label: "Vavuniya" },
];

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Vehicle Information", done: true, number: "2" },
    { label: "Facilities", current: true, number: "3" },
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
        zIndex: 100,
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
    multiValue: (base) => ({
        ...base,
        backgroundColor: "var(--color-primary-green)",
        opacity: 0.8,
        borderRadius: "10px",
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: "var(--color-text)",
        fontWeight: 600,
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: "var(--color-text)",
        ":hover": {
            backgroundColor: "#00A87A",
            borderRadius: "10px",
            color: "#fff",
        },
    }),
};

const miniSelectStyles = {
    ...selectStyles,
    control: (base) => ({
        ...selectStyles.control(base),
        minHeight: "34px",
        borderRadius: "10px",
    }),
    menu: (base) => ({
        ...selectStyles.menu(base),
        fontSize: "12px",
    }),
    singleValue: (base) => ({
        ...selectStyles.singleValue(base),
        paddingLeft: "6px",
        fontSize: "12px",
    }),
    placeholder: (base) => ({
        ...selectStyles.placeholder(base),
        paddingLeft: "6px",
        fontSize: "12px",
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: "2px",
        svg: {
            width: "14px",
            height: "14px",
        },
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0 2px",
    }),
};

export default function VehicleFacilities() {
    const navigate = useNavigate();

    const [passengerCapacity, setPassengerCapacity] = useState(null);
    const [luggageCapacity, setLuggageCapacity] = useState(null);
    const [fuelType, setFuelType] = useState(null);
    const [availableArea, setAvailableArea] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState("");

    const vehicleData = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) || "{}"
    );

    const vehicleType =
        vehicleData?.vehicleType?.value?.toLowerCase() || "";

    const luggageOptions = LUGGAGE_OPTIONS[vehicleType] || [];
    const maxPassengers = MAX_PASSENGERS[vehicleType] || 0;

    const passengerOptions = Array.from(
        { length: maxPassengers },
        (_, index) => ({
            value: index + 1,
            label: `${index + 1}`,
        })
    );

    useEffect(() => {
        const savedData = JSON.parse(
            sessionStorage.getItem(STORAGE_KEY) || "{}"
        );

        setPassengerCapacity(savedData.passengerCapacity || null);
        setLuggageCapacity(savedData.luggageCapacity || null);
        setFuelType(savedData.fuelType || null);
        setAvailableArea(savedData.availableArea || []);

        if (savedData.addVehiclePhotos?.length) {
            setPhotos(
                savedData.addVehiclePhotos.map((url) => ({
                    name: url.split("/").pop(),
                    url,
                    uploading: false,
                }))
            );
        }
    }, []);

    const saveFormData = () => {
        const currentData = JSON.parse(
            sessionStorage.getItem(STORAGE_KEY) || "{}"
        );

        const updatedData = {
            ...currentData,
            availableArea,
            passengerCapacity,
            luggageCapacity,
            fuelType,
            addVehiclePhotos: photos
                .filter((photo) => photo.url)
                .map((photo) => photo.url),
        };

        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedData)
        );

        return updatedData;
    };

    const handlePhotoChange = async (event) => {
        const selectedFiles = Array.from(
            event.target.files || []
        );

        if (!selectedFiles.length) {
            return;
        }

        const duplicateFile = selectedFiles.some((file) =>
            photos.some((photo) => photo.name === file.name)
        );

        if (duplicateFile) {
            setError("This photo has already been selected.");
            event.target.value = "";
            return;
        }

        if (photos.length + selectedFiles.length > MAX_PHOTOS) {
            setError(
                `You can upload a maximum of ${MAX_PHOTOS} photos.`
            );
            event.target.value = "";
            return;
        }

        setError("");
        event.target.value = "";

        for (const file of selectedFiles) {
            if (
                ![
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                ].includes(file.type)
            ) {
                setError("Only JPG and PNG images are allowed.");
                continue;
            }

            const temporaryPhoto = {
                name: file.name,
                url: null,
                uploading: true,
            };

            setPhotos((previous) => [
                ...previous,
                temporaryPhoto,
            ]);

            try {
                const formData = new FormData();
                formData.append("photo", file);

                const response = await fetch(API_URL, {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Photo upload failed."
                    );
                }

                setPhotos((previous) =>
                    previous.map((photo) =>
                        photo.name === file.name
                            ? {
                                  ...photo,
                                  url: result.url,
                                  uploading: false,
                              }
                            : photo
                    )
                );
            } catch (uploadError) {
                setError(
                    uploadError.message ||
                        "Photo upload failed. Please try again."
                );

                setPhotos((previous) =>
                    previous.filter(
                        (photo) => photo.name !== file.name
                    )
                );
            }
        }
    };

    const removePhoto = (index) => {
        setPhotos((previous) =>
            previous.filter(
                (_, photoIndex) => photoIndex !== index
            )
        );

        setError("");
    };

    const handlePrevious = () => {
        saveFormData();
        navigate(-1);
    };

    const handleNext = () => {
        if (
            availableArea.length === 0 ||
            !passengerCapacity ||
            !luggageCapacity ||
            !fuelType ||
            photos.length === 0
        ) {
            setError("Please fill all required fields.");
            return;
        }

        if (photos.some((photo) => photo.uploading)) {
            setError(
                "Please wait until all photos finish uploading."
            );
            return;
        }

        saveFormData();
        navigate("/vehicleverification");
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
                    <div className="w-[180px] sm:w-[220px] md:w-[400px] lg:w-[500px] xl:w-[550px] flex items-center justify-center shrink-0 ">
                        <img
                            src="/main_logo.png"
                            alt="Tours for Sri Lanka"
                            className="w-full h-auto object-contain"
                        />
                    </div>

                    <div className="login-card-anim w-full max-w-[500px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-8">
                        <h1 className="text-[20px] sm:text-[25px] font-bold text-text text-center">
                            Sign up as a Vehicle Owner
                        </h1>

                        {error && (
                            <p className="text-[#9E4444] text-[12px] text-center mt-2 px-2">
                                {error}
                            </p>
                        )}

                        <div className="mt-[20px] w-full text-[12px]">
                            <Select
                                options={DISTRICTS}
                                isMulti
                                value={availableArea}
                                onChange={(selected) =>
                                    setAvailableArea(
                                        selected || []
                                    )
                                }
                                placeholder="Available Districts"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="w-full bg-border/50 rounded-[20px] mt-[10px] p-3 sm:p-4">
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                <div className="flex flex-col items-center min-w-0">
                                    <div className="text-text/80 text-[9px] sm:text-[11px] mb-2 text-center leading-tight">
                                        Passenger
                                        <br />
                                        Capacity
                                    </div>

                                    <div className="w-full">
                                        <Select
                                            options={passengerOptions}
                                            value={passengerCapacity}
                                            onChange={
                                                setPassengerCapacity
                                            }
                                            placeholder="0"
                                            menuPosition="fixed"
                                            menuPortalTarget={
                                                document.body
                                            }
                                            styles={
                                                miniSelectStyles
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center min-w-0">
                                    <div className="text-text/80 text-[9px] sm:text-[11px] mb-2 text-center leading-tight">
                                        Luggage
                                        <br />
                                        Capacity
                                    </div>

                                    <div className="w-full">
                                        <Select
                                            options={luggageOptions}
                                            value={luggageCapacity}
                                            onChange={
                                                setLuggageCapacity
                                            }
                                            placeholder="Select"
                                            menuPosition="fixed"
                                            menuPortalTarget={
                                                document.body
                                            }
                                            styles={
                                                miniSelectStyles
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center min-w-0">
                                    <div className="text-text/80 text-[9px] sm:text-[11px] mb-2 text-center leading-tight">
                                        Fuel
                                        <br />
                                        Type
                                    </div>

                                    <div className="w-full">
                                        <Select
                                            options={FUEL_TYPES}
                                            value={fuelType}
                                            onChange={setFuelType}
                                            placeholder="Select"
                                            menuPosition="fixed"
                                            menuPortalTarget={
                                                document.body
                                            }
                                            styles={
                                                miniSelectStyles
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-border/50 rounded-[20px] mt-[10px] p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="w-full sm:w-[130px] text-center sm:text-left">
                                    <h2 className="font-bold text-text text-[16px]">
                                        Vehicle Photos
                                    </h2>

                                    <p className="text-[11px] text-text/80 pt-2">
                                        Upload clear photos of
                                        your vehicle
                                    </p>

                                    <p className="text-[11px] text-text/80 pt-2">
                                        JPG, PNG format
                                    </p>

                                    <p className="text-[11px] text-text/80 pt-1">
                                        Maximum {MAX_PHOTOS} photos
                                    </p>
                                </div>

                                <div className="flex flex-col items-center w-full sm:w-auto">
                                    <input
                                        type="file"
                                        id="vehiclePhotos"
                                        multiple
                                        accept="image/png,image/jpeg,image/jpg"
                                        className="hidden"
                                        onChange={
                                            handlePhotoChange
                                        }
                                    />

                                    <label
                                        htmlFor="vehiclePhotos"
                                        className="w-[220px] h-[80px] overflow-x-auto bg-border/50 rounded-[15px] border-2 border-dotted border-primary-green/50 flex flex-col justify-center items-center cursor-pointer hover:border-primary-green/80 transition-all duration-300"
                                    >
                                        {photos.length === 0 ? (
                                            <>
                                                <FaUpload className="text-primary-green/60 text-[22px]" />

                                                <p className="text-[10px] text-text/50 mt-2 text-center px-2">
                                                    Click to Upload
                                                </p>

                                                <p className="text-[10px] text-text/50">
                                                    or Drag & Drop
                                                </p>

                                                <p className="text-primary-green/60 text-[10px] mt-1">
                                                    Browse Files
                                                </p>
                                            </>
                                        ) : (
                                            <div className="flex gap-2 w-full h-full p-2 items-center">
                                                {photos
                                                    .slice(
                                                        0,
                                                        MAX_PHOTOS
                                                    )
                                                    .map(
                                                        (
                                                            photo,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={`${photo.name}-${index}`}
                                                                className="relative min-w-[42px] w-[42px] h-full"
                                                            >
                                                                {photo.uploading ? (
                                                                    <div className="w-full h-full rounded-lg bg-border flex items-center justify-center">
                                                                        <span className="text-[8px] text-text/80 text-center">
                                                                            Uploading...
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={
                                                                            photo.url
                                                                        }
                                                                        alt={`Vehicle ${
                                                                            index +
                                                                            1
                                                                        }`}
                                                                        className="w-full h-full object-cover rounded-lg"
                                                                    />
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        event
                                                                    ) => {
                                                                        event.preventDefault();
                                                                        event.stopPropagation();
                                                                        removePhoto(
                                                                            index
                                                                        );
                                                                    }}
                                                                    className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-border hover:bg-[#9E4444] text-text text-[10px] flex items-center justify-center transition-all duration-300"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                            </div>
                                        )}
                                    </label>

                                    {photos.length > 0 &&
                                        photos.length <
                                            MAX_PHOTOS && (
                                            <p className="text-[9px] text-primary-green/70 mt-2 text-center">
                                                Click to add more
                                                photos (
                                                {photos.length}/
                                                {MAX_PHOTOS})
                                            </p>
                                        )}
                                </div>
                            </div>
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
        </div>
    );
}