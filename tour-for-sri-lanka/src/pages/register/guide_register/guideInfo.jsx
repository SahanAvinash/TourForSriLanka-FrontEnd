import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useState } from "react";
import Select from "react-select"
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import COUNTRIES from "../../../data/countryCode";

const GENDER_OPTIONS = ["Male", "Female", "Other"]
const MARITAL_OPTIONS = ["Single", "Married", "Divorced", "Widowed"]
const PROVINCE_OPTIONS = [
    "Western", "Central", "Southern", "Northern", "Eastern",
    "North Western", "North Central", "Uva", "Sabaragamuwa"
]
const DISTRICT_OPTIONS = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
    "Monaragala", "Ratnapura", "Kegalle"
]

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

export default function GuideInformation() {
    const navigate = useNavigate()

    const [dateOfBirth, setDateOfBirth] = useState("")
    const [address, setAddress] = useState("")
    const [gender, setGender] = useState(null)
    const [maritalStatus, setMaritalStatus] = useState(null)
    const [nationality, setNationality] = useState(null)
    const [province, setProvince] = useState(null)
    const [NIC, setNIC] = useState("")
    const [district, setDistrict] = useState(null)
    const [aboutYourSelf, setAboutYourSelf] = useState("")

    const [err, setErr] = useState("")

    const genderOptions = GENDER_OPTIONS.map((g) => ({ label: g, value: g }))
    const maritalOptions = MARITAL_OPTIONS.map((m) => ({ label: m, value: m }))
    const nationalityOptions = COUNTRIES.map((c) => ({ label: `${c.flag} ${c.name}`, value: c.name }))
    const provinceOptions = PROVINCE_OPTIONS.map((p) => ({ label: p, value: p }))
    const districtOptions = DISTRICT_OPTIONS.map((d) => ({ label: d, value: d }))

    useEffect(() => {
        const saved = sessionStorage.getItem("GuideRegister")
        if (saved) {
            const data = JSON.parse(saved)

            setDateOfBirth(data.dateOfBirth || "")
            setAddress(data.address || "")
            setNIC(data.NIC || "")
            setAboutYourSelf(data.aboutYourSelf || "")

            if (data.gender) {
                setGender({ label: data.gender, value: data.gender })
            }
            if (data.maritalStatus) {
                setMaritalStatus({ label: data.maritalStatus, value: data.maritalStatus })
            }
            if (data.nationality) {
                const found = COUNTRIES.find((c) => c.name === data.nationality)
                setNationality(found ? { label: `${found.flag} ${found.name}`, value: found.name } : null)
            }
            if (data.province) {
                setProvince({ label: data.province, value: data.province })
            }
            if (data.district) {
                setDistrict({ label: data.district, value: data.district })
            }
        }
    }, [])

    const buildFormData = () => {
        const oldData = JSON.parse(sessionStorage.getItem("GuideRegister")) || {}
        return {
            ...oldData,
            dateOfBirth,
            address,
            gender: gender?.value,
            maritalStatus: maritalStatus?.value,
            nationality: nationality?.value,
            province: province?.value,
            NIC,
            district: district?.value,
            aboutYourSelf,
        }
    }

    const handlePrevious = () => {
        sessionStorage.setItem("GuideRegister", JSON.stringify(buildFormData()))
        navigate(-1)
    }

    const handleNext = () => {
        if (!dateOfBirth || !address || !gender || !maritalStatus || !nationality || !province || !NIC || !district) {
            setErr("Please fill all required fields")
            return;
        }

        setErr("")
        sessionStorage.setItem("GuideRegister", JSON.stringify(buildFormData()))
        navigate("/guidelanguageskills")
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
                            <span className="text-[#CCD0CF] text-[12px]">2</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center leading-4">Personal Info</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[70px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#4A5C6A]/80 flex items-center justify-center">
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
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as a Guide</h1>
                {err && (
                    <div className="text-[#9E4444] text-[12px] mt-[5px]">
                        {err}
                    </div>
                )}

                <div className="w-[465px] mt-[15px] relative">
                    <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className={`w-full h-[50px] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pr-[45px] [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 ${dateOfBirth ? "text-[#CCD0CF]" : "text-transparent"}`}
                    />
                    <FaRegCalendarAlt className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[#00C896]/70 pointer-events-none" />
                    {!dateOfBirth && (
                        <span className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[12px] text-[#CCD0CF]/50 pointer-events-none">
                            Date of Birth
                        </span>
                    )}
                </div>

                <input
                    placeholder="Home Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-[465px] h-[50px] mt-[15px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                />

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={genderOptions}
                            value={gender}
                            onChange={setGender}
                            placeholder="Gender"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={maritalOptions}
                            value={maritalStatus}
                            onChange={setMaritalStatus}
                            placeholder="Marital Status"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                </div>

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={nationalityOptions}
                            value={nationality}
                            onChange={setNationality}
                            placeholder="Nationality"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={provinceOptions}
                            value={province}
                            onChange={setProvince}
                            placeholder="Province"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                </div>

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <input
                        placeholder="NIC"
                        value={NIC}
                        onChange={(e) => setNIC(e.target.value)}
                        className="w-[220px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                    />
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={districtOptions}
                            value={district}
                            onChange={setDistrict}
                            placeholder="District"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                </div>

                <div className="w-[465px] mt-[15px] relative">
                    <textarea
                        placeholder="About Your Self"
                        value={aboutYourSelf}
                        maxLength={100}
                        onChange={(e) => setAboutYourSelf(e.target.value)}
                        className="w-full h-[80px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pt-[15px] pr-[20px] resize-none"
                    />
                    <span className="absolute right-[20px] bottom-[10px] text-[10px] text-[#CCD0CF]/50">
                        {aboutYourSelf.length}/100
                    </span>
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
