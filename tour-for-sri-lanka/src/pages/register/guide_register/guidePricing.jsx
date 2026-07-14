import { useState, useRef } from "react";
import { FaCheck, FaCamera } from "react-icons/fa";
import { GrFormPreviousLink } from "react-icons/gr";
import Select from "react-select"
import { useNavigate, useLocation } from "react-router-dom";

const GUEST_OPTIONS = Array.from({ length: 10 }, (_, i) => `${i + 1}`)
const CURRENCY_OPTIONS = ["LKR", "USD", "EUR", "GBP"]

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

export default function GuidePricing() {
    const navigate = useNavigate()
    const location = useLocation()

    const [pricePerHour, setPricePerHour] = useState("")
    const [pricePerDay, setPricePerDay] = useState("")
    const [maximumGuests, setMaximumGuests] = useState(null)
    const [currency, setCurrency] = useState(null)

    const [profilePhoto, setProfilePhoto] = useState(location.state?.profilePhoto || null)
    const [profilePreview, setProfilePreview] = useState(null)

    const [err, setErr] = useState("")
    const [sendingOtp, setSendingOtp] = useState(false)

    const fileInputRef = useRef(null)

    const guestOptions = GUEST_OPTIONS.map((g) => ({ label: `${g} ${g === "1" ? "guest" : "guests"}`, value: g }))
    const currencyOptions = CURRENCY_OPTIONS.map((c) => ({ label: c, value: c }))

    const handleChangePhoto = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleRemovePhoto = () => {
        setProfilePhoto(null)
        if (profilePreview) {
            URL.revokeObjectURL(profilePreview)
            setProfilePreview(null)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setErr("Profile photo must be a JPG or PNG")
            e.target.value = ""
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            setErr("Profile photo must be less than 2MB")
            e.target.value = ""
            return
        }

        setErr("")
        setProfilePhoto(file)
        setProfilePreview(URL.createObjectURL(file))
    }

    const handlePrevious = () => {
        navigate(-1, { state: { nicFile: location.state?.nicFile, licenseFile: location.state?.licenseFile, profilePhoto } })
    }

    const handleSaveAndContinue = async () => {
        if (!pricePerHour || !pricePerDay || !maximumGuests || !currency || !profilePhoto) {
            setErr("Please fill all required fields")
            return
        }

        const stored = sessionStorage.getItem("GuideRegister")
        const data = stored ? JSON.parse(stored) : null

        if (!data?.email) {
            setErr("Email not found. Please fill account details again")
            return
        }

        const finalData = {
            ...data,
            pricePerHour,
            pricePerDay,
            maximumGuests: maximumGuests.value,
            currency: currency.value,
        }
        sessionStorage.setItem("GuideRegister", JSON.stringify(finalData))

        setErr("")
        setSendingOtp(true)

        try {
            const res = await fetch("http://localhost:3000/api/guide/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email })
            })

            const result = await res.json()

            if (!res.ok) {
                setErr(result.error || "Failed to send OTP")
                setSendingOtp(false)
                return
            }

            navigate("/verify-otp-guide", {
                state: {
                    nicFile: location.state?.nicFile,
                    licenseFile: location.state?.licenseFile,
                    profilePhoto
                }
            })
        } catch (error) {
            setErr(error.message || "Failed to send OTP")
        }
        setSendingOtp(false)
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
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck /></span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Professional Info</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[80px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
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

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <input
                        placeholder="Price Per Hour"
                        value={pricePerHour}
                        onChange={(e) => setPricePerHour(e.target.value.replace(/[^0-9.]/g, ""))}
                        className="w-[220px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                    />
                    <input
                        placeholder="Price Per Day"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value.replace(/[^0-9.]/g, ""))}
                        className="w-[220px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                    />
                </div>

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={guestOptions}
                            value={maximumGuests}
                            onChange={setMaximumGuests}
                            placeholder="Maximum Guests"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={currencyOptions}
                            value={currency}
                            onChange={setCurrency}
                            placeholder="Currency"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                </div>

                <div className="w-[465px] flex text-[12px] text-[#CCD0CF] mt-[25px] items-center justify-between">
                    <div>
                        <span className="font-bold mb-[10px]">Profile picture<br /></span>
                        <span className="text-[10px] opacity-[0.5] mb-[10px]">Upload a clear photo<br />of yourself<br /></span>
                        <span className="text-[10px] opacity-[0.5]">JPG,PNG format<br />Max size 2MB</span>
                    </div>
                    <div className="relative w-[140px] h-[140px] rounded-full bg-[#4A5C6A]/50 border-2 border-[#CCD0CF]/50 border-dotted flex flex-col justify-center items-center text-center text-[#CCD0CF] overflow-hidden">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-50"
                        />
                        {profilePhoto ? (
                            <img
                                src={profilePreview}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <FaCamera className="text-[#00C896]/80 text-[20px]" />
                                <span className="text-[10px] opacity-[0.5]">Drag & Drop your photo<br />or</span>
                                <span className="text-[10px] text-[#00C896]/80">Browse Files</span>
                            </>
                        )}
                    </div>
                    <div>
                        <div onClick={handleChangePhoto} className="w-[100px] h-[30px] bg-[#4A5C6A]/50 mb-[10px] text-[12px] rounded-[20px] flex items-center justify-center text-[#CCD0CF] cursor-pointer">
                            <span>Change Photo</span>
                        </div>
                        <div onClick={handleRemovePhoto} className="w-[100px] h-[30px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] flex items-center justify-center text-[#CCD0CF] cursor-pointer">
                            <span>Remove Photo</span>
                        </div>
                    </div>
                </div>

                <div className="mt-[25px] w-[465px] flex justify-between">
                    <button onClick={handlePrevious} className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95">
                        <GrFormPreviousLink className="font-bold text-[20px]" />Previous
                    </button>
                    <button onClick={handleSaveAndContinue} disabled={sendingOtp} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">
                        {sendingOtp ? "Sending OTP..." : "Save & Continue"}
                    </button>
                </div>
            </div>
        </div>
    )
}
