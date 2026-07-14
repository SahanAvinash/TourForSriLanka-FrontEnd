import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useState } from "react";
import Select from "react-select"
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheck, FaUpload } from "react-icons/fa";

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
]
const LANGUAGE_OPTIONS = [
    { label: "English", value: "english" },
    { label: "Sinhala", value: "sinhala" },
    { label: "Tamil", value: "tamil" },
    { label: "Spanish", value: "spanish" },
    { label: "Japanese", value: "japan" },
    { label: "Chinese", value: "chaina" },
    { label: "Korean", value: "korean" },
]
const YEARS_OPTIONS = Array.from({ length: 20 }, (_, i) => `${i + 1}`)

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "50px",
        borderRadius: "20px",
        backgroundColor: "#4A5C6A80",
        border: "none",
        boxShadow: "none",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
        color: "#CCD0CF",
        cursor: "pointer",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "#4A5C6A",
    }),
    singleValue: (base) => ({
        ...base,
        color: "#CCD0CF",
        paddingLeft: "10px"
    }),
    placeholder: (base) => ({
        ...base,
        color: "#CCD0CF",
        opacity: 0.5,
        paddingLeft: "10px"
    }),
    input: (base) => ({
        ...base,
        color: "#CCD0CF",
    }),
}

const multiSelectStyles = {
    ...selectStyles,
    control: (base) => ({
        ...base,
        height: "50px",
        minHeight: "50px",
        maxHeight: "50px",
        borderRadius: "20px",
        backgroundColor: "#4A5C6A80",
        border: "none",
        boxShadow: "none",
        overflow: "hidden",
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: "#00C89680",
        borderRadius: "10px",
        flexShrink: 0,
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: "#06141B",
        fontWeight: "bold",
        whiteSpace: "nowrap",
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: "#06141B",
        borderRadius: "0 10px 10px 0",
        ':hover': { backgroundColor: "#00C896", color: "#06141B" },
    }),
    valueContainer: (base) => ({
        ...base,
        paddingLeft: "10px",
        gap: "4px",
        flexWrap: "nowrap",
        overflowX: "auto",
        height: "50px",
        scrollbarWidth: "thin",
        scrollbarColor: "#00C896 transparent",
    }),
    indicatorsContainer: (base) => ({
        ...base,
        height: "50px",
    }),
}

