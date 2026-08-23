import { API_BASE_URL } from "../config/api";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MdEmail, MdLock } from "react-icons/md";

const SEND_OTP_API_URL = `${API_BASE_URL}/api/password-reset/send-otp`;
const VERIFY_OTP_API_URL = `${API_BASE_URL}/api/password-reset/verify-otp`;
const RESET_PASSWORD_API_URL = `${API_BASE_URL}/api/password-reset/reset-password`;

const INPUT_CLASSES = `
  text-text
  text-[12px]
  w-full
  h-[48px]
  sm:h-[50px]
  bg-border
  rounded-[20px]
  outline-none
  ring-2
  ring-transparent
  focus:ring-primary-green/60
  transition-all
  duration-300
`;

const ICON_CLASSES = `
  ml-[20px]
  text-primary-green
  absolute
  outline-none
  opacity-[50%]
  group-focus-within:opacity-100
  group-hover:opacity-[80%]
  transition-opacity
  duration-300
  z-10
`;

const BUTTON_CLASSES = `
  w-full
  h-[48px]
  sm:h-[50px]
  bg-primary-green/50
  rounded-[20px]
  mt-[20px]
  text-text
  text-[16px]
  sm:text-[18px]
  md:text-[20px]
  font-bold
  hover:bg-primary-green/80
  hover:scale-[1.02]
  active:scale-[0.98]
  transition-all
  duration-300
  cursor-pointer
  disabled:opacity-50
  disabled:cursor-not-allowed
  disabled:hover:scale-100
  flex
  items-center
  justify-center
  gap-2
`;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSendOtp(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      await axios.post(SEND_OTP_API_URL, { email });
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.post(VERIFY_OTP_API_URL, { email, otp });
      toast.success("OTP verified");
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      await axios.post(RESET_PASSWORD_API_URL, { resetToken, newPassword });
      toast.success("Password reset successful, please login");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-primary-1 to-primary-2 flex items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-center md:justify-between gap-10 md:gap-14 lg:gap-20">
        <div className="w-[180px] sm:w-[220px] md:w-[380px] lg:w-[500px] xl:w-[550px] flex items-center justify-center shrink-0">
          <img
            src="/main_logo.png"
            alt="Tours for Sri Lanka"
            className=" w-full h-auto object-contain"
          />
        </div>

        <div className="login-card-anim w-full max-w-[420px] sm:max-w-[450px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-8 px-6 sm:px-10 shadow-lg shadow-black/10 transition-shadow duration-300 hover:shadow-xl">
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="w-full flex flex-col items-center">
              <h1 className="text-[20px] xs:text-[22px] sm:text-[25px] font-bold text-center">
                Forgot Password
              </h1>
              <span className="text-[12px] sm:text-[14px] mt-[5px] px-[10px] text-center">
                Enter your email and we'll send you an OTP to reset your password.
              </span>

              <div className="group relative flex items-center w-full mt-[20px]">
                <MdEmail className={ICON_CLASSES} />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${INPUT_CLASSES} pl-[50px] pr-4`}
                />
              </div>

              <button type="submit" disabled={loading} className={BUTTON_CLASSES}>
                {loading && (
                  <span className="w-4 h-4 border-2 border-text/40 border-t-text rounded-full animate-spin" />
                )}
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="w-full flex flex-col items-center">
              <h1 className="text-[20px] xs:text-[22px] sm:text-[25px] font-bold text-center">
                Verify OTP
              </h1>
              <span className="text-[12px] sm:text-[14px] mt-[5px] text-center">
                Enter the 6-digit code sent to {email}
              </span>

              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`${INPUT_CLASSES} text-[16px] tracking-[10px] text-center mt-[20px]`}
              />

              <button type="submit" disabled={loading} className={BUTTON_CLASSES}>
                {loading && (
                  <span className="w-4 h-4 border-2 border-text/40 border-t-text rounded-full animate-spin" />
                )}
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <label
                className="text-[12px] mt-[15px] cursor-pointer select-none hover:underline hover:text-primary-green/70 transition-colors duration-300"
                onClick={() => setStep(1)}
              >
                Wrong email? Go back
              </label>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="w-full flex flex-col items-center">
              <h1 className="text-[20px] xs:text-[22px] sm:text-[25px] font-bold text-center">
                Reset Password
              </h1>

              <div className="group relative flex items-center w-full mt-[20px]">
                <MdLock className={ICON_CLASSES} />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${INPUT_CLASSES} pl-[50px] pr-4`}
                />
              </div>

              <div className="group relative flex items-center w-full mt-[16px] sm:mt-[20px]">
                <MdLock className={ICON_CLASSES} />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${INPUT_CLASSES} pl-[50px] pr-4`}
                />
              </div>

              <button type="submit" disabled={loading} className={BUTTON_CLASSES}>
                {loading && (
                  <span className="w-4 h-4 border-2 border-text/40 border-t-text rounded-full animate-spin" />
                )}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}