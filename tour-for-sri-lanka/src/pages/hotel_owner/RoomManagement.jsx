import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import {
    FaBed,
    FaPlus,
    FaMinus,
    FaTimes,
    FaImage,
    FaCheck,
    FaWifi,
    FaSnowflake,
    FaTv,
    FaCocktail,
    FaDoorOpen,
    FaBath,
    FaSwimmer,
    FaSpa,
    FaCoffee,
    FaUtensils,
    FaDumbbell,
    FaEllipsisV,
    FaSearch
} from "react-icons/fa";

const ROOM_TYPES = [
    { value: "Single", label: "Single" },
    { value: "Double", label: "Double" },
    { value: "Twin", label: "Twin" },
    { value: "Deluxe", label: "Deluxe" },
    { value: "Suite", label: "Suite" },
    { value: "Family", label: "Family" },
    { value: "Presidential", label: "Presidential" }
];

const CAPACITY_OPTIONS = Array.from(
    { length: 20 },
    (_, i) => i + 1
).map((n) => ({
    value: n,
    label: `${n} Guest${n > 1 ? "s" : ""}`
}));

const CUSTOM_FACILITY_MAX_LENGTH = 15;

const FACILITY_OPTIONS = [
    { key: "wifi", label: "WiFi", icon: FaWifi },
    { key: "ac", label: "AC", icon: FaSnowflake },
    { key: "tv", label: "TV", icon: FaTv },
    { key: "bar", label: "Bar", icon: FaCocktail },
    { key: "balcony", label: "Balcony", icon: FaDoorOpen },
    { key: "hotWater", label: "Hot Water", icon: FaBath },
    { key: "pool", label: "Pool", icon: FaSwimmer },
    { key: "spa", label: "Spa", icon: FaSpa },
    { key: "breakfast", label: "Breakfast", icon: FaCoffee },
    { key: "lunch", label: "Lunch", icon: FaUtensils },
    { key: "gym", label: "Gym", icon: FaDumbbell }
];

const EMPTY_FACILITIES = {
    wifi: false,
    ac: false,
    tv: false,
    bar: false,
    balcony: false,
    hotWater: false,
    pool: false,
    spa: false,
    breakfast: false,
    lunch: false,
    gym: false
};

const selectStyles = {
    control: (base) => ({
        ...base,
        width: "100%",
        minHeight: "50px",
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
        backgroundColor: state.isFocused
            ? "#00C896"
            : "#4A5C6A",
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
        color: "#CCD0CF"
    })
};

function getAuthHeader() {
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");

    const token =
        localToken && localToken !== "undefined"
            ? localToken
            : sessionToken;

    return {
        Authorization: `Bearer ${token}`
    };
}

