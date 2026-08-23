import { Fragment, useRef, useState } from "react";
import { FaCamera, FaCheck } from "react-icons/fa";
import { GrFormPreviousLink } from "react-icons/gr";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";

const GUEST_OPTIONS = [
    ...Array.from({ length: 10 }, (_, i) => `${i + 1}`),
    "10+",
];

const CURRENCY_OPTIONS = ["LKR", "USD", "EUR", "GBP"];

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Personal Info", done: true, number: "2" },
    { label: "Professional Info", done: true, number: "3" },
    { label: "Pricing", number: "4", current: true },
];

const selectStyles = {
    control: (base) => ({
        ...base,
        width: "100%",
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

    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),

    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
            ? "var(--color-primary-green)"
            : "var(--color-border)",
        color: "var(--color-text)",
        cursor: "pointer",
        fontSize: "12px",
    }),

    singleValue: (base) => ({
        ...base,
        color: "var(--color-text)",
        paddingLeft: "10px",
        fontSize: "12px",
    }),

    placeholder: (base) => ({
        ...base,
        color: "var(--color-text)",
        opacity: 0.5,
        paddingLeft: "10px",
        fontSize: "12px",
    }),

    input: (base) => ({
        ...base,
        color: "var(--color-text)",
    }),
};

export default function GuidePricing() {
    const navigate = useNavigate();
    const location = useLocation();

    const [pricePerHour, setPricePerHour] = useState("");
    const [pricePerDay, setPricePerDay] = useState("");
    const [maximumGuests, setMaximumGuests] = useState(null);
    const [currency, setCurrency] = useState(null);

    const [profilePhoto, setProfilePhoto] = useState(
        location.state?.profilePhoto || null
    );
    const [profilePreview, setProfilePreview] = useState(null);

    const [err, setErr] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);

    const fileInputRef = useRef(null);

    const guestOptions = GUEST_OPTIONS.map((guest) => ({
        label: `${guest} ${guest === "1" ? "guest" : "guests"}`,
        value: guest,
    }));

    const currencyOptions = CURRENCY_OPTIONS.map((currencyValue) => ({
        label: currencyValue,
        value: currencyValue,
    }));

    const handleChangePhoto = () => {
        fileInputRef.current?.click();
    };

    const handleRemovePhoto = () => {
        setProfilePhoto(null);

        if (profilePreview) {
            URL.revokeObjectURL(profilePreview);
            setProfilePreview(null);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setErr("Profile photo must be a JPG or PNG");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErr("Profile photo must be less than 2MB");
            e.target.value = "";
            return;
        }

        if (profilePreview) {
            URL.revokeObjectURL(profilePreview);
        }

        setErr("");
        setProfilePhoto(file);
        setProfilePreview(URL.createObjectURL(file));
    };

    const handlePrevious = () => {
        navigate(-1, {
            state: {
                nicFile: location.state?.nicFile,
                licenseFile: location.state?.licenseFile,
                profilePhoto,
            },
        });
    };

    const handleSaveAndContinue = async () => {
        if (
            !pricePerHour ||
            !pricePerDay ||
            !maximumGuests ||
            !currency ||
            !profilePhoto
        ) {
            setErr("Please fill all required fields");
            return;
        }

        const stored = sessionStorage.getItem("GuideRegister");
        const data = stored ? JSON.parse(stored) : null;

        if (!data?.email) {
            setErr("Email not found. Please fill account details again");
            return;
        }

        const finalData = {
            ...data,
            pricePerHour,
            pricePerDay,
            maximumGuests: maximumGuests.value,
            currency: currency.value,
        };

        sessionStorage.setItem(
            "GuideRegister",
            JSON.stringify(finalData)
        );

        setErr("");
        setSendingOtp(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/guide/send-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: data.email,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setErr(result.error || "Failed to send OTP");
                return;
            }

            navigate("/verify-otp-guide", {
                state: {
                    nicFile: location.state?.nicFile,
                    licenseFile: location.state?.licenseFile,
                    profilePhoto,
                },
            });
        } catch (error) {
            setErr(error.message || "Failed to send OTP");
        } finally {
            setSendingOtp(false);
        }
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
                                            {step.done ? (
                                                <FaCheck />
                                            ) : (
                                                step.number
                                            )}
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

                    <div className="login-card-anim w-full max-w-[500px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-8">
                        <h1 className="text-[20px] sm:text-[25px] font-bold text-text text-center">
                            Sign up as a Guide
                        </h1>

                        {err && (
                            <div className="text-[#9E4444] text-[12px] text-center mt-[5px] px-2">
                                {err}
                            </div>
                        )}

                        <div className="mt-[20px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Price Per Hour"
                                value={pricePerHour}
                                onChange={(e) =>
                                    setPricePerHour(
                                        e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                        )
                                    )
                                }
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
                            />

                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Price Per Day"
                                value={pricePerDay}
                                onChange={(e) =>
                                    setPricePerDay(
                                        e.target.value.replace(
                                            /[^0-9.]/g,
                                            ""
                                        )
                                    )
                                }
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
                            />
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[12px]">
                            <Select
                                options={guestOptions}
                                value={maximumGuests}
                                onChange={setMaximumGuests}
                                placeholder="Maximum Guests"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />

                            <Select
                                options={currencyOptions}
                                value={currency}
                                onChange={setCurrency}
                                placeholder="Currency"
                                menuPosition="fixed"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                            />
                        </div>

                        <div className="mt-[20px] w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-text">
                            <div className="text-[12px] text-center sm:text-left order-2 sm:order-1">
                                <span className="font-bold mb-[10px]">
                                    Profile picture
                                    <br />
                                </span>

                                <span className="text-[10px] opacity-50 mb-[10px]">
                                    Upload a clear photo
                                    <br />
                                    of yourself
                                    <br />
                                </span>

                                <span className="text-[10px] opacity-50">
                                    JPG, PNG format
                                    <br />
                                    Max size 2MB
                                </span>
                            </div>

                            <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] shrink-0 rounded-full bg-border/50 border-2 border-text/50 border-dotted flex flex-col justify-center items-center text-center text-text overflow-hidden order-1 sm:order-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    onChange={handlePhotoUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-50"
                                />

                                {profilePhoto ? (
                                    profilePreview ? (
                                        <img
                                            src={profilePreview}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center px-3">
                                            <FaCamera className="text-primary-green/80 text-[20px]" />
                                            <span className="text-[9px] opacity-50 mt-2">
                                                Photo selected
                                            </span>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        <FaCamera className="text-primary-green/80 text-[20px]" />

                                        <span className="text-[10px] opacity-50">
                                            Drag & Drop your photo
                                            <br />
                                            or
                                        </span>

                                        <span className="text-[10px] text-primary-green/80">
                                            Browse Files
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-row sm:flex-col gap-2 sm:gap-[10px] order-3">
                                <button
                                    type="button"
                                    onClick={handleChangePhoto}
                                    className="w-[100px] h-[30px] bg-border/50 text-[12px] rounded-[20px] flex items-center justify-center text-text cursor-pointer hover:bg-border/80 transition-all duration-300"
                                >
                                    Change Photo
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="w-[100px] h-[30px] bg-border/50 rounded-[20px] text-[12px] flex items-center justify-center text-text cursor-pointer hover:bg-border/80 transition-all duration-300"
                                >
                                    Remove Photo
                                </button>
                            </div>
                        </div>

                        <div className="mt-[20px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="w-full h-[50px] bg-border/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-border/80 transition-all duration-300 hover:scale-95 cursor-pointer"
                            >
                                <GrFormPreviousLink className="font-bold text-[20px]" />
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveAndContinue}
                                disabled={sendingOtp}
                                className="w-full h-[50px] bg-primary-green/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50"
                            >
                                {sendingOtp
                                    ? "Sending OTP..."
                                    : "Save & Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}