import { API_BASE_URL } from "../config/api";
import { useState } from "react";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const ROLE_REDIRECTS = {
  traveler: "/",
  hotel_owner: "/hotel_owner/dashboard",
  vehicle_owner: "/vehicle_owner/dashboard",
  guide: "/guide/dashboard",
  admin: "/admin",
};

const LOGIN_API_URL = `${API_BASE_URL}/api/login`;

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleOnSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.post(LOGIN_API_URL, {
        email,
        password,
        rememberMe,
      });

      const { user, token, role } = res.data;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      toast.success("Login successful");
      navigate(ROLE_REDIRECTS[role] || "/");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Login failed. Please try again."
        : "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleOnSubmit}>
      <div className="w-full min-h-screen bg-gradient-to-r from-primary-1 to-primary-2 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-center md:justify-between gap-10 md:gap-14 lg:gap-20">
          <div className="w-[180px] sm:w-[220px] md:w-[380px] lg:w-[500px] xl:w-[550px] flex items-center justify-center shrink-0">
            <img
              src="/main_logo.png"
              alt="Tours for Sri Lanka"
              className="login-logo-anim w-full h-auto object-contain"
            />
          </div>

          <div className="login-card-anim w-full max-w-[420px] sm:max-w-[450px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-8 px-6 sm:px-10 shadow-lg shadow-black/10 transition-shadow duration-300 hover:shadow-xl">
            <h1 className="text-[20px] xs:text-[22px] sm:text-[25px] font-bold text-center">
              Sign in
            </h1>
            <span className="text-[12px] sm:text-[14px] text-center mt-[5px]">
              Welcome back! Please sign in
            </span>
            <span className="text-[12px] sm:text-[14px] text-center">
              to continue your journey.
            </span>

            <div className="group relative flex items-center w-full mt-[20px]">
              <MdEmail className={ICON_CLASSES} />
              <input
                type="email"
                autoComplete="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${INPUT_CLASSES} pl-[50px] pr-4`}
                required
              />
            </div>

            <div className="group relative flex items-center w-full mt-[16px] sm:mt-[20px]">
              <MdLock className={ICON_CLASSES} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${INPUT_CLASSES} pl-[50px] pr-[50px]`}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="
                  mr-[15px]
                  text-primary-green
                  absolute
                  right-0
                  outline-none
                  opacity-[50%]
                  hover:opacity-100
                  transition-opacity
                  duration-300
                  cursor-pointer
                "
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </button>
            </div>

            <div className="w-full mt-[12px] sm:mt-[10px] flex flex-wrap justify-between items-center gap-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="cursor-pointer accent-primary-green w-[15px] h-[15px]"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-[12px] text-text pl-[5px] cursor-pointer select-none"
                >
                  Remember Me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="
                  text-[12px]
                  text-text
                  hover:text-primary-green/70
                  transition-colors
                  duration-300
                  cursor-pointer
                  hover:underline
                "
              >
                Forget Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
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
              "
            >
              {loading && (
                <span
                  className="
                    w-4
                    h-4
                    border-2
                    border-text/40
                    border-t-text
                    rounded-full
                    animate-spin
                  "
                />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="mt-[14px] sm:mt-[10px] w-full flex justify-center">
              <label className="text-[12px] text-text text-center">
                Don't have an account?{" "}
                <Link
                  to="/register-role"
                  className="
                    cursor-pointer
                    hover:underline
                    hover:text-primary-green/70
                    transition-colors
                    duration-300
                  "
                >
                  Sign up
                </Link>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}