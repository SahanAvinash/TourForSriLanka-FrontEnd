import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import {
    FaCar, FaTrash, FaPlus, FaMinus, FaTimes, FaImage,
    FaCheck, FaWifi, FaSnowflake, FaMapMarkerAlt, FaUserTie,
    FaChild, FaMusic, FaCogs, FaVideo, FaEllipsisV, FaSearch
} from "react-icons/fa";

const VEHICLE_TYPES = [
    { value: "Car", label: "Car" },
    { value: "Van", label: "Van" },
    { value: "SUV", label: "SUV" },
    { value: "Jeep", label: "Jeep" },
    { value: "Mini Bus", label: "Mini Bus" },
    { value: "Bus", label: "Bus" },
    { value: "Tuk Tuk", label: "Tuk Tuk" },
    { value: "Motorbike", label: "Motorbike" },
    { value: "Luxury Car", label: "Luxury Car" }
];

const SEAT_OPTIONS = Array.from({ length: 50 }, (_, i) => i + 1).map((n) => ({
    value: n,
    label: `${n} Seat${n > 1 ? "s" : ""}`
}));

const CUSTOM_FACILITY_MAX_LENGTH = 15;

const FACILITY_OPTIONS = [
    { key: "ac", label: "AC", icon: FaSnowflake },
    { key: "gps", label: "GPS", icon: FaMapMarkerAlt },
    { key: "driver", label: "Driver", icon: FaUserTie },
    { key: "childSeat", label: "Child Seat", icon: FaChild },
    { key: "music", label: "Music System", icon: FaMusic },
    { key: "autoTransmission", label: "Automatic", icon: FaCogs },
    { key: "dashcam", label: "Dashcam", icon: FaVideo },
    { key: "wifi", label: "WiFi", icon: FaWifi },
];

const EMPTY_FACILITIES = {
    ac: false, gps: false, driver: false, childSeat: false,
    music: false, autoTransmission: false, dashcam: false, wifi: false
};

