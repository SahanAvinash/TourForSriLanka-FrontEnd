import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { useEffect, useState } from "react";
import Select from "react-select"
import { useNavigate } from "react-router-dom";
import { FaCheck, FaMap } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Leaflet's default marker icon paths break under most bundlers unless reset like this.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

const DEFAULT_MAP_CENTER = { lat: 6.9271, lng: 79.8612 } // Colombo, Sri Lanka

function LocationClickHandler({ onPick }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng)
        },
    })
    return null
}

function MapPickerModal({ initialPosition, onClose, onConfirm }) {
    const [position, setPosition] = useState(initialPosition || DEFAULT_MAP_CENTER)
    const [address, setAddress] = useState("")
    const [loadingAddress, setLoadingAddress] = useState(false)
    const [locating, setLocating] = useState(false)

    const reverseGeocode = async (lat, lng) => {
        setLoadingAddress(true)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            const data = await res.json()
            setAddress(data.display_name || "")
        } catch (error) {
            setAddress("")
        }
        setLoadingAddress(false)
    }

    useEffect(() => {
        reverseGeocode(position.lat, position.lng)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handlePick = (latlng) => {
        setPosition(latlng)
        reverseGeocode(latlng.lat, latlng.lng)
    }

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                setPosition(latlng)
                reverseGeocode(latlng.lat, latlng.lng)
                setLocating(false)
            },
            () => setLocating(false)
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] px-[20px]">
            <div className="w-[600px] max-w-full bg-[#253745] text-[#CCD0CF] rounded-[20px] p-[20px] flex flex-col items-center">
                <h2 className="text-[18px] font-bold mb-[10px]">Pick your hotel location</h2>

                <div className="w-full h-[350px] rounded-[15px] overflow-hidden">
                    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={position} />
                        <LocationClickHandler onPick={handlePick} />
                    </MapContainer>
                </div>

                <div className="w-full mt-[15px] text-[12px] bg-[#4A5C6A]/50 rounded-[15px] p-[10px] min-h-[40px]">
                    {loadingAddress ? "Finding address..." : (address || "Click on the map to drop a pin")}
                </div>

                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="w-full mt-[10px] text-[12px] text-left text-[#00C896]/80 underline"
                >
                    {locating ? "Locating..." : "Use my current location"}
                </button>

                <div className="w-full mt-[15px] flex justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-[280px] h-[45px] bg-[#4A5C6A]/50 font-bold text-[14px] rounded-[20px] hover:bg-[#4A5C6A]/80 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm({ address, lat: position.lat, lng: position.lng })}
                        disabled={!address}
                        className="w-[280px] h-[45px] bg-[#00C896]/50 font-bold text-[14px] rounded-[20px] hover:bg-[#00C896]/80 transition-all duration-300 disabled:opacity-50"
                    >
                        Confirm location
                    </button>
                </div>
            </div>
        </div>
    )
}

const HOTEL_TYPE_OPTIONS = [
    "Hotel", "Resort", "Boutique Hotel", "Guest House", "Villa",
    "Homestay", "Bed & Breakfast", "Eco Lodge", "Apartment Hotel", "Hostel"
]
const PROVINCE_OPTIONS = [
    "Western", "Central", "Southern", "Northern", "Eastern",
    "North Western", "North Central", "Uva", "Sabaragamuwa"
]
const PROVINCE_DISTRICTS = {
    "Western": ["Colombo", "Gampaha", "Kalutara"],
    "Central": ["Kandy", "Matale", "Nuwara Eliya"],
    "Southern": ["Galle", "Matara", "Hambantota"],
    "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
    "Eastern": ["Batticaloa", "Ampara", "Trincomalee"],
    "North Western": ["Kurunegala", "Puttalam"],
    "North Central": ["Anuradhapura", "Polonnaruwa"],
    "Uva": ["Badulla", "Monaragala"],
    "Sabaragamuwa": ["Ratnapura", "Kegalle"],
}

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: "50px",
        borderRadius: "20px",
        backgroundColor: "#4A5C6A80",
        border: "none",
        boxShadow: "none",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
        color: "#CCD0CF",
        cursor: "pointer",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "#4A5C6A",
    }),
    singleValue: (base) => ({
        ...base,
        color: "#CCD0CF",
        paddingLeft: "10px"
    }),
    placeholder: (base) => ({
        ...base,
        color: "#CCD0CF",
        opacity: 0.5,
        paddingLeft: "10px"
    }),
    input: (base) => ({
        ...base,
        color: "#CCD0CF",
    }),
}

