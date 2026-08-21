import { FaCamera } from "react-icons/fa";
import { useState, useRef } from "react";
import { GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

export default function TravelerProfilePhoto() {
    const [photo, setPhoto] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const [err, setErr] = useState("");

    const navigate = useNavigate();

    const validateFile = (file) => {
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setErr("Only JPG and PNG files are allowed");
            return false;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErr("File size must be less than 2MB");
            return false;
        }
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        if (!file) return;

        if (!validateFile(file)) return;

        setPhoto(URL.createObjectURL(file));
        setPhotoFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!validateFile(file)) return;

        setPhoto(URL.createObjectURL(file));
        setPhotoFile(file);
    };

    const handleRemovePhoto = () => {
        setPhoto(null);
        setPhotoFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePrevious = () => {
        navigate(-1);
    };

    const handleSignUp = async () => {
        try {
            const saved = JSON.parse(sessionStorage.getItem("TravelerRegister"));

            if (!saved) {
                setErr("Something went wrong");
                return;
            }

            const requiredFields = ["role", "firstName", "lastName", "email", "password", "NIC", "country", "mobile"];
            const missing = requiredFields.filter(
                (field) => !saved[field] || saved[field].toString().trim() === ""
            );

            if (missing.length > 0) {
                setErr("Please fill all required fields before continuing");
                return;
            }

            setIsLoading(true);

            const response = await fetch("http://localhost:3000/api/traveler/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: saved.email }),
            });
            const data = await response.json();

            if (!response.ok) {
                setErr(data.error || "Failed to send OTP");
                return;
            }

            navigate("/verify-otp", { state: { photoFile } });
        } catch (error) {
            setErr("Something went wrong. Please try again: " + error.message);
        } finally {
            setIsLoading(false);
        }
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

                <div className="w-full max-w-[500px] bg-primary-2 text-text rounded-[20px] flex flex-col items-center py-[20px] sm:py-[30px] px-4 sm:px-8">

                    <h1 className="text-[20px] sm:text-[25px] font-bold text-text text-center">Sign up as a Traveler</h1>

                    {err && (
                        <div className="text-[12px] text-[#9E4444] text-center mt-[5px]">
                            {err}
                        </div>
                    )}

                    <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 py-[20px] sm:p-[30px] mt-[10px]">

                        <div className="w-full sm:w-[110px] text-center sm:text-left">
                            <h2 className="font-bold text-text text-[16px]">Profile Photo</h2>
                            <h1 className="text-[12px] text-text/80 pt-[10px]">Upload a clear photo of yourself</h1>
                            <h1 className="text-[12px] text-text/80 pt-[10px]">JPG, PNG format. Max size 2MB</h1>
                        </div>

                        <div
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="w-[120px] h-[120px] shrink-0 overflow-hidden bg-border/50 rounded-full border-2 border-dotted border-primary-green/50 flex flex-col justify-center items-center cursor-pointer group hover:border-primary-green/80 transition-all duration-300"
                        >
                            {photo ? (
                                <img
                                    src={photo}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <>
                                    <FaCamera className="text-primary-green/50 text-[20px] group-hover:text-primary-green/80 transition-all duration-300" />
                                    <p className="text-[10px] text-text/50 mt-[5px] text-center pl-[5px] pr-[5px]">Drag & Drop your photo</p>
                                    <p className="text-[10px] text-text/50 text-center">or</p>
                                    <p className="text-primary-green/50 text-[10px] group-hover:text-primary-green/80 transition-all duration-300">Browse Files</p>
                                </>
                            )}
                        </div>

                        <input
                            type="file"
                            accept="image/png,image/jpeg"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handlePhotoChange}
                        />

                        <div className="flex flex-row sm:flex-col gap-[10px]">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="rounded-[20px] bg-border/50 p-[5px] text-[12px] text-text border border-border/50 hover:border-primary-green/80 transition-all duration-300 cursor-pointer"
                            >
                                Change Photo
                            </button>
                            <button
                                onClick={handleRemovePhoto}
                                className="rounded-[20px] bg-border/50 p-[5px] text-[12px] text-text border border-border/50 hover:border-[#9E4444]/80 transition-all duration-300 cursor-pointer"
                            >
                                Remove Photo
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSignUp}
                        disabled={isLoading}
                        className="text-[16px] sm:text-[20px] font-bold w-[90%] h-[50px] flex justify-center items-center rounded-[20px] bg-primary-green/50 hover:bg-primary-green/80 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? "Signing Up..." : "Sign Up"}
                    </button>

                    <button
                        onClick={handlePrevious}
                        className="w-[90%] h-[50px] flex justify-center items-center gap-1 rounded-[20px] bg-border/50 hover:bg-border/80 transition-all duration-300 mt-[10px] hover:scale-95 text-[16px] sm:text-[20px] font-bold cursor-pointer"
                    >
                        <GrFormPreviousLink />
                        Previous
                    </button>
                </div>

            </div>
        </div>
    );
}