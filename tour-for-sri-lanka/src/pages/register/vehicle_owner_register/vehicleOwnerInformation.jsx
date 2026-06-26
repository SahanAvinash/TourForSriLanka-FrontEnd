import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select"
import COUNTRIES from "../../../data/countryCode";
import { useNavigate } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";

export default function VehicleOwnerInformation(){
    const [err,setErr] = useState()
    const [vehicleType,setVehicleType] = useState(null)
    const [vehicleBrand,setVehicleBrand] = useState(null)
    const [vehicleModel,setVehicleModel] = useState(null)

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
    return(
        <div className="w-full h-screen bg-gradient-to-r from-[#06141B] to-[#253745] flex justify-center items-center relative">
                    <div className="absolute left-[80px]">
                        <img src="/main_logo.png" alt="main_logo.png"/>
                    </div>  
                    <div className="h-full absolute left-0 w-[40%] flex left-[50px] top-[50px]">
                        <div className="flex h-[30px] items-center">
                            <div className="bg-[#00C896]/80 w-[30px] h-[30px] rounded-[50%] flex justify-center items-center">
                                <span className="text-[#CCD0CF] text-[12px]">1</span>
                            </div>
                            <div className="w-[120px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                            <div className="bg-[#00C896]/80 w-[30px] h-[30px] rounded-[50%] flex justify-center items-center">
                                <span className="text-[#CCD0CF] text-[12px]">2</span>
                            </div>
                            <div className="w-[120px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>

                            <div className="bg-[#4A5C6A]/80 w-[30px] h-[30px] rounded-[50%] flex justify-center items-center">
                                <span className="text-[#CCD0CF] text-[12px]">3</span>
                            </div>
                            <div className="w-[120px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                            <div className="bg-[#4A5C6A]/80 w-[30px] h-[30px] rounded-[50%] flex justify-center items-center">
                                <span className="text-[#CCD0CF] text-[12px]">4</span>
                            </div>
                            </div>
                    </div>
                    <div className="w-[500px] h-[540px] bg-[#253745] text-[#CCD0CF] absolute right-[10%] rounded-[20px] flex flex-col items-center">
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
                    </div>
        </div>
    )
}