import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa6";
import {
    FaCheck, FaWifi, FaParking, FaSwimmer, FaSnowflake, FaSpa,
    FaPaw, FaDumbbell, FaCocktail, FaTv, FaBath, FaTimes,
} from "react-icons/fa";

const CUSTOM_FACILITY_MAX_LENGTH = 10

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
]

export default function HotelFacilities() {
    const navigate = useNavigate()

    const [facilities, setFacilities] = useState([])
    const [customFacilities, setCustomFacilities] = useState([])
    const [customInput, setCustomInput] = useState("")

    const [photos, setPhotos] = useState([])

    const [err, setErr] = useState("")

    useEffect(() => {
        const saved = sessionStorage.getItem("HotelOwnerRegister")
        if (saved) {
            const data = JSON.parse(saved)

            setFacilities(data.facilities || [])
            setCustomFacilities(data.otherFacilities || [])

            if (data.images && data.images.length > 0) {
                setPhotos(
                    data.images.map((url) => ({
                        name: url.split("/").pop(),
                        url,
                        uploading: false
                    }))
                )
            }
        }
    }, [])

    const toggleFacility = (key) => {
        setFacilities((prev) =>
            prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
        )
    }

    const handleAddCustomFacility = () => {
        const value = customInput.trim().slice(0, CUSTOM_FACILITY_MAX_LENGTH)
        if (!value || customFacilities.includes(value)) {
            setCustomInput("")
            return
        }
        setCustomFacilities((prev) => [...prev, value])
        setCustomInput("")
    }

    const handleCustomKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddCustomFacility()
        }
    }

    const handleRemoveCustomFacility = (value) => {
        setCustomFacilities((prev) => prev.filter((f) => f !== value))
    }

    const handlePhotoChange = async (e) => {
        const files = Array.from(e.target.files || [])

        const newFiles = files.filter((file) => {
            return !photos.some((photo) => photo.name === file.name)
        })
        if (newFiles.length !== files.length) {
            setErr("This photo has already been selected")
            e.target.value = ""
            return
        }
        if (photos.length + newFiles.length > 5) {
            setErr("You can upload a maximum of 5 photos")
            e.target.value = ""
            return
        }
        setErr("")
        e.target.value = ""

        for (const file of newFiles) {
            const tempEntry = { name: file.name, url: null, uploading: true }
            setPhotos((prev) => [...prev, tempEntry])

            try {
                const uploadFormData = new FormData()
                uploadFormData.append("photo", file)

                const res = await fetch("http://localhost:3000/api/hotel/upload-photo", {
                    method: "POST",
                    body: uploadFormData
                })
                const result = await res.json()

                if (!res.ok) {
                    setErr(result.error || "Photo upload failed")
                    setPhotos((prev) => prev.filter((p) => p.name !== file.name))
                    continue
                }
                setPhotos((prev) =>
                    prev.map((p) =>
                        p.name === file.name ? { ...p, url: result.url, uploading: false } : p
                    )
                )
            } catch (error) {
                setErr("Photo upload failed, please try again later")
                setPhotos((prev) => prev.filter((p) => p.name !== file.name))
            }
        }
    }

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index))
        setErr("")
    }

    const buildFormData = () => {
        const oldData = JSON.parse(sessionStorage.getItem("HotelOwnerRegister")) || {}
        return {
            ...oldData,
            facilities,
            otherFacilities: customFacilities,
            images: photos.filter(p => p.url).map(p => p.url),
        }
    }

    const handlePrevious = () => {
        sessionStorage.setItem("HotelOwnerRegister", JSON.stringify(buildFormData()))
        navigate(-1)
    }

    const handleNext = () => {
        if (photos.some(p => p.uploading)) {
            setErr("Please wait, photos are still uploading")
            return
        }
        setErr("")
        sessionStorage.setItem("HotelOwnerRegister", JSON.stringify(buildFormData()))
        navigate("/hotelverification")
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
                    <div className="flex flex-col items-center w-[110px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck /></span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center leading-4">Hotel information</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[80px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]">3</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Facilities</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[90px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#4A5C6A]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]">4</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Verification</span>
                    </div>
                </div>
            </div>

            <div className="w-[500px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center pb-[20px]">
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as Hotel Owner</h1>
                {err && (
                    <div className="text-[#9E4444] text-[12px] mt-[5px]">
                        {err}
                    </div>
                )}

                <div className="w-[465px] mt-[15px] text-[14px] font-bold self-start ml-[17px]">
                    Facilities &amp; Services
                </div>

                <div className="w-[465px] mt-[10px] grid grid-cols-4 gap-[10px]">
                    {FACILITY_OPTIONS.map(({ key, label, icon: Icon }) => {
                        const selected = facilities.includes(key)
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleFacility(key)}
                                className={`relative h-[65px] rounded-[15px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold px-[6px] text-center transition-all duration-200 cursor-pointer ${
                                    selected
                                        ? "bg-[#00C896]/20 border-2 border-[#00C896] text-[#CCD0CF]"
                                        : "bg-[#4A5C6A]/50 border-2 border-transparent text-[#CCD0CF]"
                                }`}
                            >
                                {selected && (
                                    <span className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-[#00C896] flex items-center justify-center text-[#06141B] text-[9px]">
                                        <FaCheck />
                                    </span>
                                )}
                                <Icon className="text-[#00C896] text-[16px]" />
                                <span className="leading-[13px]">{label}</span>
                            </button>
                        )
                    })}
                    {customFacilities.map((label) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => handleRemoveCustomFacility(label)}
                            title="Click to remove"
                            className="relative h-[65px] rounded-[15px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold px-[6px] text-center bg-[#00C896]/20 border-2 border-[#00C896] text-[#CCD0CF] transition-all duration-200 cursor-pointer"
                        >
                            <span className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-[#00C896] flex items-center justify-center text-[#06141B] text-[9px]">
                                <FaTimes />
                            </span>
                            <span className="leading-[13px] break-words">{label}</span>
                        </button>
                    ))}
                </div>

                <div className="w-[465px] mt-[20px] text-[14px] font-bold self-start ml-[17px]">
                    Other Available Facility
                </div>

                <div className="w-[465px] mt-[10px] relative">
                    <input
                        type="text"
                        placeholder="Type a facility and press Enter...."
                        value={customInput}
                        maxLength={CUSTOM_FACILITY_MAX_LENGTH}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={handleCustomKeyDown}
                        className="w-full h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pr-[60px]"
                    />
                    <span className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[10px] text-[#CCD0CF]/50">
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
                <label htmlFor="hotelPhotos" className="w-[465px] h-[150px] bg-[#4A5C6A]/50 rounded-[20px] mt-[20px] p-[10px] flex flex-col cursor-pointer">
                    <span className="text-[12px] font-bold text-[#CCD0CF]">Add Hotel Photos</span>
                    <span className="text-[12px] text-[#CCD0CF]/80">Upload Your Photos</span>
                    <div className="w-full h-full p-[10px] flex">
                        <div className="w-full h-full rounded-[10px] border-2 border-dotted border-[#CCD0CF]/50 p-2">
                            {photos.length === 0 ? (
                                <div className="w-full h-full flex flex-col justify-center items-center">
                                    <FaUpload className="text-[#00C896]/80 text-2xl" />
                                    <span className="text-[10px] text-[#CCD0CF]/50 text-center">
                                        Click to Upload <br />
                                        or Drag and Drop <br />
                                        JPG or PNG (Max 5MB)
                                    </span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-5 gap-2 h-full">
                                    {photos.map((photo, index) => (
                                        <div key={index} className="relative w-[65px] h-[65px]">
                                            {photo.uploading ? (
                                                <div className="w-[65px] h-[65px] rounded-lg bg-[#4A5C6A] flex items-center justify-center text-[8px] text-[#CCD0CF]/80">
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
                                                    e.preventDefault()
                                                    removePhoto(index)
                                                }}
                                                className="absolute bottom-[50px] left-[50px] w-[20px] h-[20px] rounded-full bg-[#4A5C6A] hover:bg-[#9E4444] hover:text-[#CCD0CF]/80 text-[#CCD0CF]/50 text-[12px] flex items-center justify-center transition-all duration-300"
                                            >x</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </label>

                <div className="mt-[20px] w-[465px] flex justify-between">
                    <button onClick={handlePrevious} className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95 cursor-pointer">
                        <GrFormPreviousLink className="font-bold text-[20px]" />Previous
                    </button>
                    <button onClick={handleNext} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                        Next <GrFormNextLink className="font-bold text-[20px]" />
                    </button>
                </div>
            </div>
        </div>
    )
}