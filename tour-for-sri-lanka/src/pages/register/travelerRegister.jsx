import { GrFormNextLink } from "react-icons/gr";
import { GrFormPreviousLink } from "react-icons/gr";
import { useState } from "react";
import Select from "react-select"
import COUNTRIES from "../../data/countryCode";
import {getExampleNumber, parsePhoneNumberFromString} from "libphonenumber-js"

export default function TravelerRegister(){
    const [country, setCountry] = useState(null)
    const [mobile,setMobile] = useState("")
    const[dialCode,setDialCode] = useState("")

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
    
    return(
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
            <div className="absolute left-[80px]">
                <img src="/main_logo.png" alt="main_logo.png"/>
            </div>
            <div className="w-[500px] h-[520px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center">
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as a Traveler</h1>
                <div className="mt-[20px] w-[500px] flex justify-evenly">
                    <input placeholder="First Name" className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/>
                    <input placeholder="Last Name" className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/>
                </div>
                <div className="w-[500px] h-full mt-[10px] flex flex-col items-center">
                    <input type="email" placeholder="E-Mail" className="w-[465px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/>
                    <input type="password" placeholder="Password" className="w-[465px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] mt-[10px]"/>
                    <input type="password" placeholder="Confirm Password" className="w-[465px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] mt-[10px]"/>
                    <input placeholder="Passport Number/NIC" className="w-[465px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] mt-[10px]"/>

                    <div className="mt-[10px] w-full flex justify-evenly">
                        <div className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px]">
                            <Select
                                options={options}
                                value={country}
                                onChange={handleCountryChange}
                                placeholder="Country"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: "50px",
                                        borderRadius: "20px",
                                        backgroundColor: "#4A5C6A80",
                                        border: "none",
                                        boxShadow: "none",
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
                                    setMobile(value)}
                                }
                                className="w-[225px] h-[50px] bg-[#4A5C6A80] rounded-[20px] text-[12px] pl-[70px] text-[#CCD0CF]"
                            />
                        </div>
                        {/* <input placeholder="Mobile" className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/> */}
                    </div>
                    <div className="mt-[20px] w-full flex justify-evenly">
                        <button className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95"><GrFormPreviousLink className="font-bold text-[20px]"/>Previous</button>
                        <button className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">Next <GrFormNextLink className="font-bold text-[20px]"/></button>
                    </div>
                </div>
            </div>
        </div>
    )
}