export default function HotelInformation() {
    const navigate = useNavigate()

    const [hotelName, setHotelName] = useState("")
    const [hotelType, setHotelType] = useState(null)
    const [shortDescription, setShortDescription] = useState("")
    const [phone1, setPhone1] = useState("")
    const [phone2, setPhone2] = useState("")
    const [province, setProvince] = useState(null)
    const [district, setDistrict] = useState(null)
    const [location, setLocation] = useState("")
    const [coordinates, setCoordinates] = useState(null)
    const [showMapPicker, setShowMapPicker] = useState(false)

    const [err, setErr] = useState("")

    const hotelTypeOptions = HOTEL_TYPE_OPTIONS.map((t) => ({ label: t, value: t }))
    const provinceOptions = PROVINCE_OPTIONS.map((p) => ({ label: p, value: p }))
    const districtOptions = (PROVINCE_DISTRICTS[province?.value] || []).map((d) => ({ label: d, value: d }))

    const handleProvinceChange = (selected) => {
        setProvince(selected)
        setDistrict(null)
    }

    useEffect(() => {
        const saved = sessionStorage.getItem("HotelOwnerRegister")
        if (saved) {
            const data = JSON.parse(saved)

            setHotelName(data.hotelName || "")
            setShortDescription(data.shortDescription || "")
            setPhone1(data.phone1 || "")
            setPhone2(data.phone2 || "")
            setLocation(data.location || "")
            if (data.latitude && data.longitude) {
                setCoordinates({ lat: data.latitude, lng: data.longitude })
            }

            if (data.hotelType) {
                setHotelType({ label: data.hotelType, value: data.hotelType })
            }
            if (data.province) {
                setProvince({ label: data.province, value: data.province })
            }
            if (data.district) {
                setDistrict({ label: data.district, value: data.district })
            }
        }
    }, [])

    const buildFormData = () => {
        const oldData = JSON.parse(sessionStorage.getItem("HotelOwnerRegister")) || {}
        return {
            ...oldData,
            hotelName,
            hotelType: hotelType?.value,
            shortDescription,
            phone1,
            phone2,
            province: province?.value,
            district: district?.value,
            location,
            latitude: coordinates?.lat,
            longitude: coordinates?.lng,
        }
    }

    const handlePrevious = () => {
        sessionStorage.setItem("HotelOwnerRegister", JSON.stringify(buildFormData()))
        navigate(-1)
    }

    const handleNext = () => {
        if (!hotelName || !hotelType || !phone1 || !province || !district || !location) {
            setErr("Please fill all required fields")
            return;
        }

        setErr("")
        sessionStorage.setItem("HotelOwnerRegister", JSON.stringify(buildFormData()))
        navigate("/hotelfacilities")
    }

    const handleOpenMap = () => {
        setShowMapPicker(true)
    }

    const handleConfirmLocation = (picked) => {
        setLocation(picked.address)
        setCoordinates({ lat: picked.lat, lng: picked.lng })
        setShowMapPicker(false)
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
                            <span className="text-[#CCD0CF] text-[12px]">2</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center leading-4">Hotel information</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[80px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#4A5C6A]/80 flex items-center justify-center">
                            <span className="text-[#CCD0CF] text-[12px]">3</span>
                        </div>
                        <span className="mt-2 text-[#CCD0CF] text-[12px] text-center whitespace-nowrap">Facilities</span>
                    </div>
                    <div className="w-[170px] mt-[15px] border-t-2 border-dashed border-[#CCD0CF]/50"></div>
                    <div className="flex flex-col items-center w-[90px]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#4A5C6A]/80 flex items-center justify-center">
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

                <input
                    placeholder="Hotel Name"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-[465px] h-[50px] mt-[15px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                />

                <div className="w-[465px] mt-[15px] text-[12px]">
                    <Select
                        options={hotelTypeOptions}
                        value={hotelType}
                        onChange={setHotelType}
                        placeholder="Hotel Type"
                        menuPosition="fixed"
                        styles={selectStyles}
                    />
                </div>

                <div className="w-[465px] mt-[15px] relative">
                    <textarea
                        placeholder="Short Description"
                        value={shortDescription}
                        maxLength={100}
                        onChange={(e) => setShortDescription(e.target.value)}
                        className="w-full h-[70px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pt-[15px] pr-[20px] resize-none"
                    />
                    <span className="absolute right-[20px] bottom-[10px] text-[10px] text-[#CCD0CF]/50">
                        {shortDescription.length}/100
                    </span>
                </div>

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <input
                        placeholder="Phone 1"
                        value={phone1}
                        onChange={(e) => setPhone1(e.target.value.replace(/\D/g, ""))}
                        className="w-[220px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                    />
                    <input
                        placeholder="Phone 2"
                        value={phone2}
                        onChange={(e) => setPhone2(e.target.value.replace(/\D/g, ""))}
                        className="w-[220px] h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px]"
                    />
                </div>

                <div className="w-[465px] mt-[15px] flex justify-between">
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={provinceOptions}
                            value={province}
                            onChange={handleProvinceChange}
                            placeholder="Province"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                    <div className="w-[220px] text-[12px]">
                        <Select
                            options={districtOptions}
                            value={district}
                            onChange={setDistrict}
                            placeholder={province ? "District" : "Select province first"}
                            isDisabled={!province}
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>
                </div>

                <div className="w-[465px] mt-[15px] relative">
                    <input
                        id="hotel-location-input"
                        placeholder="Select your location on map or paste address"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pr-[45px]"
                    />
                    <button
                        type="button"
                        onClick={handleOpenMap}
                        className="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#00C896]/80 cursor-pointer"
                    >
                        <FaMap />
                    </button>
                </div>

                <div className="mt-[20px] w-[465px] flex justify-between">
                    <button onClick={handlePrevious} className="w-[225px] h-[50px] bg-[#4A5C6A]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#4A5C6A]/80 transition-all duration-300 hover:scale-95">
                        <GrFormPreviousLink className="font-bold text-[20px]" />Previous
                    </button>
                    <button onClick={handleNext} className="w-[225px] h-[50px] bg-[#00C896]/50 font-bold text-[16px] rounded-[20px] flex items-center justify-center hover:bg-[#00C896]/80 transition-all duration-300 hover:scale-105">
                        Next <GrFormNextLink className="font-bold text-[20px]" />
                    </button>
                </div>
            </div>

            {showMapPicker && (
                <MapPickerModal
                    initialPosition={coordinates}
                    onClose={() => setShowMapPicker(false)}
                    onConfirm={handleConfirmLocation}
                />
            )}
        </div>
    )
}
