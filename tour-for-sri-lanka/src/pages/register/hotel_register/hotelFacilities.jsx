import { Fragment, useEffect, useState } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa6";
import {
    FaCheck, FaWifi, FaParking, FaSwimmer, FaSnowflake, FaSpa,
    FaPaw, FaDumbbell, FaCocktail, FaTv, FaBath, FaTimes,
} from "react-icons/fa";

const STORAGE_KEY = "HotelOwnerRegister";

const CUSTOM_FACILITY_MAX_LENGTH = 10;

const FACILITY_OPTIONS = [
    { key: "wifi", label: "Wifi", icon: FaWifi },
    { key: "parking", label: "Parking", icon: FaParking },
    { key: "pool", label: "Pool", icon: FaSwimmer },
    { key: "ac", label: "AC", icon: FaSnowflake },
    { key: "spa", label: "Spa", icon: FaSpa },
    { key: "allowsPets", label: "Allows pets", icon: FaPaw },
    { key: "gym", label: "Gym", icon: FaDumbbell },
    { key: "bar", label: "Bar", icon: FaCocktail },
    { key: "tv", label: "TV", icon: FaTv },
    { key: "hotWater", label: "Hot Water", icon: FaBath },
];

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Hotel Information", done: true, number: "2" },
    { label: "Facilities", number: "3", current: true },
    { label: "Verification", number: "4" },
];

