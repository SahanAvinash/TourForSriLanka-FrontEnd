import { FaCamera } from "react-icons/fa";
import { useState, useRef } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

export default function TravelerProfilePhoto(){
    const [photo,setPhoto] = useState(null)
    const [photoFile,setPhotoFile] = useState(null)
    const fileInputRef = useRef(null)

    const [err,setErr] = useState("")
    
    const navigate = useNavigate()

    const handleDrop = (e) =>{
        e.preventDefault()

        const file = e.dataTransfer.files[0]

        if(!file) return

        if(!["image/jpeg", "image/png"].includes(file.type)){
            setErr("Only JPG and PNG files are allowed")
            return
        }
        if(file.size > 2*1024*1024){
            setErr("File size must be less than 2MB")
            return
        }
        setPhoto(URL.createObjectURL(file))
        setPhotoFile(file)
    }
    const handleDragOver = (e) => {
        e.preventDefault()
    }
    const handlePhotoChange = (e)=>{
        const file = e.target.files[0]

        if(!file) return

        if(!["image/jpeg","image/png"].includes(file.type)){
            setErr("Only JPG and PNG files are allowed")
            return
        }
        if(file.size >2*1024*1024){
            setErr("File size must be less than 2MB")
            return
        }
        setPhoto(URL.createObjectURL(file))
        setPhotoFile(file)
    }
    const handleRemovePhoto = ()=>{
        setPhoto(null)
        setPhotoFile(null)

        if(fileInputRef.current){
            fileInputRef.current.value=""
        }
    }

    const handlePrevious = () =>{
        navigate(-1)
    }
    const handleSignUp = async () =>{
        try{
            const saved = JSON.parse(sessionStorage.getItem("TravelerRegister"))

            if(!saved){
                setErr("Something went wrong")
                return
            }
            const formData = new FormData()
            
            formData.append("role",saved.role)
            formData.append("firstName",saved.firstName)
            formData.append("lastName",saved.lastName)
            formData.append("email",saved.email)
            formData.append("password",saved.password)
            formData.append("NIC",saved.NIC)
            formData.append("country",saved.country)
            formData.append("mobile",saved.mobile)

            if(photoFile){
                formData.append("image",photoFile)
            }

            const response = await fetch("http://localhost:3000/api/traveler/register",{
                method : "POST",
                body : formData
            })
            const data = await response.json()

            if(!response.ok){
                setErr(data.message || "Signup failed.  Please try again later")
                return
            }
            localStorage.setItem("token",data.token)
            sessionStorage.removeItem("TravelerRegister")
            navigate("/login")
        }catch(error){
            setErr("Somthing went wrong. Please try again"+ error.message)
        }
    }
    
    return(

         <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">

            <div className="absolute left-[80px]">

                <img src="/main_logo.png" alt="main_logo.png"/>

            </div>

            <div className="w-[500px] h-[380px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center">
                
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as a Traveler</h1>
                {err && (
                    <div className="text-[12px] text-[#9E4444]">
                        {err}
                    </div>
                )}

                <div className="w-full flex justify-between items-center p-[30px] mt-[10px]">

                    <div className="w-[110px]">

                        <h2 className="font-bold text-[#CCD0CF] text-[16px]">Profile Photo</h2>

                        <h1 className="text-[12px] text-[#CCD0CF]/80 pt-[10px]">Upload a clear photo of yourself</h1>

                        <h1 className="text-[12px] text-[#CCD0CF]/80 pt-[10px]">JPG,PNG format Max size 2MB</h1>

                    </div>

                    <div onClick={()=> fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop} 
                    className="w-[120px] h-[120px] overflow-hidden bg-[#4A5C6A]/50 rounded-full border-2 border-dotted border-[#00C896]/50 flex flex-col justify-center items-center cursor-pointer group hover:border-[#00C896]/80 transition-all duration-300">

                        {photo ? (
                            <img
                                src={photo}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <FaCamera className="text-[#00C896]/50 text-[20px] group-hover:text-[#00C896]/80 transition-all duration-300"/>

                                <p className="text-[10px] text-[#CCD0CF]/50 mt-[5px] text-center pl-[5px] pr-[5px]">Drag & Drop your photo</p>
                                <p className="text-[10px] text-[#CCD0CF]/50 text-center">or</p>
                                <p className="text-[#00C896]/50 text-[10px] group-hover:text-[#00C896]/80 transition-all duration-300">Browse Files</p>
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
                    <div className="flex flex-col">
                        <button onClick={() => fileInputRef.current.click()} className="rounded-[20px] bg-[#4A5C6A]/50 p-[5px] text-[12px] text-[#CCD0CF] border border-[#4A5C6A]/50 hover:border-[#00C896]/80 transition-all duration-300">Change Photo</button>
                        <button onClick={handleRemovePhoto} className="rounded-[20px] bg-[#4A5C6A]/50 p-[5px] text-[12px] text-[#CCD0CF] mt-[10px] border border-[#4A5C6A]/50 hover:border-[#9E4444]/80 transition-all duration-300">Remove Photo</button>
                    </div>
                </div>
                        <button onClick={handleSignUp} className="text-[20px] font-bold w-[90%] h-[50px] flex justify-center items-center rounded-[20px] bg-[#00C896]/50 hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">Sign Up</button>
                        <button onClick={handlePrevious} className="w-[90%] h-[50px] flex justify-center items-center rounded-[20px] bg-[#4A5C6A]/50 hover:bg-[#4A5C6A]/80 transition-all duration-300 mt-[10px] hover:scale-95 text-[20px] font-bold"><GrFormPreviousLink/>Previous</button>
            </div>

         </div>

    )

}