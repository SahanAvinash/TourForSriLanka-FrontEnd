import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select"
import COUNTRIES from "../../../data/countryCode";
import { useNavigate } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { Navigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

export default function VehicleOwnerInformation(){

    const navigate = useNavigate()
    const [err,setErr] = useState()
    const [vehicleType,setVehicleType] = useState(null)
    const [vehicleBrand,setVehicleBrand] = useState(null)
    const [vehicleModel,setVehicleModel] = useState(null)

    const [shortDescription,setShortDescription] = useState("")
    const [registrationNo,setRegistrationNo] = useState("")
    const [manufactureYear,setManufactureYear] = useState(null)
    const [chassisNumber,setChassisNumber] = useState("")
    const [vehicleColor, setVehicleColor] = useState(null)

    const years = Array.from({length : 50}, (_,i) =>{
        const year = new Date().getFullYear() - i
        return {value: year, label : year.toString()}
    })
    const vehicleColors = [
    { value: "white", label: "White" },
    { value: "black", label: "Black" },
    { value: "silver", label: "Silver" },
    { value: "gray", label: "Gray" },
    { value: "blue", label: "Blue" },
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "yellow", label: "Yellow" },
    { value: "orange", label: "Orange" },
    { value: "brown", label: "Brown" },
    { value: "gold", label: "Gold" },
    { value: "beige", label: "Beige" },
    { value: "purple", label: "Purple" },
    { value: "pink", label: "Pink" },
    { value: "Maroon", label: "Maroon" },
    { value: "Other", label: "Other" }
]
    const vehicleTypes = [
        {value : "car", label : "Car"},
        {value : "van", label : "Van"},
        {value : "bus", label : "Bus"},
        {value : "jeep", label : "Jeep"}
    ]
    const vehicleBrands = {
        car : [
            { value: "toyota", label: "Toyota" },
            { value: "nissan", label: "Nissan" },
            { value: "suzuki", label: "Suzuki" },
            { value: "mitsubishi", label: "Mitsubishi" },
            { value: "hyundai", label: "Hyundai" },
            { value: "honda", label: "Honda" },
            { value: "mazda", label: "Mazda" },
            { value: "kia", label: "Kia" },
            { value: "isuzu", label: "Isuzu" },
            { value: "bmw", label: "BMW" },
            { value: "mercedes_benz", label: "Mercedes-Benz" },
            { value: "audi", label: "Audi" }
        ],
        van : [
            { value: "toyota", label: "Toyota" },
            { value: "nissan", label: "Nissan" },
            { value: "hyundai", label: "Hyundai" },
            { value: "mitsubishi", label: "Mitsubishi" },
            { value: "kia", label: "Kia" },
            { value: "ford", label: "Ford" },
        ],
        bus : [
            { value: "toyota", label: "Toyota" },
            { value: "mitsubishi", label: "Mitsubishi" },
            { value: "isuzu", label: "Isuzu" },
            { value: "ashok_leyland", label: "Ashok Leyland" },
            { value: "tata", label: "Tata" },
            { value: "hino", label: "Hino" },
            { value: "yutong", label: "Yutong" },
        ],
        jeep : [
            { value: "toyota", label: "Toyota" },
            { value: "mitsubishi", label: "Mitsubishi" },
            { value: "jeep", label: "Jeep" },
            { value: "land_rover", label: "Land Rover" },
            { value: "ford", label: "Ford" },
            { value: "mahindra", label: "Mahindra" },
            { value: "nissan", label: "Nissan" },
            { value: "suzuki", label: "Suzuki" },
        ]
    }
    const vehicleModels = {
        car : {
            toyota : ["Corolla","Prius","Axio","Alilion","Vitz"],
            nissan: ["Sunny", "X-Trail", "March", "Note"],
            suzuki: ["Swift", "Alto", "Wagon R"],
            mitsubishi: ["Lancer", "Pajero"],
            hyundai: ["Elantra", "i10"],
            honda: ["Civic", "Fit"],
            mazda: ["Axela", "Demio"],
            bmw: ["X5", "X3"],
            mercedes_benz: ["C-Class", "E-Class"],
            audi: ["A4", "Q5"]
        },
        van : {
            toyota: ["Hiace", "KDH", "Regius Ace"],
            nissan: ["Caravan", "NV350"],
            mitsubishi: ["L300", "Delica"],
            kia: ["Pregio"],
            ford: ["Transit"]
        },
        jeep : {
            toyota: ["Prado", "Land Cruiser", "Fortuner"],
            mitsubishi: ["Pajero"],
            land_rover: ["Defender", "Discovery"],
            ford: ["Everest"],
            mahindra: ["Thar"],
            nissan: ["Patrol"],
            suzuki: ["Jimny"],
            jeep: ["Wrangler"]
        },

        bus : {
            isuzu: ["Elf Bus", "Journey"],
            toyota: ["Coaster"],
            tata: ["LP Bus"],
            hino: ["Melpha"],
            yutong: ["ZK6122"],
            ashok_leyland: ["Falcon"]
        }  
    }
     const brandOption = useMemo(() => {
        return vehicleType ? vehicleBrands[vehicleType.value] : []
     },[vehicleType])

    const modelOptions = useMemo(() => {
        if(!vehicleType || !vehicleBrand) return []
        return vehicleModels?.[vehicleType.value]?.[vehicleBrand.value]?? []
    },[vehicleType,vehicleBrand])

    useEffect(()=>{
        const saved = sessionStorage.getItem("VehicleOwnerRegister")

        if(saved){
            const data = JSON.parse(saved)

            setVehicleType(data.vehicleType || null)
            setVehicleBrand(data.vehicleBrand || null)
            setVehicleModel(data.vehicleModel || null)
            setShortDescription(data.shortDescription || "")
            setRegistrationNo(data.registrationNo || "")
            setManufactureYear(data.manufactureYear || null)
            setChassisNumber(data.chassisNumber || "")
            setVehicleColor(data.vehicleColor || null)
        }
    },[])

    const handlePrevious = () =>{
        const oldData = JSON.parse(sessionStorage.getItem("VehicleOwnerRegister")) || {}

        const formData = {
            ...oldData,

            vehicleType,
            vehicleBrand,
            vehicleModel,
            shortDescription,
            registrationNo,
            manufactureYear,
            chassisNumber,
            vehicleColor
        }
        sessionStorage.setItem("VehicleOwnerRegister",JSON.stringify(formData))
        navigate(-1)
    }
    const handleNext = () => {
        if(!vehicleType || !vehicleBrand || !vehicleModel || !shortDescription || !registrationNo || !manufactureYear || !chassisNumber || !vehicleColor){
            setErr("Please fill all required fields")
            return;
        }
        const oldData = JSON.parse(sessionStorage.getItem("VehicleOwnerRegister")) || {}
        const formData = {
            ...oldData,

            vehicleType,
            vehicleBrand,
            vehicleModel,
            shortDescription,
            registrationNo,
            manufactureYear,
            chassisNumber,
            vehicleColor
        }
        sessionStorage.setItem("VehicleOwnerRegister",JSON.stringify(formData))
        navigate("/vehiclefacilities")
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
                                    <div className="w-[30px] h-[30px] rounded-full bg-[#00C896]/80  flex items-center justify-center">
                                        <span className="text-[#CCD0CF] text-[12px]">2</span>
                                    </div>
                                    <span className="mt-2 text-[#CCD0CF] text-[12px] text-center leading-4">Vehicle Information</span>
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
                    <div className="w-[500px] h-[560px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center">
                        <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as a Vehicle Owner</h1>
                        {err && (
                            <div className="text-[#9E4444] text-[12px]">
                                {err}
                            </div>
                        )}
                        <div className="mt-[20px] w-[500px] flex justify-center text-[12px]">
                            <Select
                                options={vehicleTypes}
                                value={vehicleType}
                                onChange={(selected) => {
                                    setVehicleType(selected)
                                    setVehicleBrand(null)
                                    setVehicleModel(null)
                                }}
                                placeholder="Vehicle Type"
                                styles={{
                                    control : (base) => ({
                                        ...base,
                                        width:"465px",
                                        height: "50px",
                                        borderRadius: "20px",
                                        backgroundColor: "#4A5C6A80",
                                        border:"none",
                                        boxShadow: "none"
                                    }),
                                    menu : (base) =>({
                                        ...base,
                                        backgroundColor:"#4A5C6A",
                                    }),
                                    option: (base,state) =>({
                                        ...base,
                                        backgroundColor:state.isFocused
                                            ? "#00C896"
                                            : "#4A5C6A",
                                        color : "#CCD0CF",
                                        cursor : "pointer",
                                    }),
                                    singleValue: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                        paddingLeft: "10px",
                                    }),
                                    placeholder: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                        opacity: 0.5,
                                        paddingLeft: "10px"
                                    }),
                                    input: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                    }),
                                }}
                            />
                        </div>
                        <div className="w-[465px] mt-[20px] flex justify-between text-[12px]">
                            <Select
                                options={brandOption}
                                value={vehicleBrand}
                                onChange={(selected) =>{
                                    setVehicleBrand(selected)
                                    setVehicleModel(null)
                                }}
                                placeholder="Vehicle Brand"
                                isDisabled={!vehicleType}
                                styles={{
                                    control : (base) => ({
                                        ...base,
                                        width:"225px",
                                        height: "50px",
                                        borderRadius: "20px",
                                        backgroundColor: "#4A5C6A80",
                                        border:"none",
                                        boxShadow: "none"
                                    }),
                                    menu : (base) =>({
                                        ...base,
                                        backgroundColor:"#4A5C6A",
                                    }),
                                    option: (base,state) =>({
                                        ...base,
                                        backgroundColor:state.isFocused
                                            ? "#00C896"
                                            : "#4A5C6A",
                                        color : "#CCD0CF",
                                        cursor : "pointer",
                                    }),
                                    singleValue: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                        paddingLeft: "10px",
                                    }),
                                    placeholder: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                        opacity: 0.5,
                                        paddingLeft: "10px"
                                    }),
                                    input: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                    }),
                                }}
                            />
                            <Select
                                options={modelOptions.map(m => ({ value : m ,label: m}))}
                                value={vehicleModel}
                                onChange={setVehicleModel}
                                placeholder="Vehicle Model"
                                isDisabled={!vehicleBrand}
                                styles={{
                                    control : (base) => ({
                                        ...base,
                                        width:"225px",
                                        height: "50px",
                                        borderRadius: "20px",
                                        backgroundColor: "#4A5C6A80",
                                        border:"none",
                                        boxShadow: "none"
                                    }),
                                    menu : (base) =>({
                                        ...base,
                                        backgroundColor:"#4A5C6A",
                                    }),
                                    option: (base,state) =>({
                                        ...base,
                                        backgroundColor:state.isFocused
                                            ? "#00C896"
                                            : "#4A5C6A",
                                        color : "#CCD0CF",
                                        cursor : "pointer",
                                    }),
                                    singleValue: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                        paddingLeft: "10px",
                                    }),
                                    placeholder: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                        opacity: 0.5,
                                        paddingLeft: "10px"
                                    }),
                                    input: (base) =>({
                                        ...base,
                                        color: "#CCD0CF",
                                    }),
                                }}
                            />
                        </div>
                        <div className="mt-[20px]">
                            <div className="relative w-[465px]">
                                <textarea placeholder="Short descreption" value={shortDescription} maxLength={200} onChange={(e)=> setShortDescription(e.target.value)} className="resize-none overflow-hidden w-[465px] h-[100px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pt-[10px]"/>
                                <div className="text-[10px] text-[#CCD0CF]/60 w-[465px] bottom-3 right-3 flex justify-end absolute">
                                    {shortDescription?.length || 0} / 200
                                </div>
                            </div>
                        </div>
                        <div className="mt-[20px] gap-[10px] text-[12px] flex justify-between items-center">
                            <input placeholder="Registration No" value={registrationNo} onChange={(e)=> setRegistrationNo(e.target.value)} className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/>
                            <Select 
                                options={years}
                                value={manufactureYear}
                                onChange={setManufactureYear}
                                placeholder="Manufacture Year"
                                isDisabled={!vehicleModel}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        width: "225px",
                                        height: "50px",
                                        borderRadius: "20px",
                                        backgroundColor: "#4A5C6A80",
                                        border: "none",
                                        boxShadow: "none",
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: "#4A5C6A",
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
                                        color: "#CCD0CF",
                                        cursor: "pointer",
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                        paddingLeft: "10px",
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                        opacity: 0.5,
                                        paddingLeft: "10px",
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                    })
                                }}
                            />
                            
                        </div>
                        <div className="mt-[20px] gap-[10px] text-[12px] flex justify-between items-center">
                            <input placeholder="Chassis Number" value={chassisNumber} onChange={(e)=> setChassisNumber(e.target.value)} className="w-[225px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"/>
                            <Select 
                                options={vehicleColors}
                                value={vehicleColor}
                                onChange={setVehicleColor}
                                placeholder="Vehicle Color"
                                isDisabled={!vehicleType}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        width: "225px",
                                        height: "50px",
                                        borderRadius: "20px",
                                        backgroundColor: "#4A5C6A80",
                                        border: "none",
                                        boxShadow: "none",
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: "#4A5C6A",
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
                                        color: "#CCD0CF",
                                        cursor: "pointer",
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                        paddingLeft: "10px",
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                        opacity: 0.5,
                                        paddingLeft: "10px",
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        color: "#CCD0CF",
                                    })
                                }}
                            />
                        </div>
                        <div className="mt-[20px] w-full flex justify-evenly">
                        <button onClick={handlePrevious} className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95"><GrFormPreviousLink className="font-bold text-[20px]" />Previous</button>
                        <button onClick={handleNext} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">Next <GrFormNextLink className="font-bold text-[20px]"/></button>
                    </div>
                    </div>
        </div>
    )
}