export default function HotelFacilities() {
    const navigate = useNavigate();

    const [facilities, setFacilities] = useState([]);
    const [customFacilities, setCustomFacilities] = useState([]);
    const [customInput, setCustomInput] = useState("");

    const [photos, setPhotos] = useState([]);

    const [err, setErr] = useState("");

    useEffect(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const data = JSON.parse(saved);

        setFacilities(data.facilities || []);
        setCustomFacilities(data.otherFacilities || []);

        if (data.images && data.images.length > 0) {
            setPhotos(
                data.images.map((url) => ({
                    name: url.split("/").pop(),
                    url,
                    uploading: false,
                }))
            );
        }
    }, []);

    const toggleFacility = (key) => {
        setFacilities((prev) =>
            prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
        );
    };

    const handleAddCustomFacility = () => {
        const value = customInput.trim().slice(0, CUSTOM_FACILITY_MAX_LENGTH);

        if (!value || customFacilities.includes(value)) {
            setCustomInput("");
            return;
        }

        setCustomFacilities((prev) => [...prev, value]);
        setCustomInput("");
    };

    const handleCustomKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddCustomFacility();
        }
    };

    const handleRemoveCustomFacility = (value) => {
        setCustomFacilities((prev) => prev.filter((f) => f !== value));
    };

    const handlePhotoChange = async (e) => {
        const files = Array.from(e.target.files || []);

        const newFiles = files.filter((file) => {
            return !photos.some((photo) => photo.name === file.name);
        });

        if (newFiles.length !== files.length) {
            setErr("This photo has already been selected");
            e.target.value = "";
            return;
        }

        if (photos.length + newFiles.length > 5) {
            setErr("You can upload a maximum of 5 photos");
            e.target.value = "";
            return;
        }

        setErr("");
        e.target.value = "";

        for (const file of newFiles) {
            const tempEntry = { name: file.name, url: null, uploading: true };
            setPhotos((prev) => [...prev, tempEntry]);

            try {
                const uploadFormData = new FormData();
                uploadFormData.append("photo", file);

                const res = await fetch("http://localhost:3000/api/hotel/upload-photo", {
                    method: "POST",
                    body: uploadFormData,
                });

                const result = await res.json();

                if (!res.ok) {
                    setErr(result.error || "Photo upload failed");
                    setPhotos((prev) => prev.filter((p) => p.name !== file.name));
                    continue;
                }

                setPhotos((prev) =>
                    prev.map((p) =>
                        p.name === file.name ? { ...p, url: result.url, uploading: false } : p
                    )
                );
            } catch (error) {
                setErr("Photo upload failed, please try again later");
                setPhotos((prev) => prev.filter((p) => p.name !== file.name));
            }
        }
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setErr("");
    };

    const buildFormData = () => {
        const oldData = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};

        return {
            ...oldData,
            facilities,
            otherFacilities: customFacilities,
            images: photos.filter((p) => p.url).map((p) => p.url),
        };
    };

    const handlePrevious = () => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buildFormData()));
        navigate(-1);
    };

    const handleNext = () => {
        if (photos.some((p) => p.uploading)) {
            setErr("Please wait, photos are still uploading");
            return;
        }

        setErr("");

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buildFormData()));

        navigate("/hotelverification");
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
                            Sign up as Hotel Owner
                        </h1>

                        {err && (
                            <div className="text-[#9E4444] text-[12px] text-center mt-[5px] px-2">
                                {err}
                            </div>
                        )}

                        <div className="w-full mt-[20px] text-[14px] font-bold self-start">
                            Facilities &amp; Services
                        </div>

                        <div className="w-full mt-[10px] grid grid-cols-3 sm:grid-cols-4 gap-[10px]">
                            {FACILITY_OPTIONS.map(({ key, label, icon: Icon }) => {
                                const selected = facilities.includes(key);
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggleFacility(key)}
                                        className={`relative h-[65px] rounded-[15px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold px-[6px] text-center transition-all duration-200 cursor-pointer ${
                                            selected
                                                ? "bg-primary-green/20 border-2 border-primary-green text-text"
                                                : "bg-border/50 border-2 border-transparent text-text"
                                        }`}
                                    >
                                        {selected && (
                                            <span className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-primary-green flex items-center justify-center text-primary-1 text-[9px]">
                                                <FaCheck />
                                            </span>
                                        )}
                                        <Icon className="text-primary-green text-[16px]" />
                                        <span className="leading-[13px]">{label}</span>
                                    </button>
                                );
                            })}

                            {customFacilities.map((label) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => handleRemoveCustomFacility(label)}
                                    title="Click to remove"
                                    className="relative h-[65px] rounded-[15px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold px-[6px] text-center bg-primary-green/20 border-2 border-primary-green text-text transition-all duration-200 cursor-pointer"
                                >
                                    <span className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-primary-green flex items-center justify-center text-primary-1 text-[9px]">
                                        <FaTimes />
                                    </span>
                                    <span className="leading-[13px] break-words">{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="w-full mt-[20px] text-[14px] font-bold self-start">
                            Other Available Facility
                        </div>

                        <div className="mt-[10px] w-full relative">
                            <input
                                type="text"
                                placeholder="Type a facility and press Enter...."
                                value={customInput}
                                maxLength={CUSTOM_FACILITY_MAX_LENGTH}
                                onChange={(e) => setCustomInput(e.target.value)}
                                onKeyDown={handleCustomKeyDown}
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] pr-[60px]"
                            />
                            <span className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[10px] text-text/50">
                                {customInput.length}/{CUSTOM_FACILITY_MAX_LENGTH}
                            </span>
                        </div>

                        <input
                            type="file"
                            id="hotelPhotos"
                            multiple
                            accept="image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                        <label
                            htmlFor="hotelPhotos"
                            className="w-full h-[150px] bg-border/50 rounded-[20px] mt-[10px] p-[10px] flex flex-col cursor-pointer"
                        >
                            <span className="text-[12px] font-bold text-text">Add Hotel Photos</span>
                            <span className="text-[12px] text-text/80">Upload Your Photos</span>
                            <div className="w-full h-full p-[10px] flex">
                                <div className="w-full h-full rounded-[10px] border-2 border-dotted border-text/50 p-2">
                                    {photos.length === 0 ? (
                                        <div className="w-full h-full flex flex-col justify-center items-center">
                                            <FaUpload className="text-primary-green/80 text-2xl" />
                                            <span className="text-[10px] text-text/50 text-center">
                                                Click to Upload <br />
                                                or Drag and Drop <br />
                                                JPG or PNG (Max 5MB)
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 h-full">
                                            {photos.map((photo, index) => (
                                                <div key={index} className="relative w-[65px] h-[65px]">
                                                    {photo.uploading ? (
                                                        <div className="w-[65px] h-[65px] rounded-lg bg-border flex items-center justify-center text-[8px] text-text/80">
                                                            Uploading...
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={photo.url}
                                                            alt={`preview-${index}`}
                                                            className="w-[65px] h-[65px] object-cover rounded-lg"
                                                        />
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            removePhoto(index);
                                                        }}
                                                        className="absolute bottom-[50px] left-[50px] w-[20px] h-[20px] rounded-full bg-border hover:bg-[#9E4444] hover:text-text/80 text-text/50 text-[12px] flex items-center justify-center transition-all duration-300"
                                                    >
                                                        x
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </label>

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