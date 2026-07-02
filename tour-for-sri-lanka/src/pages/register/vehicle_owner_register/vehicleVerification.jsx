import { useState } from "react";
import { FaCheck, FaUpload } from "react-icons/fa";


export default function VehicleVerification(){
const [err,setErr] = useState(null)

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
            <div className="w-[500px] h-[560px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center">
                        <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as a Vehicle Owner</h1>
                        {err && (
                            <div className="text-[#9E4444] text-[12px]">
                                {err}
                            </div>
                        )}
                        <div className="flex justify-evenly w-full mt-[20px]">
                            <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                                <span className="font-bold">Driving License<br/></span>
                                <span className="text-[10px] opacity-[0.5]">Upload Your Driving License Certificate</span>
                                <div className="w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center">
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">Click to Upload<br/>or Drag and Drop<br/>PDF,JPG or PNG (Max 2MB)</span>
                                </div>
                            </div>
                            <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                                <span className="font-bold">Driving License<br/></span>
                                <span className="text-[10px] opacity-[0.5]">Upload Your Driving License Certificate</span>
                                <div className="w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center">
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">Click to Upload<br/>or Drag and Drop<br/>PDF,JPG or PNG (Max 2MB)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-evenly w-full mt-[20px]">
                            <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                                <span className="font-bold">Driving License<br/></span>
                                <span className="text-[10px] opacity-[0.5]">Upload Your Driving License Certificate</span>
                                <div className="w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center">
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">Click to Upload<br/>or Drag and Drop<br/>PDF,JPG or PNG (Max 2MB)</span>
                                </div>
                            </div>
                            <div className="w-[210px] h-[135px] bg-[#4A5C6A]/50 rounded-[20px] text-[12px] p-[10px] text-[#CCD0CF]">
                                <span className="font-bold">Driving License<br/></span>
                                <span className="text-[10px] opacity-[0.5]">Upload Your Driving License Certificate</span>
                                <div className="w-full h-[80px] border-2 border-[#CCD0CF]/50 border-dotted rounded-[20px] flex flex-col justify-center items-center text-[10px] text-center">
                                    <FaUpload className="text-[#00C896]/80"/>
                                    <span className="opacity-[0.5]">Click to Upload<br/>or Drag and Drop<br/>PDF,JPG or PNG (Max 2MB)</span>
                                </div>
                            </div>
                        </div>
            </div>
        </div>
    )
}