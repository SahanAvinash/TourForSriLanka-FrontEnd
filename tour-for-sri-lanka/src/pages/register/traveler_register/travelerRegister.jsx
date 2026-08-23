import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useState } from "react";
import Select from "react-select";
import COUNTRIES from "../../../data/countryCode";
import { useNavigate } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";

const SELECT_STYLES = {
  control: (base) => ({
    ...base,
    minHeight: "50px",
    borderRadius: "20px",
    backgroundColor: "color-mix(in srgb, var(--color-border) 50%, transparent)",
    border: "none",
    boxShadow: "none",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "var(--color-primary-green)" : "var(--color-border)",
    color: "var(--color-text)",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--color-border)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--color-text)",
    paddingLeft: "10px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--color-text)",
    opacity: 0.5,
    paddingLeft: "10px",
  }),
  input: (base) => ({
    ...base,
    color: "var(--color-text)",
  }),
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIC_REGEX = /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/;
const PASSPORT_REGEX = /^[A-Za-z0-9]{6,9}$/;

export default function TravelerRegister() {
  const navigate = useNavigate();

  const role = sessionStorage.getItem("role") || "traveler";

  const [country, setCountry] = useState(null);
  const [mobile, setMobile] = useState("");
  const [dialCode, setDialCode] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [NIC, setNIC] = useState("");

  const [err, setErr] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const options = COUNTRIES.map((c) => ({
    label: `${c.flag} ${c.name}`,
    value: c.code,
  }));

  useEffect(() => {
    const saved = sessionStorage.getItem("TravelerRegister");
    if (!saved) return;

    const data = JSON.parse(saved);

    setFirstName(data.firstName || "");
    setLastName(data.lastName || "");
    setEmail(data.email || "");
    setPassword(data.password || "");
    setConfirmPassword(data.confirmPassword || "");
    setNIC(data.NIC || "");
    setMobile(data.mobile || "");
    setDialCode(data.dialCode || "");

    if (data.country) {
      const match = options.find((o) => o.label === data.country);
      setCountry(match || null);
    }
  }, []);

  function handleCountryChange(selected) {
    setCountry(selected);

    const found = COUNTRIES.find((c) => c.code === selected.value);
    if (found) {
      setDialCode(found.dial);
      setMobile("");
    }
  }

  function buildFormData() {
    return {
      role,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      NIC,
      country: country?.label,
      dialCode,
      mobile,
    };
  }

  function handleNext() {
    if (!firstName || !lastName || !email || !password || !NIC || !country || !mobile) {
      setErr("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErr("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters");
      return;
    }
    if (!NIC_REGEX.test(NIC) && !PASSPORT_REGEX.test(NIC)) {
      setErr("Please enter a valid NIC or Passport number");
      return;
    }
    if (!isValidPhoneNumber(mobile, country.value)) {
      setErr("Please enter a valid mobile number for the selected country");
      return;
    }

    sessionStorage.setItem("TravelerRegister", JSON.stringify(buildFormData()));
    navigate("/travelerprofilephoto");
  }

  function handlePrevious() {
    sessionStorage.setItem("TravelerRegister", JSON.stringify(buildFormData()));
    navigate(-1);
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-primary-1 to-primary-2 flex items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-center md:justify-between gap-10 md:gap-14 lg:gap-20">
        <div className="w-[180px] sm:w-[220px] md:w-[400px] lg:w-[500px] xl:w-[550px] flex items-center justify-center shrink-0">
          <img
            src="/main_logo.png"
            alt="Tours for Sri Lanka"
            className=" w-full h-auto object-contain"
          />
        </div>

        <div className="login-card-anim w-full max-w-[500px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-8">
          <h1 className="text-[20px] xs:text-[22px] sm:text-[25px] font-bold text-text text-center">
            Sign up as a Traveler
          </h1>

          {err && (
            <div className="text-[#9E4444] text-[12px] text-center mt-[5px]">
              {err}
            </div>
          )}

          <div className="mt-[20px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z]/g, ""))}
              className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
            />
            <input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z]/g, ""))}
              className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
            />
          </div>

          <div className="w-full mt-[10px] flex flex-col items-center">
            <input
              type="email"
              value={email}
              placeholder="E-Mail"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
            />

            <div className="flex flex-col relative w-full mt-[10px]">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] pr-[45px]"
              />
              {showPassword ? (
                <IoEye
                  className="absolute right-[18px] top-1/2 -translate-y-1/2 cursor-pointer text-text"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaEyeSlash
                  className="absolute right-[18px] top-1/2 -translate-y-1/2 cursor-pointer text-text"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            <div className="flex flex-col relative w-full mt-[10px]">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] pr-[45px]"
              />
              {showConfirmPassword ? (
                <IoEye
                  className="absolute right-[18px] top-1/2 -translate-y-1/2 cursor-pointer text-text"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <FaEyeSlash
                  className="absolute right-[18px] top-1/2 -translate-y-1/2 cursor-pointer text-text"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>

            <input
              placeholder="Passport Number/NIC"
              value={NIC}
              onChange={(e) =>
                setNIC(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase())
              }
              className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px] mt-[10px]"
            />

            <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="w-full text-text text-[12px]">
                <Select
                  options={options}
                  value={country}
                  onChange={handleCountryChange}
                  placeholder="Country"
                  styles={SELECT_STYLES}
                />
              </div>
              <div className="relative bg-border/50 w-full h-[50px] rounded-[20px] flex items-center">
                <div className="absolute pl-[20px] text-[12px] text-text">
                  {dialCode || "+"}
                </div>
                <input
                  type="text"
                  placeholder="Mobile"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (country && validatePhoneNumberLength(value, country.value) === "TOO_LONG") {
                      return;
                    }
                    setMobile(value);
                  }}
                  className="w-full h-[50px] bg-transparent rounded-[20px] text-[12px] pl-[70px] text-text"
                />
              </div>
            </div>

            <div className="mt-[20px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={handlePrevious}
                className="w-full h-[50px] bg-border/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-border/80 transition-all duration-300 hover:scale-95 cursor-pointer"
              >
                <GrFormPreviousLink className="font-bold text-[20px]" />
                Previous
              </button>
              <button
                onClick={handleNext}
                className="w-full h-[50px] bg-primary-green/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                Next <GrFormNextLink className="font-bold text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}