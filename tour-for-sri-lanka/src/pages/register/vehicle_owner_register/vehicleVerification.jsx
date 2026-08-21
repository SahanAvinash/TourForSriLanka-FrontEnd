import { useState, useRef } from "react";
import { FaCheck, FaUpload, FaCamera } from "react-icons/fa";
import { GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const documentConfigs = [
    {
        key: "drivingLicense",
        label: "Driving License",
        note: "Upload both sides in single File",
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
        <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
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
                        ? "border-[#00C896]"
                        : "border-[#00C896]/50 hover:border-[#00C896]/80"
                }`}
            >
                <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={onChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-50"
                />

                {file ? (
                    <span className="text-[#00C896] text-[10px] break-all px-[5px]">
                        {file.name}
                    </span>
                ) : (
                    <>
                        <FaUpload className="text-[#00C896]/50 group-hover:text-[#00C896]/80 transition-all duration-300" />

                        <span className="text-[#CCD0CF]/50 mt-[3px]">
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

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

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
        if (!file) return;

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
        if (!file) return;

        if (
            !["image/jpeg", "image/png"].includes(
                file.type
            )
        ) {
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
        const stored = sessionStorage.getItem(
            "VehicleOwnerRegister"
        );

        const data = stored ? JSON.parse(stored) : null;

        if (!data) {
            setErr("Fill all required data");
            return;
        }

        if (!data.email) {
            setErr(
                "Email not found. Please fill account details again"
            );
            return;
        }

        setErr(null);
        setLoading(true);

        try {
            const res = await fetch(
                "http://localhost:3000/api/transport/send-otp",
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

            const result = await res.json();

            if (!res.ok) {
                setErr(
                    result.error ||
                        "Failed to send OTP"
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
        <div className="relative w-full min-h-screen bg-gradient-to-r from-[#06141B] to-[#253745] overflow-x-hidden flex flex-col">

            <div className="w-full flex justify-center lg:justify-start px-4 sm:px-6 lg:pl-[50px] pt-6 sm:pt-8 lg:pt-[50px] shrink-0">
                <div className="w-[230px] xs:w-[290px] sm:w-[380px] lg:w-[560px] flex items-start">

                    <div className="flex flex-col items-center w-[40px] sm:w-[58px] lg:w-[80px] shrink-0">
                        <div className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] lg:w-[30px] lg:h-[30px] rounded-full flex items-center justify-center bg-[#00C896]/80">
                            <span className="text-[#CCD0CF] text-[7px] sm:text-[9px] lg:text-[12px]">
                                <FaCheck />
                            </span>
                        </div>

                        <span className="mt-1 text-[#CCD0CF] text-[6px] sm:text-[8px] lg:text-[12px] text-center leading-tight whitespace-nowrap">
                            Account
                        </span>
                    </div>

                    <div className="flex-1 mt-[9px] sm:mt-[11px] lg:mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50 mx-1" />

                    <div className="flex flex-col items-center w-[40px] sm:w-[58px] lg:w-[80px] shrink-0">
                        <div className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] lg:w-[30px] lg:h-[30px] rounded-full flex items-center justify-center bg-[#00C896]/80">
                            <span className="text-[#CCD0CF] text-[7px] sm:text-[9px] lg:text-[12px]">
                                <FaCheck />
                            </span>
                        </div>

                        <span className="mt-1 text-[#CCD0CF] text-[6px] sm:text-[8px] lg:text-[12px] text-center leading-tight whitespace-nowrap">
                            Vehicle Information
                        </span>
                    </div>

                    <div className="flex-1 mt-[9px] sm:mt-[11px] lg:mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50 mx-1" />

                    <div className="flex flex-col items-center w-[40px] sm:w-[58px] lg:w-[80px] shrink-0">
                        <div className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] lg:w-[30px] lg:h-[30px] rounded-full flex items-center justify-center bg-[#00C896]/80">
                            <span className="text-[#CCD0CF] text-[7px] sm:text-[9px] lg:text-[12px]">
                                <FaCheck />
                            </span>
                        </div>

                        <span className="mt-1 text-[#CCD0CF] text-[6px] sm:text-[8px] lg:text-[12px] text-center leading-tight whitespace-nowrap">
                            Facilities
                        </span>
                    </div>

                    <div className="flex-1 mt-[9px] sm:mt-[11px] lg:mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50 mx-1" />

                    <div className="flex flex-col items-center w-[40px] sm:w-[58px] lg:w-[80px] shrink-0">
                        <div className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] lg:w-[30px] lg:h-[30px] rounded-full flex items-center justify-center bg-[#00C896]/80">
                            <span className="text-[#CCD0CF] text-[7px] sm:text-[9px] lg:text-[12px]">
                                4
                            </span>
                        </div>

                        <span className="mt-1 text-[#CCD0CF] text-[6px] sm:text-[8px] lg:text-[12px] text-center leading-tight whitespace-nowrap">
                            Verification
                        </span>
                    </div>

                </div>
            </div>

            <div className="flex-1 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-8 px-4 sm:px-6 lg:pl-[80px] lg:pr-[8%] py-8">

                <img
                    src="/main_logo.png"
                    alt="Tours for Sri Lanka"
                    className="w-[220px] xs:w-[260px] sm:w-[340px] md:w-[380px] lg:w-[500px] xl:w-[550px] shrink-0 object-contain animate-logo"
                />

                <div className="w-full max-w-[500px] bg-[#253745] text-[#CCD0CF] rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-0">

                    <h1 className="text-[20px] xs:text-[22px] sm:text-[25px] mt-0 sm:mt-0 font-bold text-[#CCD0CF] text-center">
                        Sign up as a Vehicle Owner
                    </h1>

                    {err && (
                        <div className="text-[#9E4444] text-[12px] text-center mt-[5px] px-2">
                            {err}
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-x-[10px] gap-y-[20px] w-full mt-[20px]">
                        {documentConfigs.map((cfg) => (
                            <DocumentUploadCard
                                key={cfg.key}
                                label={cfg.label}
                                note={cfg.note}
                                maxSizeMB={cfg.maxSizeMB}
                                file={documents[cfg.key]}
                                onChange={(e) =>
                                    handleDocumentFile(
                                        e.target.files[0],
                                        cfg
                                    )
                                }
                                onDrop={(e) => {
                                    e.preventDefault();

                                    handleDocumentFile(
                                        e.dataTransfer.files[0],
                                        cfg
                                    );
                                }}
                                onDragOver={(e) =>
                                    e.preventDefault()
                                }
                            />
                        ))}
                    </div>

                    <div className="w-full flex flex-col sm:flex-row text-[12px] text-[#CCD0CF] p-[10px] gap-5 sm:gap-3 items-center justify-center">

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
                                JPG,PNG format
                                <br />
                                Max size 2MB
                            </span>
                        </div>

                        <div
                            onDrop={(e) => {
                                e.preventDefault();

                                handleProfilePhotoFile(
                                    e.dataTransfer.files[0]
                                );
                            }}
                            onDragOver={(e) =>
                                e.preventDefault()
                            }
                            className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] shrink-0 rounded-full bg-[#4A5C6A]/50 border-2 border-dotted border-[#00C896]/50 hover:border-[#00C896]/80 transition-all duration-300 flex flex-col justify-center items-center text-center text-[#CCD0CF] overflow-hidden group cursor-pointer"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={(e) =>
                                    handleProfilePhotoFile(
                                        e.target.files[0]
                                    )
                                }
                                className="absolute inset-0 opacity-0 cursor-pointer z-50"
                            />

                            {profilePhoto ? (
                                <img
                                    src={profilePreview}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <>
                                    <FaCamera className="text-[#00C896]/50 group-hover:text-[#00C896]/80 text-[20px] transition-all duration-300" />

                                    <span className="text-[10px] text-[#CCD0CF]/50">
                                        Drag & Drop your
                                        photo
                                        <br />
                                        or
                                    </span>

                                    <span className="text-[10px] text-[#00C896]/50 group-hover:text-[#00C896]/80 transition-all duration-300">
                                        Browse Files
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex flex-row sm:flex-col gap-2 sm:gap-0">
                            <div
                                onClick={handleChangePhoto}
                                className="w-[100px] h-[30px] bg-[#4A5C6A]/50 mb-0 sm:mb-[10px] text-[12px] rounded-[20px] flex items-center justify-center text-[#CCD0CF] cursor-pointer hover:bg-[#4A5C6A]/80 transition-all duration-300"
                            >
                                <span>
                                    Change Photo
                                </span>
                            </div>

                            <div
                                onClick={handleRemovePhoto}
                                className="w-[100px] h-[30px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] flex items-center justify-center text-[#CCD0CF] cursor-pointer hover:bg-[#4A5C6A]/80 transition-all duration-300"
                            >
                                <span>
                                    Remove Photo
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-[10px] sm:mb-[20px] mt-[10px] w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-0 sm:px-[10px]">

                        <button
                            onClick={handlePrevious}
                            className="w-full h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95 cursor-pointer"
                        >
                            <GrFormPreviousLink className="font-bold text-[20px]" />
                            Previous
                        </button>

                        <button
                            onClick={handleSignUp}
                            disabled={loading}
                            className="w-full h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading
                                ? "Sending OTP..."
                                : "Sign up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}