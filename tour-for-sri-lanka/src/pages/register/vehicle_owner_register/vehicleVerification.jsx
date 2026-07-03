import { useState, useRef } from "react";
import { FaCheck, FaUpload } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import { GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

export default function VehicleVerification(){
const [err,setErr] = useState(null)

const [drivingLicense,setDrivingLicense] = useState(null)
const [vehicleRegistrationCertificate,setVehicleRegistrationCertificate] = useState(null)
const [insuranceCertificate,setInsuranceCertificate] = useState(null)
const [revenueLicense,setRevenueLicense] = useState(null)
const [profilePhoto,setProfilePhoto] = useState(null)
const [profilePreview,setProfilePreview] = useState(null)

const fileInputRef = useRef(null)
const navigate = useNavigate()

const handleSignUp = async () => {
    try{
        const stored = sessionStorage.getItem("VehicleOwnerRegister")
        const data = stored ? JSON.parse(stored) : null

        if(!data){
            setErr("Fill all required data")
            return
        }
        const formData = new FormData()

        // Plain (non-object) fields: firstName, lastName, email, password, NIC, etc.
        Object.entries(data).forEach(([key,value]) => {
            if(typeof value !== "object" || value === null){
                formData.append(key,value)
            }
        })

        // Fields saved as {value, label} Select objects — send the underlying value
        formData.append("vehicleType", data.vehicleType?.value ?? "")
        formData.append("vehicleBrand", data.vehicleBrand?.value ?? "")
        formData.append("vehicleModel", data.vehicleModel?.value ?? "")
        formData.append("vehicleColor", data.vehicleColor?.value ?? "")
        formData.append("manufactureYear", data.manufactureYear?.value ?? "")
        formData.append("passengerCapacity", data.passengerCapacity?.value ?? "")
        formData.append("luggageCapacity", data.luggageCapacity?.value ?? "")
        formData.append("fuelType", data.fuelType?.value ?? "")

        // availableArea is an array of {value, label} objects — send each district value
        ;(data.availableArea || []).forEach((district) => {
            formData.append("availableArea", district?.value ?? district)
        })
        ;(data.addVehiclePhotos || []).forEach((url) => {
            formData.append("addVehiclePhotos", url)
        })

        drivingLicense && formData.append("drivingLicense", drivingLicense)
        vehicleRegistrationCertificate && formData.append("vehicleRegistrationCertificate", vehicleRegistrationCertificate)
        insuranceCertificate && formData.append("insuranceCertificate", insuranceCertificate)
        revenueLicense && formData.append("revenueLicense", revenueLicense)
        profilePhoto && formData.append("profilePhoto", profilePhoto)

        // TODO: addVehiclePhotos (from VehicleFacilities step) still needs to be
        // attached here — those File objects don't survive sessionStorage, so
        // this page currently has no way to re-collect them. Needs a decision:
        // either re-upload vehicle photos on this page, or persist them earlier
        // (e.g. upload-as-you-go to the backend and store returned URLs instead
        // of File objects in sessionStorage).

        const res = await fetch("http://localhost:3000/api/transport", {
            method: "POST",
            body: formData
        })

        const result = await res.json()

        if (!res.ok) {
            setErr(result.message || "Signup failed");
            return;
        }
        sessionStorage.removeItem("VehicleOwnerRegister");
        navigate("/login");
    }catch (err) {
        setErr(err.message);
    }
}

const handlePrevious = () => {
    navigate(-1)
}
const handleRemovePhoto = () => {
    setProfilePhoto(null)

    if (profilePreview){
        URL.revokeObjectURL(profilePreview)
        setProfilePreview(null)
    }
    if (fileInputRef.current){
        fileInputRef.current.value= ""
    }
}
const handleChangePhoto = () => {
    if (fileInputRef.current){
        fileInputRef.current.click()
    }
}

const handleFileUpload = (e, type) => {
    const file = e.target.files[0]

    if (!file) return

    if (type === "drivingLicense"){
        if(file.type !== "application/pdf"){
            setErr("Driving License must be uploaded as a PDF")
            e.target.value = ""
            return
        }
        if (file.size > 2 * 1024 * 1024){
            setErr("Driving License PDF must be less than 2MB")
            e.target.value = ""
            return
        }
        setErr(null)
        setDrivingLicense(file)
        return
    }
    if (type === "vehicleRegistrationCertificate"){
        if(file.type !== "application/pdf"){
            setErr("Vehicle Registration Certificate must be uploaded as a PDF")
            e.target.value = ""
            return
        }
        if(file.size > 2 * 1024 * 1024){
            setErr("Vehicle Registration Certificate PDF must be less than 2MB")
            e.target.value = ""
            return
        }
        setErr(null)
        setVehicleRegistrationCertificate(file)
        return
    }
    if (type === "insuranceCertificate"){
        if (file.type !== "application/pdf"){
            setErr("Insurance Certificate must be uploaded as a PDF")
            e.target.value = ""
            return
        }
        if (file.size > 5 * 1024 * 1024){
            setErr("Insurance Certificate PDF must be less than 5MB")
            e.target.value = ""
            return
        }
        setErr(null)
        setInsuranceCertificate(file)
        return
    }
    if (type === "revenueLicense"){
        if (file.type !== "application/pdf"){
            setErr("Revenue Certificate must be uploaded as a PDF")
            e.target.value = ""
            return
        }
        if (file.size > 5 * 1024 * 1024){
            setErr("Revenue Certificate PDF must be less than 5MB")
            e.target.value = ""
            return
        }
        setErr(null)
        setRevenueLicense(file)
        return
    }
    if (type === "profilePhoto"){
        if (file.size > 2 * 1024 * 1024){
            setErr("Profile photo must be less than 2MB")
            e.target.value = ""
            return
        }
        setErr(null)

        setProfilePhoto(file)
        setProfilePreview(URL.createObjectURL(file))
        return
    }
}
console.log(sessionStorage.getItem("VehicleOwnerRegister"))
    return(
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png"/>
            </div>
            <div className="h-full absolute left-[50px] top-[50px] w-[40%]">
                <div className="flex items-start">
                    <div className="flex flex-col items-center w-[70px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck/></span>
                        </div>
                            <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Account</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[95px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]"><FaCheck/></span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center leading-4">Vehicle Information</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                        <div className="flex flex-col items-center w-[70px]">
                            <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80 flex items-center justify-center">
                                <span className="text-[#CCD0CF] text-[12px]"><FaCheck/></span>
                            </div>
                            <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Facilities</span></div>
                            <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                                <div className="flex flex-col items-center w-[80px]">
                                    <div className="w-[30px] h-[30px] rounded-full bg-[#4A5C6A]/80 flex items-center justify-center">
                                        <span className="text-[#CCD0CF] text-[12px]">4</span>
                                    </div>
                                    <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Verification</span>
                                </div>
                </div>
            </div>
            <div className="w-[500px] h-[600px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center">
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as a Vehicle Owner</h1>
                {err && (
                    <div className="text-[#9E4444] text-[12px]">
                        {err}
                    </div>
                )}
                <div className="flex justify-evenly w-full mt-[20px]">
                    <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                        <span className="font-bold">Driving License<br/></span>
                        <span className="text-[10px] opacity-[0.5]">Upload both sides in single File</span>
                        <div className="relative w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center"
                            style={{
                                borderColor: drivingLicense ? "#00C896" : "#CCD0CF/50"
                            }}
                        >
                            <input
                                type="file"
                                accept="application/pdf, .pdf"
                                onChange={(e) => handleFileUpload(e,"drivingLicense")}
                                className="absolute inset-0 opacity-0 cursor-pointer z-50"
                            />
                            {drivingLicense ? (
                                <span className="text-[#00C896] text-[10px] break-all">
                                    {drivingLicense.name}
                                </span>
                            ) : (
                                <>
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">
                                        Click to Upload<br/>
                                        or Drag and Drop<br/>
                                        PDF (Max 2MB)
                                    </span>
                                </>
                            )}
                            
                        </div>
                    </div>
                    <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                        <span className="font-bold">Vehicle Registration Certificate<br/></span>
                        <span className="text-[10px] opacity-[0.5]">Upload single PDF document</span>
                        <div className="relative w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center"
                            style={{
                                borderColor: vehicleRegistrationCertificate ? "#00C896" : "#CCD0CF/50"
                            }}>
                            <input
                                type="file"
                                accept="application/pdf, .pdf"
                                onChange={(e)=>handleFileUpload(e,"vehicleRegistrationCertificate")}
                                className="absolute inset-0 opacity-0 cursor-pointer z-50"
                            />
                            {vehicleRegistrationCertificate ? (
                                <span className="text-[#00C896] text-[10px]  break-all">
                                    {vehicleRegistrationCertificate.name}
                                </span>
                            ) : (
                                <>
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">
                                        "Click to Upload<br/>or Drag and Drop<br/>PDF (Max 5MB)"
                                    </span>
                                </>
                            )}
                            
                        </div>
                    </div>
                </div>
                <div className="flex justify-evenly w-full mt-[20px]">
                    <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                        <span className="font-bold">Insurance Certificate<br/></span>
                        <span className="text-[10px] opacity-[0.5]">Upload a single PDF</span>
                        <div className="relative w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center"
                            style={{
                                borderColor: insuranceCertificate? "#00C896" : "#CCD0CF/50"
                            }}>
                            <input
                                type="file"
                                accept="application/pdf, .pdf"
                                onChange={(e)=>handleFileUpload(e,"insuranceCertificate")}
                                className="absolute inset-0 opacity-0 cursor-pointer z-50"
                            />
                            {insuranceCertificate ? (
                                <span className="text-[#00C896] text-[10px]  break-all">
                                    {insuranceCertificate.name}
                                </span>
                            ) : (
                                <>
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">
                                        "Click to Upload<br/>or Drag and Drop<br/>PDF (Max 5MB)"
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                        <span className="font-bold">Revenue License<br/></span>
                        <span className="text-[10px] opacity-[0.5]">Upload a single PDF</span>
                        <div className="relative w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center"
                            style={{
                                borderColor: revenueLicense ? "#00C896" : "#CCD0CF/50"
                            }}>
                            <input
                                type="file"
                                accept="application/pdf, .pdf"
                                onChange={(e)=>handleFileUpload(e,"revenueLicense")}
                                className="absolute inset-0 opacity-0 cursor-pointer z-50"
                            />
                            {revenueLicense? (
                                <span className="text-[#00C896] text-[10px]  break-all">
                                    {revenueLicense.name}
                                </span>
                            ) : (
                                <>
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">
                                        "Click to Upload<br/>or Drag and Drop<br/>PDF (Max 5MB)"
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full h-full flex text-[12px] text-[#CCD0CF] p-[10px] items-center justify-evenly">
                    <div>
                        <span className="font-bold mb-[10px]">Profile Picture<br/></span>
                        <span className="text-[10px] opacity-[0.5] mb-[10px]">Upload a clear photo<br/>of yourself<br/></span>
                        <span className="text-[10px] opacity-[0.5]">JPG,PNG format<br/>Max size 2MB</span>
                    </div>
                    <div className="relative w-[140px] h-[140px] rounded-full bg-[#4A5C6A]/50 border-2 border-[#CCD0CF]/50 border-dotted flex flex-col justify-center items-center text-center text-[#CCD0CF] overflow-hidden">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e)=>handleFileUpload(e,"profilePhoto")}
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
                                <FaCamera className="text-[#00C896]/80 text-[20px]"/>
                                <span className="text-[10px] opacity-[0.5]">Drag & Drop your photo<br/>or</span>
                                <span className="text-[10px] text-[#00C896]/80 ">Browse Files</span>
                            </>
                        )}
                    </div>
                    <div>
                        <div onClick={handleChangePhoto} className="w-[100px] h-[30px] bg-[#4A5C6A]/50 mb-[10px] text-[12px] rounded-[20px] flex items-center justify-center text-[#CCD0CF] cursor-pointer"> 
                            <span>Change Photo</span>
                        </div>
                        <div onClick={handleRemovePhoto} className="w-[100px] h-[30px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] flex items-center justify-center text-[#CCD0CF] cursor-pointer">
                            <span>Remove Photo</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="mb-[20px] w-full flex justify-evenly">
                        <button onClick={handlePrevious} className="mr-[10px] w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95"><GrFormPreviousLink className="font-bold text-[20px]" />Previous</button>
                        <button onClick={handleSignUp} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">Sign up</button>
                    </div>
                </div>
            </div>
        </div>
    )
}