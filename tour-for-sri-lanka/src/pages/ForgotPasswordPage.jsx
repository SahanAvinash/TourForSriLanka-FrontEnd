import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { MdEmail, MdLock } from "react-icons/md"

export default function ForgotPasswordPage(){
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [resetToken, setResetToken] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    function handleSendOtp(e){
        e.preventDefault()
        setLoading(true)
        axios.post("http://localhost:3000/api/password-reset/send-otp", { email })
            .then(() => {
                toast.success("OTP sent to your email")
                setStep(2)
            })
            .catch((err) => toast.error(err.response?.data?.error || "Something went wrong"))
            .finally(() => setLoading(false))
    }

    function handleVerifyOtp(e){
        e.preventDefault()
        setLoading(true)
        axios.post("http://localhost:3000/api/password-reset/verify-otp", { email, otp })
            .then((res) => {
                toast.success("OTP verified")
                setResetToken(res.data.resetToken)
                setStep(3)
            })
            .catch((err) => toast.error(err.response?.data?.error || "Invalid OTP"))
            .finally(() => setLoading(false))
    }

    function handleResetPassword(e){
        e.preventDefault()
        if(newPassword !== confirmPassword){
            toast.error("Passwords do not match")
            return
        }
        setLoading(true)
        axios.post("http://localhost:3000/api/password-reset/reset-password", { resetToken, newPassword })
            .then(() => {
                toast.success("Password reset successful, please login")
                navigate("/login")
            })
            .catch((err) => toast.error(err.response?.data?.error || "Failed to reset password"))
            .finally(() => setLoading(false))
    }

    return (
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center">
            <div className="w-[450px] bg-[#253745] text-[#CCD0CF] rounded-[20px] flex flex-col items-center py-[30px]">

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="w-full flex flex-col items-center">
                        <h1 className="text-[22px] font-bold">Forgot Password</h1>
                        <span className="text-[12px] mt-[5px] px-[30px] text-center">Enter your email and we'll send you an OTP to reset your password.</span>
                        <div className="group relative flex items-center mt-[20px]">
                            <MdEmail className="ml-[20px] text-[#00C896] absolute opacity-[50%]"/>
                            <input type="email" required placeholder="E-Mail" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-[12px] w-[350px] h-[50px] bg-[#4A5C6A] rounded-[20px] pl-[50px]"/>
                        </div>
                        <button disabled={loading} className="w-[350px] h-[50px] bg-[#00C896]/50 rounded-[20px] mt-[20px] font-bold hover:bg-[#00C896]/80 transition-all">
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="w-full flex flex-col items-center">
                        <h1 className="text-[22px] font-bold">Verify OTP</h1>
                        <span className="text-[12px] mt-[5px]">Enter the 6-digit code sent to {email}</span>
                        <input type="text" required maxLength={6} placeholder="Enter OTP" value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="text-[16px] tracking-[10px] text-center w-[350px] h-[50px] bg-[#4A5C6A] rounded-[20px] mt-[20px]"/>
                        <button disabled={loading} className="w-[350px] h-[50px] bg-[#00C896]/50 rounded-[20px] mt-[20px] font-bold hover:bg-[#00C896]/80 transition-all">
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <label className="text-[12px] mt-[15px] cursor-pointer hover:underline" onClick={() => setStep(1)}>
                            Wrong email? Go back
                        </label>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="w-full flex flex-col items-center">
                        <h1 className="text-[22px] font-bold">Reset Password</h1>
                        <div className="group relative flex items-center mt-[20px]">
                            <MdLock className="ml-[20px] text-[#00C896] absolute opacity-[50%]"/>
                            <input type="password" required placeholder="New Password" value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="text-[12px] w-[350px] h-[50px] bg-[#4A5C6A] rounded-[20px] pl-[50px]"/>
                        </div>
                        <div className="group relative flex items-center mt-[15px]">
                            <MdLock className="ml-[20px] text-[#00C896] absolute opacity-[50%]"/>
                            <input type="password" required placeholder="Confirm Password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="text-[12px] w-[350px] h-[50px] bg-[#4A5C6A] rounded-[20px] pl-[50px]"/>
                        </div>
                        <button disabled={loading} className="w-[350px] h-[50px] bg-[#00C896]/50 rounded-[20px] mt-[20px] font-bold hover:bg-[#00C896]/80 transition-all">
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

            </div>
        </div>
    )
}