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
        <div className="w-full min-h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-16 lg:gap-24 px-4 sm:px-6 py-10 md:py-12">

            <img
                src="/main_logo.png"
                alt="main_logo"
                className="w-[100px] sm:w-[150px] md:w-[220px] lg:w-[360px] xl:w-[480px] 2xl:w-[600px] shrink-0 transition-transform duration-300"
            />

            <div className="w-full max-w-[450px] bg-[#253745] text-[#CCD0CF] rounded-[20px] flex flex-col items-center p-[20px] sm:p-[30px]">

                <h1 className="text-[20px] sm:text-[25px] font-bold text-[#CCD0CF] text-center">Verify your email</h1>

                <p className="text-[12px] text-[#CCD0CF]/70 mt-[10px] text-center">
                    We sent a 6-digit code to <span className="font-bold">{email}</span>
                </p>

                {err && <div className="text-[12px] text-[#9E4444] mt-[10px] text-center">{err}</div>}
                {resendMsg && <div className="text-[12px] text-[#00C896] mt-[10px] text-center">{resendMsg}</div>}

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
                    className="text-[18px] font-bold w-full h-[50px] flex justify-center items-center rounded-[20px] bg-[#00C896]/50 hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105 mt-[20px] disabled:opacity-50 cursor-pointer"
                >
                    {loading ? "Verifying..." : "Verify"}
                </button>

                <button
                    onClick={handleResend}
                    className="text-[12px] text-[#CCD0CF]/70 hover:text-[#00C896]/80 mt-[15px] underline cursor-pointer"
                >
                    Resend OTP
                </button>

                <button
                    onClick={handlePrevious}
                    className="w-full h-[50px] flex justify-center items-center gap-1 rounded-[20px] bg-[#4A5C6A]/50 hover:bg-[#4A5C6A]/80 transition-all duration-300 mt-[15px] hover:scale-95 text-[18px] font-bold cursor-pointer"
                >
                    <GrFormPreviousLink/>Previous
                </button>
            </div>
        </div>
    )
}