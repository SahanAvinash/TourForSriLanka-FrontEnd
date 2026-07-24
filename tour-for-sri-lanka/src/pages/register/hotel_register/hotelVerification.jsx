import { GrFormPreviousLink } from "react-icons/gr";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheck, FaUpload } from "react-icons/fa";

const DOCUMENT_FIELDS = [
    { key: "brCertificate", title: "Business Registration Certificate", subtitle: "Upload your BR certificate" },
    { key: "hotelLicenseFile", title: "Hotel License", subtitle: "Upload your Hotel License" },
    { key: "ownerIdFile", title: "Owner / Manager ID", subtitle: "Upload NIC or Pasport" },
    { key: "addressProofFile", title: "Address Proof", subtitle: "Upload utility bill or any proof" },
]

const ALLOWED_TYPES = ["application/pdf"]
const brNumberRegex = /^[A-Za-z]{1,4}[\/\s-]?\d{3,10}$/
const licenseNumberRegex = /^(?=.*\d)[A-Za-z0-9][A-Za-z0-9\/\s-]{2,14}$/

export default function HotelVerification() {
    const navigate = useNavigate()
    const location = useLocation()

    const [brNumber, setBrNumber] = useState("")
    const [licenseNumber, setLicenseNumber] = useState("")

    const [files, setFiles] = useState({
        brCertificate: location.state?.brCertificate || null,
        hotelLicenseFile: location.state?.hotelLicenseFile || null,
        ownerIdFile: location.state?.ownerIdFile || null,
        addressProofFile: location.state?.addressProofFile || null,
    })

    const [err, setErr] = useState("")
    const [sendingOtp, setSendingOtp] = useState(false)

    const isValidFileType = (file) => ALLOWED_TYPES.includes(file.type)

    const handleFileUpload = (e, key, title) => {
        const file = e.target.files[0]
        if (!file) return

        if (!isValidFileType(file)) {
            setErr(`${title} must be uploaded as a PDF`)
            e.target.value = ""
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setErr(`${title} must be less than 5MB`)
            e.target.value = ""
            return
        }

        setErr("")
        setFiles((prev) => ({ ...prev, [key]: file }))
    }

    const handlePrevious = () => {
        const oldData = JSON.parse(sessionStorage.getItem("HotelOwnerRegister")) || {}
        sessionStorage.setItem("HotelOwnerRegister", JSON.stringify({ ...oldData, brNumber, licenseNumber }))
        navigate(-1)
    }

    const handleSaveAndContinue = async () => {
        if (!brNumber || !licenseNumber || !files.brCertificate || !files.hotelLicenseFile || !files.ownerIdFile || !files.addressProofFile) {
            setErr("Please fill all required fields")
            return
        }
        if(!brNumberRegex.test(brNumber)){
            setErr("Please enter a valid BR Number (eg : PV12345)")
            return
        }
        if(!licenseNumberRegex.test(licenseNumber)){
            setErr("Please enter a valid License Number (eg : HTL1234)")
            return
        }

        const stored = sessionStorage.getItem("HotelOwnerRegister")
        const data = stored ? JSON.parse(stored) : null

        if (!data?.email) {
            setErr("Email not found. Please fill account details again")
            return
        }

        const finalData = {
            ...data,
            brNumber,
            licenseNumber,
        }
        sessionStorage.setItem("HotelOwnerRegister", JSON.stringify(finalData))

        setErr("")
        setSendingOtp(true)

        try {
            const res = await fetch("http://localhost:3000/api/hotel/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email })
            })

            const result = await res.json()

            if (!res.ok) {
                setErr(result.error || "Failed to send OTP")
                setSendingOtp(false)
                return
            }

            navigate("/verify-otp-hotel", { state: { ...files } })
        } catch (error) {
            setErr(error.message || "Failed to send OTP")
        }
        setSendingOtp(false)
    }

    return (
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png" />
            </div>
            <div className="h-full absolute left-[50px] top-[50px] w-[40%]">
                <div className="flex items-start">
                    <div className="flex flex-col items-center w-[70px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck /></span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Account</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[110px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck /></span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center leading-4">Hotel information</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[80px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck /></span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Facilities</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[90px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]">4</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Verification</span>
                    </div>
                </div>
            </div>

            <div className="w-[500px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center pb-[20px]">
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as Hotel Owner</h1>
                {err && (
                    <div className="text-[#9E4444] text-[12px] mt-[5px]">
                        {err}
                    </div>
                )}

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <input
                        placeholder="Enter BR Number"
                        value={brNumber}
                        onChange={(e) => setBrNumber(e.target.value.replace(/[^a-zA-Z0-9\/\s-]/g, "").toUpperCase())}
                        className="w-[220px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                    />
                    <input
                        placeholder="Enter License Number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value.replace(/[^a-zA-Z0-9\/\s-]/g, "").toUpperCase())}
                        className="w-[220px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                    />
                </div>

                <div className="w-[465px] mt-[15px] grid grid-cols-2 gap-[15px]">
                    {DOCUMENT_FIELDS.map(({ key, title, subtitle }) => (
                        <div key={key} className="w-[220px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                            <span className="font-bold">{title}<br /></span>
                            <span className="text-[10px] opacity-[0.5]">{subtitle}</span>
                            <div
                                className="relative w-full h-[80px] border-2 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center mt-[5px]"
                                style={{ borderColor: files[key] ? "#00C896" : "#CCD0CF80" }}
                            >
                                <input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    onChange={(e) => handleFileUpload(e, key, title)}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-50"
                                />
                                {files[key] ? (
                                    <span className="text-[#00C896] text-[10px] break-all px-2">
                                        {files[key].name}
                                    </span>
                                ) : (
                                    <>
                                        <FaUpload className="text-[#00C896]/80" />
                                        <span className="opacity-[0.5]">
                                            Click to upload<br />
                                            or Drag and Drop<br />
                                            PDF only (Max 5MB)
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-[20px] w-[465px] flex justify-between">
                    <button onClick={handlePrevious} className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95">
                        <GrFormPreviousLink className="font-bold text-[20px]" />Previous
                    </button>
                    <button onClick={handleSaveAndContinue} disabled={sendingOtp} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">
                        {sendingOtp ? "Sending OTP..." : "Save & Continue"}
                    </button>
                </div>
            </div>
        </div>
    )
}
