import { Fragment, useEffect, useState } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheck, FaUpload } from "react-icons/fa";

const STORAGE_KEY = "GuideRegister";

const SKILL_OPTIONS = [
    { label: "Cultural Tours", value: "CulturalTours" },
    { label: "Adventure Tours", value: "AdventureTours" },
    { label: "Wildlife Tours", value: "WildLifeTours" },
    { label: "Hiking", value: "Hiking" },
    { label: "Surfing Guide", value: "SurfingGuide" },
    { label: "Food Tours", value: "FoodTours" },
    { label: "Photography Tours", value: "PhotographyTours" },
    { label: "Historical Tours", value: "HistoricalTours" },
    { label: "City Tours", value: "CityTours" },
    { label: "Nature Guide", value: "NatureGuide" },
    { label: "Other", value: "Other" },
];

const LANGUAGE_OPTIONS = [
    { label: "English", value: "english" },
    { label: "Sinhala", value: "sinhala" },
    { label: "Tamil", value: "tamil" },
    { label: "Spanish", value: "spanish" },
    { label: "Japanese", value: "japan" },
    { label: "Chinese", value: "chaina" },
    { label: "Korean", value: "korean" },
];

const YEARS_OPTIONS = [...Array.from({ length: 20 }, (_, i) => `${i + 1}`), "20+"];

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Personal Info", done: true, number: "2" },
    { label: "Language & Skills", number: "3", current: true },
    { label: "Pricing", number: "4" },
];

const selectStyles = {
    control: (base) => ({
        ...base,
        width: "100%",
        minHeight: "50px",
        borderRadius: "20px",
        backgroundColor: "color-mix(in srgb, var(--color-border) 50%, transparent)",
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
        backgroundColor: state.isFocused ? "var(--color-primary-green)" : "var(--color-border)",
        color: "var(--color-text)",
        cursor: "pointer",
        fontSize: "12px",
    }),

    singleValue: (base) => ({
        ...base,
        color: "var(--color-text)",
        paddingLeft: "10px",
        fontSize: "12px"
    }),

    placeholder: (base) => ({
        ...base,
        color: "var(--color-text)",
        opacity: 0.5,
        paddingLeft: "10px",
        fontSize: "12px"
    }),

    input: (base) => ({
        ...base,
        color: "var(--color-text)",
    }),
};

const multiSelectStyles = {
    ...selectStyles,
    control: (base) => ({
        ...base,
        width: "100%",
        height: "50px",
        minHeight: "50px",
        maxHeight: "50px",
        borderRadius: "20px",
        backgroundColor: "color-mix(in srgb, var(--color-border) 50%, transparent)",
        border: "none",
        boxShadow: "none",
        overflow: "hidden",
    }),

    multiValue: (base) => ({
        ...base,
        backgroundColor: "color-mix(in srgb, var(--color-primary-green) 50%, transparent)",
        borderRadius: "10px",
        flexShrink: 0,
    }),

    multiValueLabel: (base) => ({
        ...base,
        color: "var(--color-primary-1)",
        fontWeight: "bold",
        whiteSpace: "nowrap",
    }),

    multiValueRemove: (base) => ({
        ...base,
        color: "var(--color-primary-1)",
        borderRadius: "0 10px 10px 0",
        ":hover": {
            backgroundColor: "var(--color-primary-green)",
            color: "var(--color-primary-1)",
        },
    }),

    valueContainer: (base) => ({
        ...base,
        paddingLeft: "10px",
        gap: "4px",
        flexWrap: "nowrap",
        overflowX: "auto",
        height: "50px",
        scrollbarWidth: "thin",
        scrollbarColor: "var(--color-primary-green) transparent",
    }),

    indicatorsContainer: (base) => ({
        ...base,
        height: "50px",
    }),
};

