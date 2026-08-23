import { Fragment, useState } from "react";
import { GrFormPreviousLink } from "react-icons/gr";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck, FaUpload } from "react-icons/fa";

const STORAGE_KEY = "HotelOwnerRegister";

const DOCUMENT_FIELDS = [
    {
        key: "brCertificate",
        title: "Business Registration",
        subtitle: "Upload your BR certificate",
    },
    {
        key: "hotelLicenseFile",
        title: "Hotel License",
        subtitle: "Upload your Hotel License",
    },
    {
        key: "ownerIdFile",
        title: "Owner / Manager ID",
        subtitle: "Upload NIC or Passport",
    },
    {
        key: "addressProofFile",
        title: "Address Proof",
        subtitle: "Upload utility bill or any proof",
    },
];

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Hotel Information", done: true, number: "2" },
    { label: "Facilities", done: true, number: "3" },
    { label: "Verification", current: true, number: "4" },
];

const ALLOWED_FILE_TYPE = "application/pdf";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const BR_NUMBER_REGEX = /^[A-Z]{1,4}[\/\s-]?\d{3,10}$/;
const LICENSE_NUMBER_REGEX = /^(?=.*\d)[A-Z0-9][A-Z0-9\/\s-]{2,14}$/;

export default function HotelVerification() {
    const navigate = useNavigate();
    const location = useLocation();

    const [brNumber, setBrNumber] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");

    const [files, setFiles] = useState({
        brCertificate: location.state?.brCertificate || null,
        hotelLicenseFile: location.state?.hotelLicenseFile || null,
        ownerIdFile: location.state?.ownerIdFile || null,
        addressProofFile: location.state?.addressProofFile || null,
    });

    const [err, setErr] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);

    const handleFileUpload = (event, key, title) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (file.type !== ALLOWED_FILE_TYPE) {
            setErr(`${title} must be uploaded as a PDF`);
            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setErr(`${title} must be less than 5MB`);
            event.target.value = "";
            return;
        }

        setFiles((prev) => ({
            ...prev,
            [key]: file,
        }));

        setErr("");
        event.target.value = "";
    };

    const handleBrNumberChange = (event) => {
        const value = event.target.value
            .replace(/[^a-zA-Z0-9\/\s-]/g, "")
            .toUpperCase();

        setBrNumber(value);
        setErr("");
    };

    const handleLicenseNumberChange = (event) => {
        const value = event.target.value
            .replace(/[^a-zA-Z0-9\/\s-]/g, "")
            .toUpperCase();

        setLicenseNumber(value);
        setErr("");
    };

    const handlePrevious = () => {
        const oldData =
            JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};

        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                ...oldData,
                brNumber,
                licenseNumber,
            })
        );

        navigate(-1);
    };

    const handleSaveAndContinue = async () => {
        const requiredFiles = [
            files.brCertificate,
            files.hotelLicenseFile,
            files.ownerIdFile,
            files.addressProofFile,
        ];

        if (
            !brNumber.trim() ||
            !licenseNumber.trim() ||
            requiredFiles.some((file) => !file)
        ) {
            setErr("Please fill all required fields");
            return;
        }

        if (!BR_NUMBER_REGEX.test(brNumber.trim())) {
            setErr("Please enter a valid BR Number (e.g. PV12345)");
            return;
        }

        if (!LICENSE_NUMBER_REGEX.test(licenseNumber.trim())) {
            setErr("Please enter a valid License Number (e.g. HTL1234)");
            return;
        }

        const storedData = sessionStorage.getItem(STORAGE_KEY);
        const data = storedData ? JSON.parse(storedData) : null;

        if (!data?.email) {
            setErr("Email not found. Please fill account details again");
            return;
        }

        const finalData = {
            ...data,
            brNumber: brNumber.trim(),
            licenseNumber: licenseNumber.trim(),
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));

        setErr("");
        setSendingOtp(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/hotel/send-otp",
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

            navigate("/verify-otp-hotel", {
                state: {
                    brCertificate: files.brCertificate,
                    hotelLicenseFile: files.hotelLicenseFile,
                    ownerIdFile: files.ownerIdFile,
                    addressProofFile: files.addressProofFile,
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
                            Sign up as Hotel Owner
                        </h1>

                        {err && (
                            <div className="text-[#9E4444] text-[12px] text-center mt-[5px] px-2">
                                {err}
                            </div>
                        )}

                        <div className="mt-[20px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <input
                                type="text"
                                placeholder="Enter BR Number"
                                value={brNumber}
                                maxLength={16}
                                onChange={handleBrNumberChange}
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
                            />

                            <input
                                type="text"
                                placeholder="Enter License Number"
                                value={licenseNumber}
                                maxLength={15}
                                onChange={handleLicenseNumberChange}
                                className="w-full h-[50px] text-text text-[12px] bg-border/50 rounded-[20px] pl-[20px]"
                            />
                        </div>

                        <div className="mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {DOCUMENT_FIELDS.map(({ key, title, subtitle }) => (
                                <div
                                    key={key}
                                    className="w-full h-[135px] bg-border/50 rounded-[20px] text-[12px] p-[10px] text-text"
                                >
                                    <span className="font-bold">
                                        {title}
                                        <br />
                                    </span>

                                    <span className="text-[10px] opacity-50">
                                        {subtitle}
                                    </span>

                                    <div
                                        className={`relative w-full h-[80px] border-2 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center mt-1 ${
                                            files[key]
                                                ? "border-primary-green"
                                                : "border-text/50"
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            onChange={(event) =>
                                                handleFileUpload(
                                                    event,
                                                    key,
                                                    title
                                                )
                                            }
                                            className="absolute inset-0 opacity-0 cursor-pointer z-50"
                                        />

                                        {files[key] ? (
                                            <span className="text-primary-green text-[10px] break-all px-2">
                                                {files[key].name}
                                            </span>
                                        ) : (
                                            <>
                                                <FaUpload className="text-primary-green/80" />

                                                <span className="opacity-50">
                                                    Click to upload
                                                    <br />
                                                    or Drag and Drop
                                                    <br />
                                                    PDF only (Max 5MB)
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-[20px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={sendingOtp}
                                className="w-full h-[50px] bg-border/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-border/80 transition-all duration-300 hover:scale-95 cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <GrFormPreviousLink className="font-bold text-[20px]" />
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveAndContinue}
                                disabled={sendingOtp}
                                className="w-full h-[50px] bg-primary-green/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
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