export default function RoomManagement() {
    const [hotelId, setHotelId] = useState(null);
    const [isApproved, setIsApproved] = useState(false);

    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0
    });

    const [
        editingOriginalRoomNumber,
        setEditingOriginalRoomNumber
    ] = useState(null);

    const [roomNumber, setRoomNumber] = useState("");
    const [roomType, setRoomType] = useState("");
    const [capacity, setCapacity] = useState(null);
    const [pricePerNight, setPricePerNight] = useState("");
    const [shortDescription, setShortDescription] = useState("");

    const [roomFacility, setRoomFacility] =
        useState(EMPTY_FACILITIES);

    const [otherFacility, setOtherFacility] = useState([]);
    const [otherFacilityInput, setOtherFacilityInput] =
        useState("");

    const [images, setImages] = useState([]);

    useEffect(() => {
        const storedUser =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

        if (!storedUser) return;

        try {
            const user = JSON.parse(storedUser);
            setHotelId(user._id);
        } catch (error) {
            console.error("Failed to parse stored user:", error);
        }
    }, []);

    useEffect(() => {
        if (hotelId) {
            fetchRooms();
        }
    }, [hotelId]);

    useEffect(() => {
        if (!hotelId) return;

        axios
            .get(`${API_BASE_URL}/api/hotel/${hotelId}`)
            .then((res) => {
                setIsApproved(res.data.isApproved === true);
            })
            .catch((error) => {
                console.error("Failed to fetch hotel:", error);
            });
    }, [hotelId]);

    useEffect(() => {
        const handleResize = () => {
            if (openMenuId) {
                setOpenMenuId(null);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [openMenuId]);

    function fetchRooms() {
        if (!hotelId) return;

        setLoadingRooms(true);

        axios
            .get(`${API_BASE_URL}/api/addRoom/hotel/${hotelId}`)
            .then((res) => {
                setRooms(Array.isArray(res.data) ? res.data : []);
            })
            .catch((error) => {
                console.error("Failed to load rooms:", error);
                toast.error("Failed to load rooms");
            })
            .finally(() => {
                setLoadingRooms(false);
            });
    }

    function resetForm() {
        setRoomNumber("");
        setRoomType("");
        setCapacity(null);
        setPricePerNight("");
        setShortDescription("");
        setRoomFacility({ ...EMPTY_FACILITIES });
        setOtherFacility([]);
        setOtherFacilityInput("");
        setImages([]);
        setEditingOriginalRoomNumber(null);
        setShowAddForm(false);
    }

    function startEdit(room) {
        setEditingOriginalRoomNumber(room.roomNumber);
        setRoomNumber(room.roomNumber || "");
        setRoomType(room.roomType || "");
        setCapacity(room.capacity || null);
        setPricePerNight(room.pricePerNight || "");
        setShortDescription(room.shortDescription || "");

        setRoomFacility({
            ...EMPTY_FACILITIES,
            ...(room.roomFacility || {})
        });

        setOtherFacility(room.otherFacility || []);
        setImages(room.images || []);

        setShowAddForm(true);
        setOpenMenuId(null);

        setTimeout(() => {
            document
                .getElementById("room-form")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }, 100);
    }

    function handleImageUpload(e) {
        const files = Array.from(e.target.files || []);

        if (images.length + files.length > 5) {
            toast.error("Maximum 5 images allowed");
            e.target.value = "";
            return;
        }

        if (files.length === 0) return;

        setUploadingImage(true);

        const uploadPromises = files.map((file) => {
            const formData = new FormData();

            formData.append("photo", file);

            return axios.post(
                `${API_BASE_URL}/api/hotel/upload-photo`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
        });

        Promise.all(uploadPromises)
            .then((responses) => {
                const urls = responses
                    .map((res) => res.data?.url)
                    .filter(Boolean);

                setImages((prev) => [
                    ...prev,
                    ...urls
                ]);
            })
            .catch((error) => {
                console.error("Image upload failed:", error);
                toast.error("Image upload failed");
            })
            .finally(() => {
                setUploadingImage(false);
                e.target.value = "";
            });
    }

    function removeImage(index) {
        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );
    }

    function toggleFacility(key) {
        setRoomFacility((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    }

    function addOtherFacility() {
        const value = otherFacilityInput
            .trim()
            .slice(0, CUSTOM_FACILITY_MAX_LENGTH);

        if (!value) return;

        if (otherFacility.includes(value)) {
            toast.error("Facility already added");
            setOtherFacilityInput("");
            return;
        }

        setOtherFacility((prev) => [
            ...prev,
            value
        ]);

        setOtherFacilityInput("");
    }

    function removeOtherFacility(index) {
        setOtherFacility((prev) =>
            prev.filter((_, i) => i !== index)
        );
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (
            !roomNumber.trim() ||
            !pricePerNight ||
            !shortDescription.trim() ||
            !roomType ||
            !capacity
        ) {
            toast.error("Please fill all required fields");
            return;
        }

        if (!hotelId) {
            toast.error("Hotel information not found");
            return;
        }

        setSubmitting(true);

        const payload = {
            hotelId,
            roomNumber: roomNumber.trim(),
            roomType,
            capacity,
            pricePerNight,
            shortDescription: shortDescription.trim(),
            roomFacility,
            otherFacility,
            images
        };

        const request = editingOriginalRoomNumber
            ? axios.put(
                  `${API_BASE_URL}/api/addRoom/${hotelId}/${editingOriginalRoomNumber}`,
                  payload,
                  {
                      headers: getAuthHeader()
                  }
              )
            : axios.post(
                  `${API_BASE_URL}/api/addRoom`,
                  payload,
                  {
                      headers: getAuthHeader()
                  }
              );

        request
            .then(() => {
                toast.success(
                    editingOriginalRoomNumber
                        ? "Room updated successfully"
                        : "Room added successfully"
                );

                resetForm();
                fetchRooms();
            })
            .catch((error) => {
                console.error("Room submission failed:", error);

                toast.error(
                    error.response?.data?.error ||
                        "Room submission failed"
                );
            })
            .finally(() => {
                setSubmitting(false);
            });
    }

    function handleDeleteRoom(roomNumberToDelete) {
        if (!hotelId) return;

        axios
            .delete(
                `${API_BASE_URL}/api/addRoom/${hotelId}/${roomNumberToDelete}`,
                {
                    headers: getAuthHeader()
                }
            )
            .then(() => {
                toast.success("Room removed successfully");
                fetchRooms();
            })
            .catch((error) => {
                console.error("Room removal failed:", error);

                toast.error(
                    error.response?.data?.error ||
                        "Room removal failed"
                );
            });
    }

    function handleToggleStatus(room) {
        if (!hotelId) return;

        const newStatus =
            room.status === "maintenance"
                ? "available"
                : "maintenance";

        axios
            .put(
                `${API_BASE_URL}/api/addRoom/${hotelId}/${room.roomNumber}`,
                {
                    status: newStatus
                },
                {
                    headers: getAuthHeader()
                }
            )
            .then(() => {
                toast.success(
                    `Room marked as ${newStatus}`
                );

                fetchRooms();
                setOpenMenuId(null);
            })
            .catch((error) => {
                console.error(
                    "Failed to update room status:",
                    error
                );

                toast.error(
                    error.response?.data?.error ||
                        "Failed to update status"
                );
            });
    }

    function handleActionMenu(e, roomId) {
        if (openMenuId === roomId) {
            setOpenMenuId(null);
            return;
        }

        const rect =
            e.currentTarget.getBoundingClientRect();

        const menuWidth = 170;
        const menuHeight = 150;
        const padding = 10;

        let left = rect.right - menuWidth;
        let top = rect.bottom + 6;

        if (left < padding) {
            left = padding;
        }

        if (
            left + menuWidth >
            window.innerWidth - padding
        ) {
            left =
                window.innerWidth -
                menuWidth -
                padding;
        }

        if (
            top + menuHeight >
            window.innerHeight - padding
        ) {
            top =
                rect.top -
                menuHeight -
                6;
        }

        if (top < padding) {
            top = padding;
        }

        setMenuPosition({
            top,
            left
        });

        setOpenMenuId(roomId);
    }

    const filteredRooms = rooms.filter((room) =>
        String(room.roomNumber || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <section
            id="rooms"
            className="mt-6 md:mt-8 room-management-page-anim"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 room-management-header-anim">
                <h1 className="text-[#CCD0CF] text-[22px] sm:text-[24px] font-bold">
                    Room Management
                </h1>

                <button
                    type="button"
                    onClick={() => {
                        if (showAddForm) {
                            resetForm();
                            return;
                        }

                        if (!isApproved) {
                            toast.error(
                                "Your hotel is not verified yet. You cannot add rooms until an admin approves your hotel."
                            );
                            return;
                        }

                        setEditingOriginalRoomNumber(null);
                        setShowAddForm(true);

                        setTimeout(() => {
                            document
                                .getElementById("room-form")
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start"
                                });
                        }, 100);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00C896]/80 hover:bg-[#00C896] active:scale-[0.98] transition-all duration-300 text-white px-5 py-2.5 rounded-[15px] text-[14px] font-semibold cursor-pointer"
                >
                    {showAddForm ? <FaMinus /> : <FaPlus />}

                    {showAddForm ? "Close" : "Add Room"}
                </button>
            </div>

            {showAddForm && (
                <form
                    id="room-form"
                    onSubmit={handleSubmit}
                    className="bg-[#253745] rounded-[20px] p-4 sm:p-6 mb-8 room-form-anim"
                >
                    <h3 className="text-[#CCD0CF] text-[16px] font-bold mb-5">
                        {editingOriginalRoomNumber
                            ? `Edit Room ${editingOriginalRoomNumber}`
                            : "Add New Room"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={roomNumber}
                            placeholder="Room Number"
                            onChange={(e) =>
                                setRoomNumber(e.target.value)
                            }
                            className="w-full h-[45px] bg-[#4A5C6A80] rounded-[20px] outline-none px-4 text-[#CCD0CF] text-[12px]"
                        />

                        <input
                            type="number"
                            value={pricePerNight}
                            onChange={(e) => {
                                const value =
                                    e.target.value;

                                if (
                                    value === "" ||
                                    Number(value) >= 0
                                ) {
                                    setPricePerNight(value);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "-" ||
                                    e.key === "e" ||
                                    e.key === "+"
                                ) {
                                    e.preventDefault();
                                }
                            }}
                            onWheel={(e) =>
                                e.target.blur()
                            }
                            placeholder="Price Per Night (LKR)"
                            style={{
                                MozAppearance:
                                    "textfield"
                            }}
                            className="w-full h-[45px] bg-[#4A5C6A80] rounded-[20px] px-4 text-[#CCD0CF] outline-none text-[12px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />

                        <Select
                            options={ROOM_TYPES}
                            value={
                                ROOM_TYPES.find(
                                    (option) =>
                                        option.value ===
                                        roomType
                                ) || null
                            }
                            onChange={(selected) =>
                                setRoomType(
                                    selected?.value || ""
                                )
                            }
                            placeholder="Room Type"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />

                        <Select
                            options={CAPACITY_OPTIONS}
                            value={
                                CAPACITY_OPTIONS.find(
                                    (option) =>
                                        option.value ===
                                        capacity
                                ) || null
                            }
                            onChange={(selected) =>
                                setCapacity(
                                    selected?.value || null
                                )
                            }
                            placeholder="No of Guests"
                            menuPosition="fixed"
                            styles={selectStyles}
                        />
                    </div>

                    <div className="mt-4">
                        <textarea
                            value={shortDescription}
                            onChange={(e) =>
                                setShortDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Short Description"
                            rows={4}
                            className="w-full bg-[#4A5C6A80] rounded-[12px] px-4 py-3 text-[#CCD0CF] text-[12px] outline-none resize-none"
                        />
                    </div>

                    <div className="mt-5">
                        <label className="text-[#CCD0CF]/60 text-[12px] block mb-2">
                            Room Images
                        </label>

                        <div className="flex flex-wrap gap-3">
                            {images.map((url, index) => (
                                <div
                                    key={`${url}-${index}`}
                                    className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] room-image-anim"
                                >
                                    <img
                                        src={url}
                                        alt="room"
                                        className="w-full h-full object-cover rounded-[10px]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImage(index)
                                        }
                                        className="absolute -top-2 -right-2 bg-[#CD2F31] rounded-full w-[20px] h-[20px] flex items-center justify-center text-white text-[10px] cursor-pointer hover:scale-110 transition-transform"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}

                            {images.length < 5 && (
                                <label className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] rounded-[10px] border-2 border-dashed border-[#4A5C6A] flex items-center justify-center cursor-pointer text-[#CCD0CF]/50 hover:text-[#00C896] hover:border-[#00C896] transition-all duration-300">
                                    {uploadingImage ? (
                                        <span className="text-[11px]">
                                            Uploading...
                                        </span>
                                    ) : (
                                        <FaImage size={22} />
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={
                                            handleImageUpload
                                        }
                                        className="hidden"
                                        disabled={
                                            uploadingImage
                                        }
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="text-[#CCD0CF]/60 text-[12px] block mb-2">
                            Room Facilities
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[10px]">
                            {FACILITY_OPTIONS.map(
                                ({
                                    key,
                                    label,
                                    icon: Icon
                                }) => {
                                    const selected =
                                        roomFacility[key];

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() =>
                                                toggleFacility(
                                                    key
                                                )
                                            }
                                            className={`relative min-h-[65px] rounded-[15px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold px-[6px] text-center transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                                                selected
                                                    ? "bg-[#00C896]/20 border-2 border-[#00C896] text-[#CCD0CF]"
                                                    : "bg-[#4A5C6A]/50 border-2 border-transparent text-[#CCD0CF] hover:border-[#4A5C6A]"
                                            }`}
                                        >
                                            {selected && (
                                                <span className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-[#00C896] flex items-center justify-center text-[#06141B] text-[9px]">
                                                    <FaCheck />
                                                </span>
                                            )}

                                            <Icon className="text-[#00C896] text-[16px]" />

                                            <span className="leading-[13px]">
                                                {label}
                                            </span>
                                        </button>
                                    );
                                }
                            )}

                            {otherFacility.map(
                                (label, index) => (
                                    <button
                                        key={`${label}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            removeOtherFacility(
                                                index
                                            )
                                        }
                                        title="Click to remove"
                                        className="relative min-h-[65px] rounded-[15px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold px-[6px] text-center bg-[#00C896]/20 border-2 border-[#00C896] text-[#CCD0CF] transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                                    >
                                        <span className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full bg-[#00C896] flex items-center justify-center text-[#06141B] text-[9px]">
                                            <FaTimes />
                                        </span>

                                        <span className="leading-[13px] break-words">
                                            {label}
                                        </span>
                                    </button>
                                )
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="text-[#CCD0CF]/60 text-[12px] block mb-2">
                                Other Facility
                            </label>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type a facility and press Enter...."
                                    value={
                                        otherFacilityInput
                                    }
                                    maxLength={
                                        CUSTOM_FACILITY_MAX_LENGTH
                                    }
                                    onChange={(e) =>
                                        setOtherFacilityInput(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key ===
                                            "Enter"
                                        ) {
                                            e.preventDefault();
                                            addOtherFacility();
                                        }
                                    }}
                                    className="w-full h-[50px] text-[#CCD0CF] text-[12px] bg-[#4A5C6A]/50 rounded-[20px] pl-[20px] pr-[65px] outline-none focus:ring-1 focus:ring-[#00C896]/50"
                                />

                                <span className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[10px] text-[#CCD0CF]/50">
                                    {
                                        otherFacilityInput.length
                                    }
                                    /
                                    {
                                        CUSTOM_FACILITY_MAX_LENGTH
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-6 w-full h-[45px] bg-[#00C896]/80 hover:bg-[#00C896] active:scale-[0.99] transition-all duration-300 text-white font-bold rounded-[15px] cursor-pointer disabled:opacity-50"
                    >
                        {submitting
                            ? "Saving..."
                            : editingOriginalRoomNumber
                            ? "Update Room"
                            : "Add Room"}
                    </button>
                </form>
            )}

            <div className="bg-[#253745] rounded-[20px] p-4 sm:p-6 room-list-anim">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                    <h2 className="text-[#CCD0CF] text-[19px] sm:text-[20px] font-bold">
                        Rooms
                    </h2>

                    <div className="relative w-full lg:w-[280px]">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            placeholder="Search room by room number"
                            className="w-full h-[42px] bg-[#4A5C6A]/50 rounded-[20px] pl-[16px] pr-[40px] text-[#CCD0CF] text-[13px] outline-none focus:ring-1 focus:ring-[#00C896]/50"
                        />

                        <FaSearch className="absolute right-[15px] top-1/2 -translate-y-1/2 text-[#00C896] text-[14px]" />
                    </div>
                </div>

                {loadingRooms ? (
                    <div className="py-6">
                        <p className="text-[#CCD0CF]/60 text-[14px]">
                            Loading rooms...
                        </p>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="py-6">
                        <p className="text-[#CCD0CF]/60 text-[14px]">
                            No rooms found.
                        </p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-x-auto overflow-y-visible room-table-wrapper">
                        <table className="w-full min-w-[700px] border-collapse">
                            <thead>
                                <tr className="text-left text-[#CCD0CF] text-[13px] font-bold">
                                    <th className="pb-4 pr-4 whitespace-nowrap">
                                        Room Number
                                    </th>

                                    <th className="pb-4 pr-4 whitespace-nowrap">
                                        Capacity
                                    </th>

                                    <th className="pb-4 pr-4 whitespace-nowrap">
                                        Price per night
                                    </th>

                                    <th className="pb-4 pr-4 whitespace-nowrap">
                                        Status
                                    </th>

                                    <th className="pb-4 whitespace-nowrap">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRooms.map(
                                    (room, index) => (
                                        <tr
                                            key={room._id}
                                            className="border-t border-[#4A5C6A]/40 room-row-anim"
                                            style={{
                                                animationDelay: `${
                                                    index * 0.06
                                                }s`
                                            }}
                                        >
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-[55px] h-[55px] sm:w-[60px] sm:h-[60px] rounded-[10px] bg-[#1B2B34] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {room.images?.[0] ? (
                                                            <img
                                                                src={
                                                                    room.images[0]
                                                                }
                                                                alt={
                                                                    room.roomNumber
                                                                }
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <FaBed className="text-[#4A5C6A] text-[20px]" />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-[#CCD0CF] font-bold text-[14px] sm:text-[15px]">
                                                            {
                                                                room.roomNumber
                                                            }
                                                        </p>

                                                        <p className="text-[#CCD0CF]/60 text-[11px] sm:text-[12px]">
                                                            {
                                                                room.roomType
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 pr-4 text-[#CCD0CF] text-[13px] sm:text-[14px] whitespace-nowrap">
                                                {room.capacity} Guests
                                            </td>

                                            <td className="py-4 pr-4 text-[#CCD0CF] text-[13px] sm:text-[14px] whitespace-nowrap">
                                                LKR{" "}
                                                {Number(
                                                    room.pricePerNight
                                                ).toLocaleString()}
                                            </td>

                                            <td className="py-4 pr-4">
                                                <span className="flex items-center gap-2 text-[13px] sm:text-[14px] whitespace-nowrap">
                                                    <span
                                                        className={`w-[8px] h-[8px] rounded-full ${
                                                            room.status ===
                                                            "maintenance"
                                                                ? "bg-[#CD2F31]"
                                                                : "bg-[#00C896]"
                                                        }`}
                                                    />

                                                    <span className="text-[#CCD0CF]">
                                                        {room.status ===
                                                        "maintenance"
                                                            ? "Maintenance"
                                                            : "Available"}
                                                    </span>
                                                </span>
                                            </td>

                                            <td className="py-4 relative">
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleActionMenu(
                                                            e,
                                                            room._id
                                                        )
                                                    }
                                                    className="text-[#CCD0CF]/60 hover:text-[#CCD0CF] active:scale-90 transition-all cursor-pointer p-2"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {openMenuId && (
                <>
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() =>
                            setOpenMenuId(null)
                        }
                    />

                    <div
                        className="fixed bg-[#4A5C6A] rounded-[12px] overflow-hidden z-[9999] w-[170px] shadow-xl room-action-menu-anim"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`
                        }}
                    >
                        {(() => {
                            const room = rooms.find(
                                (item) =>
                                    item._id === openMenuId
                            );

                            if (!room) return null;

                            return (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            startEdit(room)
                                        }
                                        className="w-full text-left px-4 py-3 text-[#CCD0CF] text-[13px] hover:bg-[#00C896]/20 active:bg-[#00C896]/30 transition-colors cursor-pointer"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleStatus(
                                                room
                                            )
                                        }
                                        className="w-full text-left px-4 py-3 text-[#CCD0CF] text-[13px] hover:bg-[#00C896]/20 active:bg-[#00C896]/30 transition-colors cursor-pointer"
                                    >
                                        {room.status ===
                                        "maintenance"
                                            ? "Mark as Available"
                                            : "Mark as Maintenance"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    `Delete room ${room.roomNumber}?`
                                                )
                                            ) {
                                                handleDeleteRoom(
                                                    room.roomNumber
                                                );
                                            }

                                            setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-[#CD2F31] text-[13px] hover:bg-[#CD2F31]/10 active:bg-[#CD2F31]/20 transition-colors cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                </>
            )}
        </section>
    );
}