export default function GuideLanguageSkills() {
    const navigate = useNavigate();
    const location = useLocation();

    const [yearsExperience, setYearsExperience] = useState(null);
    const [licenseNumber, setLicenseNumber] = useState("");
    const [skills, setSkills] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [additionalFields, setAdditionalFields] = useState("");

    const [nicFile, setNicFile] = useState(location.state?.nicFile || null);
    const [licenseFile, setLicenseFile] = useState(location.state?.licenseFile || null);

    const [err, setErr] = useState("");

    const yearsOptions = YEARS_OPTIONS.map((y) => ({
        label: `${y} ${y === "1" ? "year" : "years"}`,
        value: y,
    }));

    const skillOptions = SKILL_OPTIONS;
    const languageOptions = LANGUAGE_OPTIONS;

    useEffect(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const data = JSON.parse(saved);

        setLicenseNumber(data.licenseNumber || "");
        setAdditionalFields(data.additionalFields || "");

        if (data.yearsExperience) {
            setYearsExperience({
                label: `${data.yearsExperience} ${data.yearsExperience === "1" ? "year" : "years"}`,
                value: data.yearsExperience,
            });
        }

        if (data.skills?.length) {
            setSkills(SKILL_OPTIONS.filter((opt) => data.skills.includes(opt.value)));
        }

        if (data.languages?.length) {
            setLanguages(LANGUAGE_OPTIONS.filter((opt) => data.languages.includes(opt.value)));
        }
    }, []);

    const isValidFileType = (file) => file.type === "application/pdf";

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!isValidFileType(file)) {
            setErr(`${type === "nic" ? "NIC or Passport" : "Guide License"} must be uploaded as a PDF`);
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErr(`${type === "nic" ? "NIC or Passport" : "Guide License"} must be less than 5MB`);
            e.target.value = "";
            return;
        }

        setErr("");
        if (type === "nic") setNicFile(file);
        if (type === "license") setLicenseFile(file);
    };

    const buildFormData = () => {
        const oldData = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};

        return {
            ...oldData,
            yearsExperience: yearsExperience?.value,
            licenseNumber,
            skills: skills.map((s) => s.value),
            languages: languages.map((l) => l.value),
            additionalFields,
        };
    };

    const handlePrevious = () => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buildFormData()));
        navigate(-1, { state: { nicFile, licenseFile } });
    };

    const handleNext = () => {
        if (
            !yearsExperience ||
            !licenseNumber ||
            !skills.length ||
            !languages.length ||
            !nicFile ||
            !licenseFile
        ) {
            setErr("Please fill all required fields");
            return;
        }

        const licenseRegex = /^GL\/\d{4}\/\d{6}$/;

        if (!licenseRegex.test(licenseNumber)) {
            setErr("Guide License Number must be in the form GL/xxxx/xxxxxx");
            return;
        }

        setErr("");

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buildFormData()));

        navigate("/guidepricing", { state: { nicFile, licenseFile } });
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

                        <div className="mt-[20px] w-full">
                            <Select
                                options={yearsOptions}
                                value={yearsExperience}
                                onChange={setYearsExperience}
                                placeholder="Years of Experience"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="mt-[10px] w-full">
                            <input
                                placeholder="Guide License Number (eg: GL/xxxx/xxxxxx)"
                                value={licenseNumber}
                                maxLength={14}
                                onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
                            />
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                            <Select
                                options={skillOptions}
                                value={skills}
                                onChange={setSkills}
                                placeholder="Skills"
                                isMulti
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={multiSelectStyles}
                            />

                            <Select
                                options={languageOptions}
                                value={languages}
                                onChange={setLanguages}
                                placeholder="Languages"
                                isMulti
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={multiSelectStyles}
                            />
                        </div>

                        <div className="mt-[10px] w-full relative">
                            <textarea
                                placeholder="Additional Fields"
                                value={additionalFields}
                                maxLength={200}
                                onChange={(e) => setAdditionalFields(e.target.value)}
                                className="w-full h-[70px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] pt-[15px] pr-[20px] resize-none"
                            />

                            <span className="absolute right-[20px] bottom-[10px] text-[10px] text-text/50">
                                {additionalFields.length}/200
                            </span>
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="w-full h-[135px] bg-border/50 rounded-[20px] text-[12px] p-[10px] text-text">
                                <span className="font-bold">NIC or Passport<br /></span>
                                <span className="text-[10px] opacity-50">Upload your certificates</span>

                                <div
                                    className={`relative w-full h-[80px] border-2 border-dotted rounded-[20px] mt-1 flex flex-col justify-center items-center text-[10px] text-center ${
                                        nicFile ? "border-primary-green" : "border-text/50"
                                    }`}
                                >
                                    <input
                                        type="file"
                                        accept="application/pdf, .pdf"
                                        onChange={(e) => handleFileUpload(e, "nic")}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-50"
                                    />
                                    {nicFile ? (
                                        <span className="text-primary-green text-[10px] break-all px-2">
                                            {nicFile.name}
                                        </span>
                                    ) : (
                                        <>
                                            <FaUpload className="text-primary-green/80" />
                                            <span className="opacity-50">
                                                Click to Upload<br />
                                                or Drag and Drop<br />
                                                PDF (Max 5MB)
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="w-full h-[135px] bg-border/50 rounded-[20px] text-[12px] p-[10px] text-text">
                                <span className="font-bold">Guide License<br /></span>
                                <span className="text-[10px] opacity-50">Upload your certificates</span>

                                <div
                                    className={`relative w-full h-[80px] border-2 border-dotted rounded-[20px] mt-1 flex flex-col justify-center items-center text-[10px] text-center ${
                                        licenseFile ? "border-primary-green" : "border-text/50"
                                    }`}
                                >
                                    <input
                                        type="file"
                                        accept="application/pdf, .pdf"
                                        onChange={(e) => handleFileUpload(e, "license")}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-50"
                                    />
                                    {licenseFile ? (
                                        <span className="text-primary-green text-[10px] break-all px-2">
                                            {licenseFile.name}
                                        </span>
                                    ) : (
                                        <>
                                            <FaUpload className="text-primary-green/80" />
                                            <span className="opacity-50">
                                                Click to Upload<br />
                                                or Drag and Drop<br />
                                                PDF (Max 5MB)
                                            </span>
                                        </>
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