export default function GuideLanguageSkills() {
    const navigate = useNavigate()
    const location = useLocation()

    const [yearsExperience, setYearsExperience] = useState(null)
    const [licenseNumber, setLicenseNumber] = useState("")
    const [skills, setSkills] = useState([])
    const [languages, setLanguages] = useState([])
    const [additionalFields, setAdditionalFields] = useState("")

    const [nicFile, setNicFile] = useState(location.state?.nicFile || null)
    const [licenseFile, setLicenseFile] = useState(location.state?.licenseFile || null)

    const [err, setErr] = useState("")

    const yearsOptions = YEARS_OPTIONS.map((y) => ({ label: `${y} ${y === "1" ? "year" : "years"}`, value: y }))
    const skillOptions = SKILL_OPTIONS
    const languageOptions = LANGUAGE_OPTIONS

    useEffect(() => {
        const saved = sessionStorage.getItem("GuideRegister")
        if (saved) {
            const data = JSON.parse(saved)

            setLicenseNumber(data.licenseNumber || "")
            setAdditionalFields(data.additionalFields || "")

            if (data.yearsExperience) {
                setYearsExperience({ label: `${data.yearsExperience} ${data.yearsExperience === "1" ? "year" : "years"}`, value: data.yearsExperience })
            }
            if (data.skills?.length) {
                setSkills(SKILL_OPTIONS.filter((opt) => data.skills.includes(opt.value)))
            }
            if (data.languages?.length) {
                setLanguages(LANGUAGE_OPTIONS.filter((opt) => data.languages.includes(opt.value)))
            }
        }
    }, [])

    const isValidFileType = (file) => file.type === "application/pdf"

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        if (!isValidFileType(file)) {
            setErr(`${type === "nic" ? "NIC or Passport" : "Guide License"} must be uploaded as a PDF`)
            e.target.value = ""
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setErr(`${type === "nic" ? "NIC or Passport" : "Guide License"} must be less than 5MB`)
            e.target.value = ""
            return
        }

        setErr("")
        if (type === "nic") setNicFile(file)
        if (type === "license") setLicenseFile(file)
    }

    const buildFormData = () => {
        const oldData = JSON.parse(sessionStorage.getItem("GuideRegister")) || {}
        return {
            ...oldData,
            yearsExperience: yearsExperience?.value,
            licenseNumber,
            skills: skills.map((s) => s.value),
            languages: languages.map((l) => l.value),
            additionalFields,
        }
    }

    const handlePrevious = () => {
        sessionStorage.setItem("GuideRegister", JSON.stringify(buildFormData()))
        navigate(-1, { state: { nicFile, licenseFile } })
    }

    const handleNext = () => {
        if (!yearsExperience || !licenseNumber || !skills.length || !languages.length || !nicFile || !licenseFile) {
            setErr("Please fill all required fields")
            return;
        }

        setErr("")
        sessionStorage.setItem("GuideRegister", JSON.stringify(buildFormData()))
        navigate("/guidepricing", { state: { nicFile, licenseFile } })
    }

    return (
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png" />
            </div>
            <div className="h-full absolute left-[50px] top-[50px] w-[40%]">
                <div className="flex items-start">
                    <div className="flex flex-col items-center w-[70px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck /></span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Account</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[95px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck /></span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center leading-4">Personal Info</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[70px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]">3</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Language & Skils</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[80px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#4A5C6A]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]">4</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Pricing</span>
                    </div>
                </div>
            </div>

            <div className="w-[500px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center pb-[20px]">
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as Guide</h1>
                {err && (
                    <div className="text-[#9E4444] text-[12px] mt-[5px]">
                        {err}
                    </div>
                )}

                <div className="w-[465px] mt-[15px] text-[12px]">
                    <Select
                        options={yearsOptions}
                        value={yearsExperience}
                        onChange={setYearsExperience}
                        placeholder="Years of Experience"
                        menuPosition="fixed"
                        styles={selectStyles}
                    />
                </div>

                <input
                    placeholder="Guide License Number"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-[465px] h-[50px] mt-[15px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                />

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={skillOptions}
                            value={skills}
                            onChange={setSkills}
                            placeholder="Skills"
                            isMulti
                            menuPosition="fixed"
                            styles={multiSelectStyles}
                        />
                    </div>
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={languageOptions}
                            value={languages}
                            onChange={setLanguages}
                            placeholder="Languages"
                            isMulti
                            menuPosition="fixed"
                            styles={multiSelectStyles}
                        />
                    </div>
                </div>

                <div className="w-[465px] mt-[15px] relative">
                    <textarea
                        placeholder="Additional Fields"
                        value={additionalFields}
                        maxLength={100}
                        onChange={(e) => setAdditionalFields(e.target.value)}
                        className="w-full h-[70px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pt-[15px] pr-[20px] resize-none"
                    />
                    <span className="absolute right-[20px] bottom-[10px] text-[10px] text-[#CCD0CF]/50">
                        {additionalFields.length}/100
                    </span>
                </div>

                <div className="flex justify-between w-[465px] mt-[15px]">
                    <div className="w-[220px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                        <span className="font-bold">NIC or Passport<br/></span>
                        <span className="text-[10px] opacity-[0.5]">Upload your certificates</span>
                        <div className="relative w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center"
                            style={{
                                borderColor: nicFile ? "#00C896" : "#CCD0CF/50"
                            }}
                        >
                            <input
                                type="file"
                                accept="application/pdf, .pdf"
                                onChange={(e) => handleFileUpload(e, "nic")}
                                className="absolute inset-0 opacity-0 cursor-pointer z-50"
                            />
                            {nicFile ? (
                                <span className="text-[#00C896] text-[10px] break-all px-2">
                                    {nicFile.name}
                                </span>
                            ) : (
                                <>
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">
                                        Click to Upload<br/>
                                        or Drag and Drop<br/>
                                        PDF (Max 5MB)
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="w-[220px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                        <span className="font-bold">Guide License<br/></span>
                        <span className="text-[10px] opacity-[0.5]">Upload your certificates</span>
                        <div className="relative w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center"
                            style={{
                                borderColor: licenseFile ? "#00C896" : "#CCD0CF/50"
                            }}
                        >
                            <input
                                type="file"
                                accept="application/pdf, .pdf"
                                onChange={(e) => handleFileUpload(e, "license")}
                                className="absolute inset-0 opacity-0 cursor-pointer z-50"
                            />
                            {licenseFile ? (
                                <span className="text-[#00C896] text-[10px] break-all px-2">
                                    {licenseFile.name}
                                </span>
                            ) : (
                                <>
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">
                                        Click to Upload<br/>
                                        or Drag and Drop<br/>
                                        PDF (Max 5MB)
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-[20px] w-[465px] flex justify-between">
                    <button onClick={handlePrevious} className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95">
                        <GrFormPreviousLink className="font-bold text-[20px]" />Previous
                    </button>
                    <button onClick={handleNext} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">
                        Next <GrFormNextLink className="font-bold text-[20px]" />
                    </button>
                </div>
            </div>
        </div>
    )
}
