import { Fragment, useState } from "react";
import { GrFormPreviousLink } from "react-icons/gr";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

const STORAGE_KEY = "HotelOwnerRegister";

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Hotel Information", done: true, number: "2" },
    { label: "Facilities", done: true, number: "3" },
    { label: "Verification", current: true, number: "4" },
];

export default function VerifyOtpHotel() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [otp, setOtp] = useState("");
    const [err, setErr] = useState("");
    const [resendMsg, setResendMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        brCertificate,
        hotelLicenseFile,
        ownerIdFile,
        addressProofFile,
    } = state || {};

    const storedData = sessionStorage.getItem(STORAGE_KEY);
    const data = storedData ? JSON.parse(storedData) : null;
    const email = data?.email;

    const handleVerify = async () => {
        if (!data || !email) {
            setErr("Session expired. Please sign up again.");
            return;
        }

        if (otp.length !== 6) {
            setErr("Please enter the 6-digit OTP");
            return;
        }

        setLoading(true);
        setErr("");
        setResendMsg("");

        try {
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (value === undefined || value === null) return;

                formData.append(
                    key,
                    typeof value === "object" ? JSON.stringify(value) : value
                );
            });

            if (brCertificate) {
                formData.append("brCertificate", brCertificate);
            }

            if (hotelLicenseFile) {
                formData.append("hotelLicenseFile", hotelLicenseFile);
            }

            if (ownerIdFile) {
                formData.append("ownerIdFile", ownerIdFile);
            }

            if (addressProofFile) {
                formData.append("addressProofFile", addressProofFile);
            }

            formData.append("otp", otp);

            const response = await fetch("http://localhost:3000/api/hotel", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                setErr(result.error || "Verification failed");
                return;
            }

            if (result.token) {
                localStorage.setItem("token", result.token);
            }

            sessionStorage.removeItem(STORAGE_KEY);
            navigate("/login");
        } catch {
            setErr("Something went wrong. Please try again");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setErr("Session expired. Please sign up again.");
            return;
        }

        setErr("");
        setResendMsg("");

        try {
            const response = await fetch(
                "http://localhost:3000/api/hotel/send-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setErr(result.error || "Failed to resend OTP");
                return;
            }

            setResendMsg("A new OTP has been sent to your email");
        } catch {
            setErr("Failed to resend OTP");
        }
    };

    const handlePrevious = () => {
        navigate(-1);
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
                                    <div className="flex-1 mt-[9px] sm:mt-[11px] lg:mt-[15px] border-t-2 border-dashed border-text/50 mx-1" />
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

                    <div className="login-card-anim w-full max-w-[450px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-8">
                        <h1 className="text-[20px] sm:text-[25px] font-bold text-text text-center">
                            Verify your email
                        </h1>

                        <p className="text-[12px] text-text/70 mt-[10px] text-center">
                            We sent a 6-digit code to{" "}
                            <span className="font-bold">{email}</span>
                        </p>

                        {err && (
                            <div className="text-[12px] text-[#9E4444] mt-[10px] text-center">
                                {err}
                            </div>
                        )}

                        {resendMsg && (
                            <div className="text-[12px] text-primary-green mt-[10px] text-center">
                                {resendMsg}
                            </div>
                        )}

                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="Enter OTP"
                            className="w-full mt-[20px] text-center tracking-[10px] text-[20px] rounded-[10px] bg-border/50 border border-border/50 focus:border-primary-green/80 outline-none p-[10px] text-text"
                        />

                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={loading}
                            className="text-[18px] font-bold w-full h-[50px] flex justify-center items-center rounded-[20px] bg-primary-green/50 hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 mt-[20px] disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Verifying..." : "Verify"}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={loading}
                            className="text-[12px] text-text/70 hover:text-primary-green/80 mt-[15px] underline cursor-pointer disabled:opacity-50"
                        >
                            Resend OTP
                        </button>

                        <button
                            type="button"
                            onClick={handlePrevious}
                            className="w-full h-[50px] flex justify-center items-center rounded-[20px] bg-border/50 hover:bg-border/80 transition-all duration-300 mt-[15px] hover:scale-95 text-[18px] font-bold cursor-pointer"
                        >
                            <GrFormPreviousLink className="text-[20px]" />
                            Previous
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}