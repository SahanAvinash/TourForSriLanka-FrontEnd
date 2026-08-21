import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useState, Fragment } from "react";
import Select from "react-select";
import COUNTRIES from "../../../data/countryCode";
import { useNavigate } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { FaEyeSlash, FaCheck } from "react-icons/fa";
import {
    isValidPhoneNumber,
    validatePhoneNumberLength,
} from "libphonenumber-js";

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "50px",
        borderRadius: "20px",
        backgroundColor:
            "color-mix(in srgb, var(--color-border) 50%, transparent)",
        border: "none",
        boxShadow: "none",
    }),

    menu: (base) => ({
        ...base,
        backgroundColor: "var(--color-border)",
    }),

    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
            ? "var(--color-primary-green)"
            : "var(--color-border)",
        color: "var(--color-text)",
        cursor: "pointer",
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

export default function VehicleOwnerRegister() {
    const navigate = useNavigate();

    const role = sessionStorage.getItem("role");

    const [checkingEmail, setCheckingEmail] = useState(false);

    const nicRegex = /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/;
    const passportRegex = /^[A-Za-z0-9]{6,9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const handleCountryChange = (selected) => {
        setCountry(selected);

        const found = COUNTRIES.find((c) => c.code === selected.value);

        if (found) {
            setDialCode(found.dial);
            setMobile("");
        }
    };

    const buildFormData = () => {
        const oldData =
            JSON.parse(sessionStorage.getItem("VehicleOwnerRegister")) || {};

        return {
            ...oldData,
            role,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            NIC,
            country: country?.label,
            mobile: dialCode ? `${dialCode}${mobile}` : mobile,
        };
    };

    const handleNext = async () => {
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !NIC ||
            !country ||
            !mobile
        ) {
            setErr("Please fill all required fields");
            return;
        }

        if (password !== confirmPassword) {
            setErr("Passwords do not match");
            return;
        }

        if (!emailRegex.test(email)) {
            setErr("Please enter a valid email address");
            return;
        }

        if (password.length < 8) {
            setErr("Password must be at least 8 characters");
            return;
        }

        if (!nicRegex.test(NIC) && !passportRegex.test(NIC)) {
            setErr("Please enter a valid NIC or Passport number");
            return;
        }

        if (!isValidPhoneNumber(mobile, country.value)) {
            setErr("Please enter a valid mobile number for the selected country");
            return;
        }

        setErr("");
        setCheckingEmail(true);

        try {
            const res = await fetch(
                `http://localhost:3000/api/transport/check-email?email=${encodeURIComponent(
                    email
                )}`
            );

            const result = await res.json();

            if (result.exists) {
                setErr("This email is already registered");
                return;
            }

            sessionStorage.setItem(
                "VehicleOwnerRegister",
                JSON.stringify(buildFormData())
            );

            navigate("/vehicleownerinformation");
        } catch (error) {
            setErr("Could not verify email, please try again");
        } finally {
            setCheckingEmail(false);
        }
    };

    useEffect(() => {
        const saved = sessionStorage.getItem("VehicleOwnerRegister");

        if (saved) {
            const data = JSON.parse(saved);

            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setEmail(data.email || "");
            setPassword(data.password || "");
            setConfirmPassword(data.confirmPassword || "");
            setNIC(data.NIC || "");

            if (data.country) {
                const match = options.find((o) => o.label === data.country);

                setCountry(match || null);

                if (data.mobile) {
                    const foundCountry = COUNTRIES.find(
                        (c) => c.code === match?.value
                    );

                    if (
                        foundCountry &&
                        data.mobile.startsWith(foundCountry.dial)
                    ) {
                        setDialCode(foundCountry.dial);

                        setMobile(
                            data.mobile.slice(foundCountry.dial.length)
                        );
                    } else {
                        setMobile(data.mobile);
                    }
                }
            } else if (data.mobile) {
                setMobile(data.mobile);
            }
        }
    }, []);

    const handlePrevious = () => {
        sessionStorage.setItem(
            "VehicleOwnerRegister",
            JSON.stringify(buildFormData())
        );

        navigate(-1);
    };

    const steps = [
        { label: "Account", number: "1", current: true },
        { label: "Vehicle Information", number: "2" },
        { label: "Facilities", number: "3" },
        { label: "Verification", number: "4" },
    ];

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-r from-primary-1 to-primary-2 overflow-x-hidden">

            <div className="step-bar-anim absolute top-0 left-0 w-full flex justify-center px-4 sm:px-6 pt-6 sm:pt-8 lg:pt-[50px] z-10">
                <div className="w-full max-w-[1200px] flex justify-center lg:justify-start">
                    <div className="w-[260px] sm:w-[340px] lg:w-[500px] xl:w-[550px] flex items-start">
                        {steps.map((step, i) => (
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

                                {i < steps.length - 1 && (
                                    <div className="flex-1 mt-[9px] sm:mt-[11px] lg:mt-[15px] border-t-2 border-dashed border-text/50 mx-1"></div>
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

                    <div className="login-card-anim w-full max-w-[500px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-8">
                        <h1 className="text-[20px] sm:text-[25px] font-bold text-text text-center">
                            Sign up as a Vehicle Owner
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
                                onChange={(e) =>
                                    setFirstName(e.target.value.replace(/[^a-zA-Z]/g, ""))
                                }
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
                            />

                            <input
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) =>
                                    setLastName(e.target.value.replace(/[^a-zA-Z]/g, ""))
                                }
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
                                    setNIC(
                                        e.target.value
                                            .replace(/[^a-zA-Z0-9]/g, "")
                                            .slice(0, 12)
                                            .toUpperCase()
                                    )
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
                                        menuPosition="fixed"
                                        styles={selectStyles}
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

                                            if (
                                                country &&
                                                validatePhoneNumberLength(
                                                    value,
                                                    country.value
                                                ) === "TOO_LONG"
                                            ) {
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
                                    disabled={checkingEmail}
                                    className="w-full h-[50px] bg-primary-green/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {checkingEmail ? (
                                        "Checking..."
                                    ) : (
                                        <>
                                            Next
                                            <GrFormNextLink className="font-bold text-[20px]" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}