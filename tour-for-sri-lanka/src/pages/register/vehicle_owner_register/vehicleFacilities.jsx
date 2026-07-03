import { FaCheck } from "react-icons/fa";
import Select from "react-select"
import { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa6";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

export default function VehicleFacilities(){
    const navigate = useNavigate()

    const [passengerCapacity,setPassengerCapacity] = useState(null)
    const [luggageCapacity,setLuggageCapacity] = useState(null)
    const [fuelType,setFuelType] = useState(null)

    const [availableArea,setAvailableArea] = useState([])

    const [photos,setPhotos] = useState([])

    const [err,setErr] = useState(null)

    const luggageByVehicle = {
        car: [
            { value: 1, label: "Small (1 bag)" },
            { value: 2, label: "Medium (2 bags)" }
        ],
        van: [
            { value: 2, label: "Medium (2–4 bags)" },
            { value: 3, label: "Large (5–8 bags)" }
        ],
        bus: [
            { value: 3, label: "Medium storage" },
            { value: 4, label: "Large storage" }
        ],
        jeep: [
            { value: 1, label: "Small (1–2 bags)" }
        ]
    };
    const fuelTypes = [
        {value: "petrole", label: "Petrole"},
        {value: "diesel", label: "Diesel"},
        {value: "electric", label: "Electric"}
    ]    
    const districts = [
        { value: "ampara", label: "Ampara" },
        { value: "anuradhapura", label: "Anuradhapura" },
        { value: "badulla", label: "Badulla" },
        { value: "batticaloa", label: "Batticaloa" },
        { value: "colombo", label: "Colombo" },
        { value: "galle", label: "Galle" },
        { value: "gampaha", label: "Gampaha" },
        { value: "hambantota", label: "Hambantota" },
        { value: "jaffna", label: "Jaffna" },
        { value: "kalutara", label: "Kalutara" },
        { value: "kandy", label: "Kandy" },
        { value: "kegalle", label: "Kegalle" },
        { value: "kilinochchi", label: "Kilinochchi" },
        { value: "kurunegala", label: "Kurunegala" },
        { value: "mannar", label: "Mannar" },
        { value: "matale", label: "Matale" },
        { value: "matara", label: "Matara" },
        { value: "monaragala", label: "Monaragala" },
        { value: "mullaitivu", label: "Mullaitivu" },
        { value: "nuwara-eliya", label: "Nuwara Eliya" },
        { value: "polonnaruwa", label: "Polonnaruwa" },
        { value: "puttalam", label: "Puttalam" },
        { value: "ratnapura", label: "Ratnapura" },
        { value: "trincomalee", label: "Trincomalee" },
        { value: "vavuniya", label: "Vavuniya" },
    ]
    const maxPassengers = {
        car: 7,
        van: 15,
        bus: 60,
        jeep: 8
    }
    const vehicleData = JSON.parse(
        sessionStorage.getItem("VehicleOwnerRegister")
    )
    const vehicleType = vehicleData?.vehicleType?.value?.toLowerCase()
    const luggageOptions = luggageByVehicle[vehicleType] || []

    const max = maxPassengers[vehicleType] || 0

    const capacityOptions = Array.from({
        length: max},(_, i) => ({
        value: i + 1,
        label: `${i + 1}`
    }))

    const handlePhotoChange = async (e) => {
        const files = Array.from(e.target.files || [])

        const newFiles = files.filter((file) => {
            return !photos.some((photo) => photo.name === file.name)
        })
        if(newFiles.length !== files.length){
            setErr("This photo has already been selected")
            e.target.value = ""
            return
        }
        if(photos.length + newFiles.length > 5){
            setErr("You can upload a maximum of 5 photos")
            e.target.value = ""
            return
        }
        setErr("")
        e.target.value =""

        for(const file of newFiles){
            const tempEntry = {name: file.name, url:null, uploading:true}
            setPhotos((prev) => [...prev, tempEntry])

            try{
                const uploadFormData = new FormData()
                uploadFormData.append("photo",file)

                const res = await fetch("http://localhost:3000/api/transport/upload-photo",{
                    method: "POST",
                    body: uploadFormData
                })
                const result = await res.json()

                if(!res.ok){
                    setErr(result.error || "Photo upload failed")
                    setPhotos((prev) => prev.filter((p) => p.name !== file.name))
                    continue
                }
                setPhotos((prev) =>
                    prev.map((p) =>
                        p.name === file.name ? {...p, url: result.url, uploading: false} : p
                    )
                )
            }catch(error){
                setErr("Photo upload failed, please try again later")
                setPhotos((prev) => prev.filter((p) => p.name !== file.name))
            }
        }
    }

    const removePhoto = (index) =>{
        setPhotos((prev) => prev.filter((_,i) => i !== index))
        setErr("")
    }

    const handlePrevious = () =>{
        const previousData = JSON.parse(
            sessionStorage.getItem("VehicleOwnerRegister") || "{}"
        )
        const formData = {
            ...previousData,
            availableArea,
            passengerCapacity,
            luggageCapacity,
            fuelType,
            addVehiclePhotos: photos.filter(p => p.url).map(p => p.url)
        }
        sessionStorage.setItem(
            "VehicleOwnerRegister",
            JSON.stringify(formData)
        )
        navigate(-1)
    }
    const handleNext = () => {
        if(availableArea.length === 0 || !passengerCapacity || !luggageCapacity || !fuelType || photos.length === 0){
            setErr("Please fill all required fields")
            return;
        }
        if(photos.some(p => p.uploading)){
            setErr("Please wait,photos are still uploading")
            return
        }
        const oldData = JSON.parse(sessionStorage.getItem("VehicleOwnerRegister")) || {}
        const formData = {
            ...oldData,

            availableArea,
            passengerCapacity,
            luggageCapacity,
            fuelType,
            addVehiclePhotos: photos.filter(p => p.url).map(p => p.url)
        }
        sessionStorage.setItem("VehicleOwnerRegister",JSON.stringify(formData))
        navigate("/vehicleverification")
    }

    useEffect(()=>{
        const data = JSON.parse(sessionStorage.getItem("VehicleOwnerRegister")||"{}")

        setPassengerCapacity(data.passengerCapacity || null)
        setLuggageCapacity(data.luggageCapacity || null)
        setFuelType(data.fuelType || null)
        setAvailableArea(data.availableArea || [])

        if(data.addVehiclePhotos && data.addVehiclePhotos.length > 0){
            setPhotos(
                data.addVehiclePhotos.map((url) => ({
                    name: url.split("/").pop(),
                    url,
                    uploading: false
                }))
            )
        }
    },[])

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
                            <span className="text-[#CCD0CF] text-[12px]">3</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Facilities</span>
                    </div>
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
                <h1 className="text-[25px] mt-[20px] font-bold text-[#CCD0CF]">Sign up as a Vehicle Owner</h1>
                {err && (
                    <p className="text-[#9E4444] text-[12px] mt-2">
                        {err}
                    </p>
                )}
                <div className="mt-[20px] w-[500px] flex justify-center text-[12px]">
                    <Select
                        options={districts}
                        isMulti
                        value={availableArea}
                        onChange={(selected) => {
                            setAvailableArea(selected || [])
                        }}
                        placeholder="Available Districts"
                        styles={{
                            control : (base) => ({
                            ...base,
                            width:"465px",
                            minHeight: "50px",
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
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: "#00C896",
                            opacity: 0.8,
                            borderRadius: "10px"
                        }),
                        multiValueLabel: (base) =>({
                            ...base,
                            color:"#CCD0CF",
                            fontWeight: "600"
                        }),
                        multiValueRemove: (base) => ({
                            ...base,
                            color : "#CCD0CF",
                            ":hover": {
                                backgroundColor:"#00A87A",
                                borderRadius: "10px",
                                color: "white"
                            }
                        })
                        }}
                    />
                </div>
                <div className="w-[465px] h-[110px] bg-[#4A5C6A]/50 rounded-[20px] mt-[20px]">
                        <div className="w-full h-full flex items-center justify-between">
                            <div className="p-[20px]">
                                <div className="text-[#CCD0CF]/80 text-[12px] mb-[10px] text-center">
                                    Passenger <br/> Capacity
                                </div>
                                <Select 
                                    options={capacityOptions}
                                    value={passengerCapacity}
                                    onChange={setPassengerCapacity}
                                    placeholder="0"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            width: "70px",
                                            height: "20px",
                                            borderRadius: "10px",
                                            backgroundColor: "#4A5C6A80",
                                            border: "none",
                                            boxShadow: "none",
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: "#4A5C6A",
                                            fontSize: "12px"
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
                                            opacity: "50px",
                                            paddingLeft: "10px",
                                            fontSize: "12px"
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: "#CCD0CF",
                                            opacity: 0.5,
                                            paddingLeft: "10px",
                                            fontSize: "12px"
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: "#CCD0CF",
                                        }),
                                        dropdownIndicator: (base) =>({
                                            ...base,
                                            padding: "2px",
                                            svg:{
                                                width : "14px",
                                                height:"14px"
                                            }
                                        })
                                    }}
                                />
                            </div>
                            <div className="p-[20px]">
                                <div className="text-[#CCD0CF]/80 text-[12px] mb-[10px] text-center">
                                    Luggage <br/> Capacity
                                </div>
                                <Select 
                                    options={luggageOptions}
                                    value={luggageCapacity}
                                    onChange={setLuggageCapacity}
                                    placeholder="Select"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            width: "180px",
                                            height: "20px",
                                            borderRadius: "10px",
                                            backgroundColor: "#4A5C6A80",
                                            border: "none",
                                            boxShadow: "none",
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: "#4A5C6A",
                                            fontSize: "12px"
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
                                            opacity: "0.8",
                                            paddingLeft: "10px",
                                            fontSize: "12px"
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: "#CCD0CF",
                                            opacity: 0.5,
                                            paddingLeft: "10px",
                                            fontSize: "12px"
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: "#CCD0CF",
                                        }),
                                        dropdownIndicator: (base) =>({
                                            ...base,
                                            padding: "2px",
                                            svg:{
                                                width : "14px",
                                                height:"14px"
                                            }
                                        })
                                    }}
                                />
                            </div>
                            <div className="p-[20px]">
                                <div className="text-[#CCD0CF]/80 text-[12px] mb-[10px] text-center">
                                    Fuel <br/> Type
                                </div>
                                <Select 
                                    options={fuelTypes}
                                    value={fuelType}
                                    onChange={setFuelType}
                                    placeholder="Select"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            width: "100px",
                                            height: "20px",
                                            borderRadius: "10px",
                                            backgroundColor: "#4A5C6A80",
                                            border: "none",
                                            boxShadow: "none",
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: "#4A5C6A",
                                            fontSize: "12px"
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
                                            opacity: "0.8",
                                            paddingLeft: "10px",
                                            fontSize: "12px"
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: "#CCD0CF",
                                            opacity: 0.5,
                                            paddingLeft: "10px",
                                            fontSize: "12px"
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            color: "#CCD0CF",
                                        }),
                                        dropdownIndicator: (base) =>({
                                            ...base,
                                            padding: "2px",
                                            svg:{
                                                width : "14px",
                                                height:"14px"
                                            }
                                        })
                                    }}
                                />
                            </div>
                        </div>
                </div>
                <input 
                    type="file"
                    id="vehiclePhotos"
                    multiple
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handlePhotoChange}
                />
                <label htmlFor="vehiclePhotos" className="w-[465px] h-[150px] bg-[#4A5C6A]/50 rounded-[20px] mt-[20px] p-[10px] flex flex-col cursor-pointer">
                    <span className="text-[12px] font-bold text-[#CCD0CF] ">Add Vehicle Photos</span>
                    <span className="text-[12px] text-[#CCD0CF]/80">Upload Your Photos</span>
                    <div className="w-full h-full p-[10px] flex">
                        <div className="w-full h-full rounded-[10px] border-2 border-dotted border-[#CCD0CF]/50 p-2">
                        {photos.length === 0 ? (
                            <div className="w-full h-full flex flex-col justify-center items-center">
                            <FaUpload className="text-[#00C896]/80 text-2xl" />
                            <span className="text-[10px] text-[#CCD0CF]/50 text-center">
                                Click to Upload <br />
                                or Drag and Drop <br />
                                JPG or PNG (Max 5MB)
                            </span>
                        </div>
                        ) : (
                            <div className="grid grid-cols-5 gap-2 h-full">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative w-[65px] h-[65px]">
                                        {photo.uploading ? (
                                            <div className="w-[65px] h-[65px] rounded-lg bg-[#4A5C6A] flex items-center justify-center text-[8px] text-[#CCD0CF]/80">
                                                Uploading...
                                            </div>
                                        ) : (
                                                <img
                                                    src={photo.url}
                                                    alt={`preview-${index}`}
                                                    className="w-[65px] h-[65px] object-cover rounded-lg"
                                                />
                                        )}
                                        
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                removePhoto(index)
                                            }}
                                            className="absolute bottom-[50px] left-[50px] w-[20px] h-[20px] rounded-full bg-[#4A5C6A] hover:bg-[#9E4444] hover:text-[#CCD0CF]/80 text-[#CCD0CF]/50 text-[12px] flex items-center justify-center transition-all duration-300"
                                        >x</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    </div>
                </label>
                <div className="mt-[20px] w-full flex justify-evenly">
                    <button onClick={handlePrevious} className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95"><GrFormPreviousLink className="font-bold text-[20px]" />Previous</button>
                    <button onClick={handleNext} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">Next <GrFormNextLink className="font-bold text-[20px]"/></button>
                </div>
            </div>
        </div>
                             
    )
}