const selectStyles = {
    control: (base) => ({
        ...base,
        width: "465px",
        height: "50px",
        borderRadius: "20px",
        backgroundColor: "#4A5C6A80",
        border: "none",
        boxShadow: "none"
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "#4A5C6A",
        borderRadius: "20px",
        overflow: "hidden",
        zIndex: 9999
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#00C896" : "#4A5C6A",
        color: "#CCD0CF",
        cursor: "pointer",
        fontSize: "12px"
    }),
    singleValue: (base) => ({
        ...base,
        color: "#CCD0CF",
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
};

function getAuthHeader() {
    const localToken = localStorage.getItem("token")
    const sessionToken = sessionStorage.getItem("token")
    const token = (localToken && localToken !== "undefined") ? localToken : sessionToken
    return { Authorization: `Bearer ${token}` };
}

export default function VehicleManagement() {
    const [transportId, setTransportId] = useState(null);
    const [isApproved, setIsApproved] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingOriginalVehicleNumber, setEditingOriginalVehicleNumber] = useState(null);

    const [vehicleNumber, setVehicleNumber] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [seats, setSeats] = useState(null);
    const [pricePerDay, setPricePerDay] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [vehicleFacility, setVehicleFacility] = useState(EMPTY_FACILITIES);
    const [otherFacility, setOtherFacility] = useState([]);
    const [otherFacilityInput, setOtherFacilityInput] = useState("");
    const [images, setImages] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        setTransportId(user._id);
    }, []);

    useEffect(() => {
        if (transportId) fetchVehicles();
    }, [transportId]);

    useEffect(() => {
        if (!transportId) return;
        axios.get(`http://localhost:3000/api/transport/${transportId}`)
            .then((res) => {
                setIsApproved(res.data.isApproved === true);
            }).catch((error) => {
                console.log(error);
            });
    }, [transportId]);

    function fetchVehicles() {
        setLoadingVehicles(true);
        axios.get(`http://localhost:3000/api/addVehicle/transport/${transportId}`)
            .then((res) => {
                setVehicles(res.data);
            }).catch((error) => {
                console.log(error);
                toast.error("Failed to load vehicles");
            }).finally(() => {
                setLoadingVehicles(false);
            });
    }

    function resetForm() {
        setVehicleNumber("");
        setVehicleType("");
        setSeats(null);
        setPricePerDay("");
        setShortDescription("");
        setVehicleFacility(EMPTY_FACILITIES);
        setOtherFacility([]);
        setOtherFacilityInput("");
        setImages([]);
        setEditingOriginalVehicleNumber(null);
        setShowAddForm(false);
    }

    function startEdit(vehicle) {
        setEditingOriginalVehicleNumber(vehicle.vehicleNumber);
        setVehicleNumber(vehicle.vehicleNumber);
        setVehicleType(vehicle.vehicleType);
        setSeats(vehicle.seats);
        setPricePerDay(vehicle.pricePerDay);
        setShortDescription(vehicle.shortDescription);
        setVehicleFacility({ ...EMPTY_FACILITIES, ...vehicle.vehicleFacility });
        setOtherFacility(vehicle.otherFacility || []);
        setImages(vehicle.images || []);
        setShowAddForm(true);
        setOpenMenuId(null);
    }

    function handleImageUpload(e) {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }

        setUploadingImage(true);

        const uploadPromises = files.map((file) => {
            const formData = new FormData();
            formData.append("photo", file);
            return axios.post("http://localhost:3000/api/transport/upload-photo", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
        });

        Promise.all(uploadPromises)
            .then((responses) => {
                const urls = responses.map((res) => res.data.url);
                setImages((prev) => [...prev, ...urls]);
            }).catch((error) => {
                console.log(error);
                toast.error("Image upload failed");
            }).finally(() => {
                setUploadingImage(false);
                e.target.value = "";
            });
    }

    function removeImage(index) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    function toggleFacility(key) {
        setVehicleFacility((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function addOtherFacility() {
        const value = otherFacilityInput.trim().slice(0, CUSTOM_FACILITY_MAX_LENGTH);
        if (!value) return;
        if (otherFacility.includes(value)) {
            toast.error("Facility already added");
            setOtherFacilityInput("");
            return;
        }
        setOtherFacility((prev) => [...prev, value]);
        setOtherFacilityInput("");
    }

    function removeOtherFacility(index) {
        setOtherFacility((prev) => prev.filter((_, i) => i !== index));
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!vehicleNumber || !pricePerDay || !shortDescription || !vehicleType || !seats) {
            toast.error("Please fill all required fields");
            return;
        }

        setSubmitting(true);

        const payload = {
            transportId,
            vehicleNumber,
            vehicleType,
            seats,
            pricePerDay,
            shortDescription,
            vehicleFacility,
            otherFacility,
            images
        };

        const request = editingOriginalVehicleNumber
            ? axios.put(`http://localhost:3000/api/addVehicle/${transportId}/${editingOriginalVehicleNumber}`, payload, { headers: getAuthHeader() })
            : axios.post("http://localhost:3000/api/addVehicle", payload, { headers: getAuthHeader() });

        request.then(() => {
            toast.success(editingOriginalVehicleNumber ? "Vehicle updated successfully" : "Vehicle added successfully");
            resetForm();
            fetchVehicles();
        }).catch((error) => {
            console.log(error);
            toast.error(error.response?.data?.error || "Vehicle submission failed");
        }).finally(() => {
            setSubmitting(false);
        });
    }

    function handleDeleteVehicle(vehicleNumberToDelete) {
        axios.delete(`http://localhost:3000/api/addVehicle/${transportId}/${vehicleNumberToDelete}`, {
            headers: getAuthHeader()
        }).then(() => {
            toast.success("Vehicle removed successfully");
            fetchVehicles();
        }).catch((error) => {
            console.log(error);
            toast.error(error.response?.data?.error || "Vehicle removal failed");
        });
    }

    function handleToggleStatus(vehicle) {
        const newStatus = vehicle.status === "maintenance" ? "available" : "maintenance";
        axios.put(`http://localhost:3000/api/addVehicle/${transportId}/${vehicle.vehicleNumber}`, { status: newStatus }, {
            headers: getAuthHeader()
        }).then(() => {
            toast.success(`Vehicle marked as ${newStatus}`);
            fetchVehicles();
            setOpenMenuId(null);
        }).catch((error) => {
            console.log(error);
            toast.error(error.response?.data?.error || "Failed to update status");
        });
    }

    const filteredVehicles = vehicles.filter((vehicle) =>
        vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section id="vehicles" className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[#CCD0CF] text-[24px] font-bold">Vehicle Management</h1>
                <button
                    onClick={() => {
                        if (showAddForm) {
                            resetForm();
                            return;
                        }
                        if (!isApproved) {
                            toast.error("Your account is not verified yet. You cannot add vehicles until an admin approves your account.");
                            return;
                        }
                        setEditingOriginalVehicleNumber(null);
                        setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 bg-[#00C896]/80 hover:bg-[#00C896] transition-all duration-300 text-white px-5 py-2 rounded-[15px] text-[14px] font-semibold cursor-pointer"
                >
                    {showAddForm ? <FaMinus /> : <FaPlus />} {showAddForm ? "Close" : "Add Vehicle"}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-[#253745] rounded-[20px] p-6 mb-8">
                    <h3 className="text-[#CCD0CF] text-[16px] font-bold mb-4">
                        {editingOriginalVehicleNumber ? `Edit Vehicle ${editingOriginalVehicleNumber}` : "Add New Vehicle"}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <input
                                type="text"
                                value={vehicleNumber}
                                placeholder="Vehicle Number (e.g. WP CAB-1234)"
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                className="w-full h-[45px] bg-[#4A5C6A80] rounded-[20px] outline-none px-4 text-[#CCD0CF] text-[12px]"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                value={pricePerDay}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || Number(value) >= 0) {
                                        setPricePerDay(value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "-" || e.key === "e" || e.key === "+") {
                                        e.preventDefault();
                                    }
                                }}
                                onWheel={(e) => e.target.blur()}
                                placeholder="Price Per Day (LKR)"
                                style={{ MozAppearance: "textfield" }}
                                className="w-full h-[45px] bg-[#4A5C6A80] rounded-[20px] px-4 text-[#CCD0CF] outline-none text-[12px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>
                        <div>
                            <Select
                                options={VEHICLE_TYPES}
                                value={VEHICLE_TYPES.find((option) => option.value === vehicleType) || null}
                                onChange={(selected) => setVehicleType(selected.value)}
                                placeholder="Vehicle Type"
                                menuPosition="fixed"
                                styles={selectStyles}
                            />
                        </div>
                        <div>
                            <Select
                                options={SEAT_OPTIONS}
                                value={SEAT_OPTIONS.find((option) => option.value === seats) || null}
                                onChange={(selected) => setSeats(selected.value)}
                                placeholder="No of Seats"
                                menuPosition="fixed"
                                styles={selectStyles}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <textarea
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            placeholder="Short Description"
                            rows={3}
                            className="w-full bg-[#4A5C6A80] rounded-[12px] px-4 py-3 text-[#CCD0CF] text-[12px] outline-none"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="text-[#CCD0CF]/60 text-[12px] block mb-2">Vehicle Images</label>
                        <div className="flex flex-wrap gap-3">
                            {images.map((url, index) => (
                                <div key={index} className="relative w-[80px] h-[80px]">
                                    <img src={url} alt="vehicle" className="w-full h-full object-cover rounded-[10px]" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-[#CD2F31] rounded-full w-[20px] h-[20px] flex items-center justify-center text-white text-[10px] cursor-pointer"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <label className="w-[80px] h-[80px] rounded-[10px] border-2 border-dashed border-[#4A5C6A] flex items-center justify-center cursor-pointer text-[#CCD0CF]/50 hover:text-[#00C896] hover:border-[#00C896] transition-all duration-300">
                                    {uploadingImage ? "..." : <FaImage size={22} />}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-[#CCD0CF]/60 text-[12px] block mb-2">Vehicle Facilities</label>
                        <div className="grid grid-cols-4 gap-[10px]">
                            {FACILITY_OPTIONS.map(({ key, label, icon: Icon }) => {
                                const selected = vehicleFacility[key];
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggleFacility(key)}
                                        className={`relative h-[65px] rounded-[15px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold px-[6px] text-center transition-all duration-200 cursor-pointer ${
                                            selected
                                                ? "bg-[#00C896]/20 border-2 border-[#00C896] text-[#CCD0CF]"
                                                : "bg-[#4A5C6A]/50 border-2 border-transparent text-[#CCD0CF]"
                                        }`}
                                    >
                                        {selected && (
                                            <span className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-[#00C896] flex items-center justify-center text-[#06141B] text-[9px]">
                                                <FaCheck />
                                            </span>
                                        )}
                                        <Icon className="text-[#00C896] text-[16px]" />
                                        <span className="leading-[13px]">{label}</span>
                                    </button>
                                );
                            })}
                            {otherFacility.map((label, index) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => removeOtherFacility(index)}
                                    title="Click to remove"
                                    className="relative h-[65px] rounded-[15px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold px-[6px] text-center bg-[#00C896]/20 border-2 border-[#00C896] text-[#CCD0CF] transition-all duration-200 cursor-pointer"
                                >
                                    <span className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-[#00C896] flex items-center justify-center text-[#06141B] text-[9px]">
                                        <FaTimes />
                                    </span>
                                    <span className="leading-[13px] break-words">{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4">
                            <label className="text-[#CCD0CF]/60 text-[12px] block mb-2">Other Facility</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type a facility and press Enter...."
                                    value={otherFacilityInput}
                                    maxLength={CUSTOM_FACILITY_MAX_LENGTH}
                                    onChange={(e) => setOtherFacilityInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addOtherFacility();
                                        }
                                    }}
                                    className="w-full h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pr-[60px]"
                                />
                                <span className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[10px] text-[#CCD0CF]/50">
                                    {otherFacilityInput.length}/{CUSTOM_FACILITY_MAX_LENGTH}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-6 w-full h-[45px] bg-[#00C896]/80 hover:bg-[#00C896] transition-all duration-300 text-white font-bold rounded-[15px] cursor-pointer disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : editingOriginalVehicleNumber ? "Update Vehicle" : "Add Vehicle"}
                    </button>
                </form>
            )}

            <div className="bg-[#253745] rounded-[20px] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[#CCD0CF] text-[20px] font-bold">Vehicles</h2>
                    <div className="relative w-[280px]">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search vehicle by number"
                            className="w-full h-[42px] bg-[#4A5C6A]/50 rounded-[20px] pl-[16px] pr-[40px] text-[#CCD0CF] text-[13px] outline-none"
                        />
                        <FaSearch className="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#00C896] text-[14px]" />
                    </div>
                </div>

                {loadingVehicles ? (
                    <p className="text-[#CCD0CF]/60 text-[14px]">Loading vehicles...</p>
                ) : filteredVehicles.length === 0 ? (
                    <p className="text-[#CCD0CF]/60 text-[14px]">No vehicles found.</p>
                ) : (
                    <div className="overflow-x-auto overflow-y-visible">
                        <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-[#CCD0CF] text-[13px] font-bold">
                                    <th className="pb-4 pr-4">Vehicle Number</th>
                                    <th className="pb-4 pr-4">Seats</th>
                                    <th className="pb-4 pr-4">Price per day</th>
                                    <th className="pb-4 pr-4">Status</th>
                                    <th className="pb-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle._id} className="border-t border-[#4A5C6A]/40">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-[60px] h-[60px] rounded-[10px] bg-[#1B2B34] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {vehicle.images?.[0] ? (
                                                        <img src={vehicle.images[0]} alt={vehicle.vehicleNumber} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaCar className="text-[#4A5C6A] text-[20px]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[#CCD0CF] font-bold text-[15px]">{vehicle.vehicleNumber}</p>
                                                    <p className="text-[#CCD0CF]/60 text-[12px]">{vehicle.vehicleType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4 text-[#CCD0CF] text-[14px]">{vehicle.seats} Seats</td>
                                        <td className="py-4 pr-4 text-[#CCD0CF] text-[14px]">LKR {Number(vehicle.pricePerDay).toLocaleString()}</td>
                                        <td className="py-4 pr-4">
                                            <span className="flex items-center gap-2 text-[14px]">
                                                <span className={`w-[8px] h-[8px] rounded-full ${vehicle.status === "maintenance" ? "bg-[#CD2F31]" : "bg-[#00C896]"}`}></span>
                                                <span className="text-[#CCD0CF]">
                                                    {vehicle.status === "maintenance" ? "Maintenance" : "Available"}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="py-4 relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === vehicle._id ? null : vehicle._id)}
                                                className="text-[#CCD0CF]/60 hover:text-[#CCD0CF] cursor-pointer p-2"
                                            >
                                                <FaEllipsisV />
                                            </button>
                                            {openMenuId === vehicle._id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                                    <div className="absolute right-0 top-[36px] bg-[#4A5C6A] rounded-[12px] overflow-hidden z-20 w-[170px] shadow-lg">
                                                        <button
                                                            onClick={() => startEdit(vehicle)}
                                                            className="w-full text-left px-4 py-3 text-[#CCD0CF] text-[13px] hover:bg-[#00C896]/20 cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(vehicle)}
                                                            className="w-full text-left px-4 py-3 text-[#CCD0CF] text-[13px] hover:bg-[#00C896]/20 cursor-pointer"
                                                        >
                                                            {vehicle.status === "maintenance" ? "Mark as Available" : "Mark as Maintenance"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Delete vehicle ${vehicle.vehicleNumber}?`)) {
                                                                    handleDeleteVehicle(vehicle.vehicleNumber);
                                                                }
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-[#CD2F31] text-[13px] hover:bg-[#CD2F31]/10 cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}