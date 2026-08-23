import { API_BASE_URL } from "../../../config/api";
import { Fragment, useRef, useState } from "react";
import { FaCamera, FaCheck, FaUpload } from "react-icons/fa";
import { GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const documentConfigs = [
    {
        key: "drivingLicense",
        label: "Driving License",
        note: "Upload both sides in single file",
        maxSizeMB: 2,
    },
    {
        key: "vehicleRegistrationCertificate",
        label: "Vehicle Registration Certificate",
        note: "Upload single PDF document",
        maxSizeMB: 5,
    },
    {
        key: "insuranceCertificate",
        label: "Insurance Certificate",
        note: "Upload a single PDF",
        maxSizeMB: 5,
    },
    {
        key: "revenueLicense",
        label: "Revenue License",
        note: "Upload a single PDF",
        maxSizeMB: 5,
    },
];

const STEPS = [
    { label: "Account", done: true, number: "1" },
    { label: "Vehicle Information", done: true, number: "2" },
    { label: "Facilities", done: true, number: "3" },
    { label: "Verification", current: true, number: "4" },
];

function DocumentUploadCard({
    label,
    note,
    file,
    maxSizeMB,
    onChange,
    onDrop,
    onDragOver,
}) {
    return (
        <div className="w-[210px] h-[135px] bg-border/50 rounded-[20px] text-[12px] p-[10px] text-text">
            <span className="font-bold">
                {label}
                <br />
            </span>

            <span className="text-[10px] opacity-50">
                {note}
            </span>

            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className={`relative w-full h-[80px] mt-[5px] border-2 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center cursor-pointer group transition-all duration-300 ${
                    file
                        ? "border-primary-green"
                        : "border-primary-green/50 hover:border-primary-green/80"
                }`}
            >
                <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={onChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-50"
                />

                {file ? (
                    <span className="text-primary-green text-[10px] break-all px-[5px]">
                        {file.name}
                    </span>
                ) : (
                    <>
                        <FaUpload className="text-primary-green/50 group-hover:text-primary-green/80 transition-all duration-300" />

                        <span className="text-text/50 mt-[3px]">
                            Click to Upload
                            <br />
                            or Drag and Drop
                            <br />
                            PDF (Max {maxSizeMB}MB)
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VehicleVerification() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    const [documents, setDocuments] = useState({
        drivingLicense: null,
        vehicleRegistrationCertificate: null,
        insuranceCertificate: null,
        revenueLicense: null,
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    const validatePdf = (file, maxSizeMB) => {
        if (file.type !== "application/pdf") {
            return "File must be a PDF";
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File must be less than ${maxSizeMB}MB`;
        }

        return null;
    };

    const handleDocumentFile = (file, config) => {
        if (!file) {
            return;
        }

        const validationError = validatePdf(
            file,
            config.maxSizeMB
        );

        if (validationError) {
            setErr(`${config.label}: ${validationError}`);
            return;
        }

        setErr(null);

        setDocuments((prev) => ({
            ...prev,
            [config.key]: file,
        }));
    };

    const handleProfilePhotoFile = (file) => {
        if (!file) {
            return;
        }

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setErr("Profile photo must be JPG or PNG");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErr("Profile photo must be less than 2MB");
            return;
        }

        setErr(null);

        if (profilePreview) {
            URL.revokeObjectURL(profilePreview);
        }

        setProfilePhoto(file);
        setProfilePreview(URL.createObjectURL(file));
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

    const handleChangePhoto = () => {
        fileInputRef.current?.click();
    };

    const handlePrevious = () => {
        navigate(-1);
    };

    const handleSignUp = async () => {
        let data = null;

        try {
            const stored = sessionStorage.getItem(
                "VehicleOwnerRegister"
            );

            data = stored ? JSON.parse(stored) : null;
        } catch {
            setErr("Invalid registration data. Please try again");
            return;
        }

        if (!data) {
            setErr("Please fill all required data");
            return;
        }

        if (!data.email) {
            setErr(
                "Email not found. Please fill account details again"
            );
            return;
        }

        const missingDocument = documentConfigs.find(
            (config) => !documents[config.key]
        );

        if (missingDocument) {
            setErr(`Please upload ${missingDocument.label}`);
            return;
        }

        if (!profilePhoto) {
            setErr("Please upload a profile photo");
            return;
        }

        setErr("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/transport/send-otp`,
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
                setErr(
                    result.error || "Failed to send OTP"
                );
                return;
            }

            navigate("/verify-otp-transport", {
                state: {
                    ...documents,
                    profilePhoto,
                },
            });
        } catch (error) {
            setErr(
                error.message ||
                    "Something went wrong. Please try again"
            );
        } finally {
            setLoading(false);
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
                            Sign up as a Vehicle Owner
                        </h1>

                        {err && (
                            <div className="text-[#9E4444] text-[12px] text-center mt-[5px] px-2">
                                {err}
                            </div>
                        )}

                        <div className="flex flex-wrap justify-center gap-x-[10px] gap-y-[20px] w-full mt-[20px]">
                            {documentConfigs.map((config) => (
                                <DocumentUploadCard
                                    key={config.key}
                                    label={config.label}
                                    note={config.note}
                                    maxSizeMB={config.maxSizeMB}
                                    file={documents[config.key]}
                                    onChange={(event) =>
                                        handleDocumentFile(
                                            event.target.files[0],
                                            config
                                        )
                                    }
                                    onDrop={(event) => {
                                        event.preventDefault();

                                        handleDocumentFile(
                                            event.dataTransfer.files[0],
                                            config
                                        );
                                    }}
                                    onDragOver={(event) =>
                                        event.preventDefault()
                                    }
                                />
                            ))}
                        </div>

                        <div className="w-full flex flex-col sm:flex-row text-[12px] text-text p-[10px] gap-5 sm:gap-3 items-center justify-center">
                            <div className="text-center sm:text-left">
                                <span className="font-bold mb-[10px]">
                                    Profile Picture
                                    <br />
                                </span>

                                <span className="text-[10px] opacity-50">
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

                            <div
                                onDrop={(event) => {
                                    event.preventDefault();

                                    handleProfilePhotoFile(
                                        event.dataTransfer.files[0]
                                    );
                                }}
                                onDragOver={(event) =>
                                    event.preventDefault()
                                }
                                className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] shrink-0 rounded-full bg-border/50 border-2 border-dotted border-primary-green/50 hover:border-primary-green/80 transition-all duration-300 flex flex-col justify-center items-center text-center text-text overflow-hidden group cursor-pointer"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    onChange={(event) =>
                                        handleProfilePhotoFile(
                                            event.target.files[0]
                                        )
                                    }
                                    className="absolute inset-0 opacity-0 cursor-pointer z-50"
                                />

                                {profilePhoto ? (
                                    <img
                                        src={profilePreview}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <FaCamera className="text-primary-green/50 group-hover:text-primary-green/80 text-[20px] transition-all duration-300" />

                                        <span className="text-[10px] text-text/50">
                                            Drag & Drop your photo
                                            <br />
                                            or
                                        </span>

                                        <span className="text-[10px] text-primary-green/50 group-hover:text-primary-green/80 transition-all duration-300">
                                            Browse Files
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-row sm:flex-col gap-2 sm:gap-0">
                                <div
                                    onClick={handleChangePhoto}
                                    className="w-[100px] h-[30px] bg-border/50 mb-0 sm:mb-[10px] text-[12px] rounded-[20px] flex items-center justify-center text-text cursor-pointer hover:bg-border/80 transition-all duration-300"
                                >
                                    Change Photo
                                </div>

                                <div
                                    onClick={handleRemovePhoto}
                                    className="w-[100px] h-[30px] bg-border/50 rounded-[20px] text-[12px] flex items-center justify-center text-text cursor-pointer hover:bg-border/80 transition-all duration-300"
                                >
                                    Remove Photo
                                </div>
                            </div>
                        </div>

                        <div className="mb-[10px] sm:mb-[20px] mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-0 sm:px-[10px]">
                            <button
                                onClick={handlePrevious}
                                className="w-full h-[50px] bg-border/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-border/80 transition-all duration-300 hover:scale-95 cursor-pointer"
                            >
                                <GrFormPreviousLink className="font-bold text-[20px]" />
                                Previous
                            </button>

                            <button
                                onClick={handleSignUp}
                                disabled={loading}
                                className="w-full h-[50px] bg-primary-green/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading
                                    ? "Sending OTP..."
                                    : "Sign up"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}