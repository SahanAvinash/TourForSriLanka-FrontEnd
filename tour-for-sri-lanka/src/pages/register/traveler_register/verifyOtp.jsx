import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GrFormPreviousLink } from "react-icons/gr";

export default function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendMsg, setResendMsg] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const photoFile = location.state?.photoFile;
    const saved = JSON.parse(sessionStorage.getItem("TravelerRegister")) || {};
    const email = saved.email;

    const handleVerify = async () => {
        if (!email) {
            setErr("Session expired. Please sign up again.");
            return;
        }
        if (otp.length !== 6) {
            setErr("Please enter the 6-digit OTP");
            return;
        }

        setLoading(true);
        setErr("");

        try {
            const formData = new FormData();
            formData.append("role", saved.role);
            formData.append("firstName", saved.firstName);
            formData.append("lastName", saved.lastName);
            formData.append("email", saved.email);
            formData.append("password", saved.password);
            formData.append("NIC", saved.NIC);
            formData.append("country", saved.country);
            formData.append("mobile", saved.mobile);
            formData.append("otp", otp);

            if (photoFile) {
                formData.append("image", photoFile);
            }

            const response = await fetch("http://localhost:3000/api/traveler/register", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                setErr(data.error || "Verification failed");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", data.token);
            sessionStorage.removeItem("TravelerRegister");
            navigate("/login");
        } catch (error) {
            setErr("Something went wrong. Please try again");
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;

        setResendMsg("");
        setErr("");

        try {
            const response = await fetch("http://localhost:3000/api/traveler/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                setErr(data.error || "Failed to resend OTP");
                return;
            }

            setResendMsg("A new OTP has been sent to your email");
        } catch (error) {
            setErr("Failed to resend OTP");
        }
    };

    const handlePrevious = () => {
        navigate(-1);
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-r from-primary-1 to-primary-2 flex items-center justify-center px-4 sm:px-6 py-10">
            <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-center md:justify-between gap-10 md:gap-14 lg:gap-20">

                <div className="w-[180px] sm:w-[220px] md:w-[400px] lg:w-[500px] xl:w-[550px] flex items-center justify-center shrink-0">
                    <img
                        src="/main_logo.png"
                        alt="Tours for Sri Lanka"
                        className="w-full h-auto object-contain"
                    />
                </div>

                <div className="w-full max-w-[450px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center p-[20px] sm:p-[30px]">

                    <h1 className="text-[20px] sm:text-[25px] font-bold text-text text-center">Verify your email</h1>

                    <p className="text-[12px] text-text/70 mt-[10px] text-center">
                        We sent a 6-digit code to <span className="font-bold">{email}</span>
                    </p>

                    {err && (
                        <div className="text-[12px] text-[#9E4444] mt-[10px] text-center">{err}</div>
                    )}
                    {resendMsg && (
                        <div className="text-[12px] text-primary-green mt-[10px] text-center">{resendMsg}</div>
                    )}

                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Enter OTP"
                        className="w-full mt-[20px] text-center tracking-[10px] text-[20px] rounded-[10px] bg-border/50 border border-border/50 focus:border-primary-green/80 outline-none p-[10px] text-text"
                    />

                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="text-[18px] font-bold w-full h-[50px] flex justify-center items-center rounded-[20px] bg-primary-green/50 hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 mt-[20px] disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>

                    <button
                        onClick={handleResend}
                        className="text-[12px] text-text/70 hover:text-primary-green/80 mt-[15px] underline cursor-pointer"
                    >
                        Resend OTP
                    </button>

                    <button
                        onClick={handlePrevious}
                        className="w-full h-[50px] flex justify-center items-center gap-1 rounded-[20px] bg-border/50 hover:bg-border/80 transition-all duration-300 mt-[15px] hover:scale-95 text-[18px] font-bold cursor-pointer"
                    >
                        <GrFormPreviousLink />
                        Previous
                    </button>
                </div>

            </div>
        </div>
    );
}