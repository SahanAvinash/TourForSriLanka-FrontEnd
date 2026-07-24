import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useState } from "react";
import Select from "react-select"
import COUNTRIES from "../../../data/countryCode";
import { useNavigate } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";

export default function HotelOwnerRegister(){
    const navigate = useNavigate()

    const role = sessionStorage.getItem("role")
    const [checkingEmail,setCheckingEmail] = useState(false)

    const [country, setCountry] = useState(null)
    const [mobile,setMobile] = useState("")
    const[dialCode,setDialCode] = useState("")
    
    const [firstName,setFirstName] = useState("")
    const [lastName,setLastName] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [confirmPassword,setConfirmPassword] = useState("")
    const [NIC,setNIC] = useState("")

    const [err,setErr] = useState("")

    const [showPassword,setShowPassword] = useState(false)
    const [showConfirmPassword,setShowConfirmPassword] = useState(false)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const nicRegex = /^(([0-9]{9}[vVxX])|([0-9]{12}))$/
    const passportRegex = /^[A-Za-z0-9]{6,9}$/

    const options = COUNTRIES.map((c) => ({
        label: `${c.flag} ${c.name}`,
        value: c.code,
    }))    
    const handleCountryChange = (selected) => {
        setCountry(selected)

        const found = COUNTRIES.find(
            (c) => c.code === selected.value
        )
        if(found){
            setDialCode(found.dial)
            setMobile("")
        }
    }

    const handleNext = async () =>{
        if(!firstName || !lastName || !email || !password || !confirmPassword || !country || !mobile){
            setErr("Please fill all required fields")
            return;
        }
        if (password !== confirmPassword){
            setErr("Password do not matched")
            return
        }
        if(!emailRegex.test(email)){
            setErr("Please enter a valid email address")
            return
        }
        if(!nicRegex.test(NIC) && !passportRegex.test(NIC)){
            setErr("Please enter a valid NIC or Passport number")
            return
        }
        if(password.length<8){
            setErr("Password must be a least 8 characters")
            return
        }

        setErr("")
        setCheckingEmail(true)

        try{
            const res = await fetch(`http://localhost:3000/api/hotel/check-email?email=${encodeURIComponent(email)}`)
            const result = await res.json()

            if(result.exists){
                setErr("This email is already registered")
                setCheckingEmail(false)
                return
            }
        } catch (error){
            setErr("Could not verify email, please try again")
            setCheckingEmail(false)
            return
        }
        setCheckingEmail(false)

        const oldData = JSON.parse(sessionStorage.getItem("HotelOwnerRegister"))|| {}
        const formData = {
            ...oldData,
            role,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            NIC,
            country: country?.label,
            mobile: dialCode ? `${dialCode}${mobile}` : mobile
        }
        sessionStorage.setItem("HotelOwnerRegister",JSON.stringify(formData))
        navigate("/hotelinformation")
    }
    useEffect(()=>{
        const saved = sessionStorage.getItem("HotelOwnerRegister")
        if(saved){
            const data = JSON.parse(saved)

            setFirstName(data.firstName || "");
            setLastName(data.lastName || "");
            setEmail(data.email || "");
            setPassword(data.password || "");
            setConfirmPassword(data.confirmPassword || "");
            setNIC(data.NIC || "");
            
            if(data.country){
                const match = options.find(o => o.label === data.country)
                setCountry(match || null)

                if(data.mobile){
                    const foundCountry = COUNTRIES.find(c => c.code === match?.value)
                    if(foundCountry && data.mobile.startsWith(foundCountry.dial)){
                        setDialCode(foundCountry.dial)
                        setMobile(data.mobile.slice(foundCountry.dial.length))
                    } else {
                        setMobile(data.mobile)
                    }
                }
            } else if(data.mobile){
                setMobile(data.mobile)
            }
        }
    },[])
    const handlePrevious = () =>{
        const oldData = JSON.parse(sessionStorage.getItem("HotelOwnerRegister"))|| {}
        const formData = {
            ...oldData,
            role,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            NIC,
            country: country?.label,
            mobile: dialCode ? `${dialCode}${mobile}` : mobile
        }
        sessionStorage.setItem("HotelOwnerRegister",JSON.stringify(formData))
        navigate(-1)
    }
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
                                    <div className="w-[30px] h-[30px] rounded-full bg-[#4A5C6A]/80 flex items-center justify-center">
                                        <span className="text-[#CCD0CF] text-[12px]">2</span>
                                    </div>
                                    <span className="mt-2 text-[#CCD0CF] text-[12px] text-center leading-4">Hotel Information</span>
                                </div>
                                <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                                    <div className="flex flex-col items-center w-[70px]">
                                        <div className="w-[30px] h-[30px] rounded-full bg-[#4A5C6A]/80 flex items-center justify-center">
                                            <span className="text-[#CCD0CF] text-[12px]">3</span>
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
            <div className="w-[500px] h-[540px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center">
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as a Hotel Owner</h1>
                {err && (
                    <div className="text-[#9E4444] text-[12px]">
                        {err}
                    </div>
                )}
                <div className="mt-[20px] w-[500px] flex justify-evenly">
                    <input placeholder="First Name" value={firstName} onChange={(e)=> setFirstName(e.target.value.replace(/[^a-zA-Z]/g, ""))} className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/>
                    <input placeholder="Last Name" value={lastName} onChange={(e)=> setLastName(e.target.value.replace(/[^a-zA-Z]/g,""))} className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/>
                </div>
                <div className="w-[500px] h-full mt-[10px] flex flex-col items-center">
                    <input type="email" value={email} placeholder="E-Mail" onChange={(e)=> setEmail(e.target.value)} className="w-[465px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/>
                    <div className="flex flex-col relative w-[465px]">
                        <input type={showPassword? "text" : "password"} value={password} placeholder="Password" onChange={(e)=> setPassword(e.target.value)} className="w-[465px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] mt-[10px]"/>
                        {showPassword ? (
                            <IoEye className="absolute right-[30px] top-1/2 cursor-pointer" onClick={()=>setShowPassword(false)}/>
                        ) : (
                            <FaEyeSlash className="absolute right-[30px] top-1/2 cursor-pointer" onClick={()=>setShowPassword(true)}/>
                        )}
                    </div>
                    <div className="flex flex-col relative w-[465px]">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} placeholder="Confirm Password" onChange={(e)=> setConfirmPassword(e.target.value)} className="w-[465px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] mt-[10px]"/>
                        {showConfirmPassword ? (
                            <IoEye className="absolute right-[30px] top-1/2 cursor-pointer" onClick={()=>setShowConfirmPassword(false)}/>
                        ) : (
                            <FaEyeSlash className="absolute right-[30px] top-1/2 cursor-pointer" onClick={()=>setShowConfirmPassword(true)}/>
                        )}
                    </div>
                    <input  placeholder="Passport Number/NIC" value={NIC} onChange={(e)=> setNIC(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0,12).toUpperCase())} className="w-[465px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] mt-[10px]"/>

                    <div className="mt-[10px] w-full flex justify-evenly">
                        <div className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px]">
                            <Select
                                options={options}
                                value={country}
                                onChange={handleCountryChange}
                                placeholder="Country"
                                menuPosition="fixed"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: "50px",
                                        borderRadius: "20px",
                                        backgroundColor: "#4A5C6A80",
                                        border: "none",
                                        boxShadow: "none",
                                    }),
                                     option: (base,state) =>({
                                        ...base,
                                        backgroundColor:state.isFocused
                                            ? "#00C896"
                                            : "#4A5C6A",
                                        color : "#CCD0CF",
                                        cursor : "pointer",
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: "#4A5C6A",
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                        paddingLeft:"10px"
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                        opacity: 0.5,
                                        paddingLeft:"10px"
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                    }),
                                }}
                            />
                        </div>
                        <div className="bg-[#4A5C6A80] w-[225px] h-[50px] rounded-[20px] flex items-center">
                            <div className="absolute pl-[20px] text-[12px] text-[#CCD0CF]"> 
                                {dialCode || "+"}
                            </div>
                            <input
                                type="text"
                                placeholder="Mobile"
                                value={mobile}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "")
                                    if(country && validatePhoneNumberLength(value, country.value) === "TOO_LONG"){
                                        return
                                    }
                                    setMobile(value)}
                                }
                                className="w-[225px] h-[50px] bg-[#4A5C6A80] rounded-[20px] text-[12px] pl-[70px] text-[#CCD0CF]"
                            />
                        </div>
                    </div>
                    <div className="mt-[20px] w-full flex justify-evenly">
                        <button onClick={handlePrevious} className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95 cursor-pointer"><GrFormPreviousLink className="font-bold text-[20px]" />Previous</button>
                        <button onClick={handleNext} disabled={checkingEmail} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105 cursor-pointer">
    {checkingEmail ? "Checking..." : (<>Next <GrFormNextLink className="font-bold text-[20px]"/></>)}
</button>
                    </div>
                </div>
            </div>
        </div>
    )
}