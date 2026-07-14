import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GrFormPreviousLink } from "react-icons/gr";

const SKILL_KEYS = [
    "CulturalTours", "AdventureTours", "WildLifeTours", "Hiking", "SurfingGuide",
    "FoodTours", "PhotographyTours", "HistoricalTours", "CityTours", "NatureGuide"
]
const LANGUAGE_KEYS = ["english", "sinhala", "tamil", "spanish", "japan", "chaina", "korean"]

export default function VerifyOtpGuide() {
    const [otp, setOtp] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const [resendMsg, setResendMsg] = useState("")

    const navigate = useNavigate()
    const location = useLocation()

    const { nicFile, licenseFile, profilePhoto } = location.state || {}

    const stored = sessionStorage.getItem("GuideRegister")
    const data = stored ? JSON.parse(stored) : null
    const email = data?.email

    const buildSkillObject = (selectedKeys = []) => {
        const skillObj = {}
        SKILL_KEYS.forEach((key) => {
            skillObj[key] = selectedKeys.includes(key)
        })
        return skillObj
    }

    const buildLanguageObject = (selectedKeys = []) => {
        const langObj = {}
        LANGUAGE_KEYS.forEach((key) => {
            langObj[key] = selectedKeys.includes(key)
        })
        return langObj
    }

    const handleVerify = async () => {
        if (!data || !email) {
            setErr("Session expired. Please sign up again.")
            return
        }
        if (otp.length !== 6) {
            setErr("Please enter the 6-digit OTP")
            return
        }

        setLoading(true)
        setErr("")
        try {
            const formData = new FormData()

            formData.append("role", data.role ?? "")
            formData.append("firstName", data.firstName ?? "")
            formData.append("lastName", data.lastName ?? "")
            formData.append("email", data.email ?? "")
            formData.append("password", data.password ?? "")
            formData.append("country", data.country ?? "")
            formData.append("mobile", data.mobile ?? "")
            formData.append("dateOfBirth", data.dateOfBirth ?? "")
            formData.append("address", data.address ?? "")
            formData.append("gender", data.gender ?? "")
            formData.append("maritalStatus", data.maritalStatus ?? "")
            formData.append("nationality", data.nationality ?? "")
            formData.append("province", data.province ?? "")
            formData.append("NIC", data.NIC ?? "")
            formData.append("district", data.district ?? "")
            formData.append("aboutYourSelf", data.aboutYourSelf ?? "")
            formData.append("yearsOfExperience", data.yearsExperience ?? "")
            formData.append("GuideLicenseNumber", data.licenseNumber ?? "")
            formData.append("additionalFields", data.additionalFields ?? "")
            formData.append("pricePerHour", data.pricePerHour ?? "")
            formData.append("pricePerDay", data.pricePerDay ?? "")
            formData.append("maximumGuests", data.maximumGuests ?? "")
            formData.append("currency", data.currency ?? "")

            formData.append("skill", JSON.stringify(buildSkillObject(data.skills)))
            formData.append("languages", JSON.stringify(buildLanguageObject(data.languages)))

            nicFile && formData.append("NICfile", nicFile)
            licenseFile && formData.append("guiedLicense", licenseFile)
            profilePhoto && formData.append("profilePic", profilePhoto)

            formData.append("otp", otp)

            const response = await fetch("http://localhost:3000/api/guide", {
                method: "POST",
                body: formData
            })
            const result = await response.json()

            if (!response.ok) {
                setErr(result.error || "Verification failed")
                setLoading(false)
                return
            }

            localStorage.setItem("token", result.token)
            sessionStorage.removeItem("GuideRegister")
            navigate("/login")
        } catch (error) {
            setErr("Something went wrong. Please try again")
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email) return
        setResendMsg("")
        setErr("")
        try {
            const response = await fetch("http://localhost:3000/api/guide/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            const result = await response.json()

            if (!response.ok) {
                setErr(result.error || "Failed to resend OTP")
                return
            }
            setResendMsg("A new OTP has been sent to your email")
        } catch (error) {
            setErr("Failed to resend OTP")
        }
    }

    const handlePrevious = () => {
        navigate(-1)
    }

    return (
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png" />
            </div>

            <div className="absolute right-[10%] w-[450px] bg-[#253745] text-[#CCD0CF] rounded-[20px] flex flex-col items-center p-[30px]">
                <h1 className="text-[25px] font-bold text-[#CCD0CF] text-center">Verify your email</h1>

                <p className="text-[12px] text-[#CCD0CF]/70 mt-[10px] text-center">
                    We sent a 6-digit code to <span className="font-bold">{email}</span>
                </p>

                {err && <div className="text-[12px] text-[#9E4444] mt-[10px]">{err}</div>}
                {resendMsg && <div className="text-[12px] text-[#00C896] mt-[10px]">{resendMsg}</div>}

                <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter OTP"
                    className="w-full mt-[20px] text-center tracking-[10px] text-[20px] rounded-[10px] bg-[#4A5C6A]/50 border border-[#4A5C6A]/50 focus:border-[#00C896]/80 outline-none p-[10px] text-[#CCD0CF]"
                />

                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="text-[18px] font-bold w-full h-[50px] flex justify-center items-center rounded-[20px] bg-[#00C896]/50 hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105 mt-[20px] disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "Verify"}
                </button>

                <button
                    onClick={handleResend}
                    className="text-[12px] text-[#CCD0CF]/70 hover:text-[#00C896]/80 mt-[15px] underline"
                >
                    Resend OTP
                </button>

                <button
                    onClick={handlePrevious}
                    className="w-full h-[50px] flex justify-center items-center rounded-[20px] bg-[#4A5C6A]/50 hover:bg-[#4A5C6A]/80 transition-all duration-300 mt-[15px] hover:scale-95 text-[18px] font-bold"
                >
                    <GrFormPreviousLink />Previous
                </button>
            </div>
        </div>
    )
}
