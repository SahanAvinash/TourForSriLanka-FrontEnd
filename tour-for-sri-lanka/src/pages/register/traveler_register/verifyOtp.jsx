import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GrFormPreviousLink } from "react-icons/gr";

export default function VerifyOtp(){
    const [otp, setOtp] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const [resendMsg, setResendMsg] = useState("")

    const navigate = useNavigate()
    const location = useLocation()

    const photoFile = location.state?.photoFile
    const saved = JSON.parse(sessionStorage.getItem("TravelerRegister")) || {}
    const email = saved.email

    const handleVerify = async () => {
        if(!email){
            setErr("Session expired. Please sign up again.")
            return
        }
        if(otp.length !== 6){
            setErr("Please enter the 6-digit OTP")
            return
        }

        setLoading(true)
        setErr("")
        try{
            const formData = new FormData()
            formData.append("role", saved.role)
            formData.append("firstName", saved.firstName)
            formData.append("lastName", saved.lastName)
            formData.append("email", saved.email)
            formData.append("password", saved.password)
            formData.append("NIC", saved.NIC)
            formData.append("country", saved.country)
            formData.append("mobile", saved.mobile)
            formData.append("otp", otp)

            if(photoFile){
                formData.append("image", photoFile)
            }

            const response = await fetch("http://localhost:3000/api/traveler/register", {
                method: "POST",
                body: formData
            })
            const data = await response.json()

            if(!response.ok){
                setErr(data.error || "Verification failed")
                setLoading(false)
                return
            }

            localStorage.setItem("token", data.token)
            sessionStorage.removeItem("TravelerRegister")
            navigate("/login")
        }catch(error){
            setErr("Something went wrong. Please try again")
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if(!email) return
        setResendMsg("")
        setErr("")
        try{
            const response = await fetch("http://localhost:3000/api/traveler/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            const data = await response.json()

            if(!response.ok){
                setErr(data.error || "Failed to resend OTP")
                return
            }
            setResendMsg("A new OTP has been sent to your email")
        }catch(error){
            setErr("Failed to resend OTP")
        }
    }

    const handlePrevious = () => {
        navigate(-1)
    }

    return(
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png"/>
            </div>

            <div className="w-[450px] bg-[#253745] text-[#CCD0CF] rounded-[20px] flex flex-col items-center p-[30px] absolute right-[10%]">

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
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g,""))}
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
                    <GrFormPreviousLink/>Previous
                </button>
            </div>
        </div>
    )
}