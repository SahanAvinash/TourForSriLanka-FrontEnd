import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaMoneyBillWave, FaUsers, FaPen, FaCheck, FaTimes, FaUser } from "react-icons/fa";

const languageLabels = {
    english: "English", sinhala: "Sinhala", tamil: "Tamil", spanish: "Spanish",
    japan: "Japanese", chaina: "Chinese", korean: "Korean"
}

export default function MyProfile() {
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guideId, setGuideId] = useState(null);

    const [editingPrice, setEditingPrice] = useState(false);
    const [hourInput, setHourInput] = useState("");
    const [dayInput, setDayInput] = useState("");
    const [savingPrice, setSavingPrice] = useState(false);

    const [editingPhoto, setEditingPhoto] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoDraft, setPhotoDraft] = useState("");
    const [savingPhoto, setSavingPhoto] = useState(false);

    function fetchGuide(id) {
        return axios.get(`${API_BASE_URL}/api/guide/${id}`)
            .then((res) => setGuide(res.data))
            .catch((error) => console.log(error));
    }

    useEffect(() => {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        setGuideId(user._id);
        fetchGuide(user._id).finally(() => setLoading(false));
    }, []);

    const spokenLanguages = guide ? Object.entries(languageLabels)
        .filter(([key]) => guide.languages?.[key])
        .map(([, label]) => label) : [];

    function startEditPrice() {
        setHourInput(guide.pricePerHour);
        setDayInput(guide.pricePerDay);
        setEditingPrice(true);
    }
    function cancelEditPrice() { setEditingPrice(false); }

    function savePrice() {
        if (!hourInput || !dayInput || isNaN(hourInput) || isNaN(dayInput)) {
            toast.error("Enter valid prices");
            return;
        }
        setSavingPrice(true);
        axios.put(`${API_BASE_URL}/api/guide/${guideId}`, {
            pricePerHour: hourInput, pricePerDay: dayInput
        }).then((res) => {
            setGuide(res.data);
            setEditingPrice(false);
            toast.success("Pricing updated successfully");
        }).catch((error) => {
            console.log(error);
            toast.error(error.response?.data?.error || "Failed to update pricing");
        }).finally(() => setSavingPrice(false));
    }

    function startEditPhoto() {
        setPhotoDraft(guide.profilePic);
        setEditingPhoto(true);
    }
    function cancelEditPhoto() {
        setEditingPhoto(false);
        setPhotoDraft("");
    }

    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append("photo", file);

        axios.post(`${API_BASE_URL}/api/guide/upload-photo`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }).then((res) => {
            setPhotoDraft(res.data.url);
        }).catch((error) => {
            console.log(error);
            toast.error("Image upload failed");
        }).finally(() => {
            setUploadingPhoto(false);
            e.target.value = "";
        });
    }

    function savePhoto() {
        setSavingPhoto(true);
        axios.put(`${API_BASE_URL}/api/guide/${guideId}`, { profilePic: photoDraft })
            .then((res) => {
                setGuide(res.data);
                setEditingPhoto(false);
                toast.success("Profile photo updated");
            }).catch((error) => {
                console.log(error);
                toast.error(error.response?.data?.error || "Failed to update photo");
            }).finally(() => setSavingPhoto(false));
    }

    const infoItems = guide ? [
        { icon: FaMapMarkerAlt, label: "District", value: `${guide.district}, ${guide.province}` },
        { icon: FaCalendarAlt, label: "Experience", value: `${guide.yearsOfExperience} years` },
        { icon: FaIdCard, label: "License No", value: guide.GuideLicenseNumber },
        { icon: FaUsers, label: "Max Guests", value: guide.maximumGuests },
    ] : [];

    return (
        <section id="my-profile" className="mt-12">
            {loading ? (
                <p className="text-[#CCD0CF]/60 text-[14px]">Loading profile...</p>
            ) : !guide ? (
                <p className="text-[#CCD0CF]/60 text-[14px]">Profile not found.</p>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-[#CCD0CF] text-[24px] font-bold">My Profile</h1>
                    </div>

                    <div className="bg-[#253745] rounded-[20px] p-6">
                        <div className="grid grid-cols-2 gap-6 items-stretch">
                            <div className="flex flex-col h-full">
                                <div className="w-full flex-1 min-h-[280px] rounded-[15px] bg-[#1B2B34] overflow-hidden flex items-center justify-center relative">
                                    {(editingPhoto ? photoDraft : guide.profilePic) ? (
                                        <img src={editingPhoto ? photoDraft : guide.profilePic} alt={guide.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUser className="text-[#4A5C6A] text-[60px]" />
                                    )}
                                    {!editingPhoto && (
                                        <button
                                            onClick={startEditPhoto}
                                            className="absolute top-3 right-3 bg-[#06141B]/70 hover:bg-[#06141B] text-[#00C896] w-[32px] h-[32px] rounded-full flex items-center justify-center cursor-pointer"
                                        >
                                            <FaPen size={12} />
                                        </button>
                                    )}
                                </div>

                                {editingPhoto && (
                                    <div className="mt-4 bg-[#4A5C6A]/20 rounded-[15px] p-4">
                                        <label className="text-[#CCD0CF]/60 text-[12px] mb-3 block cursor-pointer">
                                            {uploadingPhoto ? "Uploading..." : "Choose a new photo"}
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                                        </label>
                                        <div className="flex gap-3 mt-2">
                                            <button
                                                onClick={savePhoto}
                                                disabled={savingPhoto || uploadingPhoto}
                                                className="flex-1 h-[38px] bg-[#00C896]/80 hover:bg-[#00C896] transition-all duration-300 text-white text-[13px] font-semibold rounded-[12px] cursor-pointer disabled:opacity-50"
                                            >
                                                {savingPhoto ? "Saving..." : "Save Photo"}
                                            </button>
                                            <button onClick={cancelEditPhoto} disabled={savingPhoto} className="flex-1 h-[38px] bg-[#4A5C6A] text-[#CCD0CF] text-[13px] font-semibold rounded-[12px] cursor-pointer">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h2 className="text-[#CCD0CF] text-[20px] font-bold">
                                    {guide.firstName} {guide.lastName}
                                </h2>
                                <p className="text-[#CCD0CF]/60 text-[13px] mt-1 mb-4">{guide.aboutYourSelf}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {spokenLanguages.map((lang) => (
                                        <span key={lang} className="bg-[#4A5C6A]/30 text-[#00C896] text-[11px] px-3 py-1 rounded-full">
                                            {lang}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {infoItems.map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="bg-[#4A5C6A]/30 rounded-[12px] p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className="text-[#00C896] text-[13px]" />
                                                <p className="text-[#CCD0CF]/60 text-[11px]">{label}</p>
                                            </div>
                                            <p className="text-[#CCD0CF] text-[14px] font-bold">{value}</p>
                                        </div>
                                    ))}

                                    <div className="bg-[#4A5C6A]/30 rounded-[12px] p-3 col-span-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <FaMoneyBillWave className="text-[#00C896] text-[13px]" />
                                                <p className="text-[#CCD0CF]/60 text-[11px]">Pricing</p>
                                            </div>
                                            {!editingPrice && (
                                                <button onClick={startEditPrice} className="text-[#00C896] cursor-pointer">
                                                    <FaPen size={10} />
                                                </button>
                                            )}
                                        </div>

                                        {editingPrice ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={hourInput}
                                                    onChange={(e) => setHourInput(e.target.value)}
                                                    placeholder="Per hour"
                                                    className="w-full h-[28px] bg-[#1B2B34] rounded-[8px] px-2 text-[#CCD0CF] text-[13px] outline-none"
                                                />
                                                <input
                                                    type="number"
                                                    value={dayInput}
                                                    onChange={(e) => setDayInput(e.target.value)}
                                                    placeholder="Per day"
                                                    className="w-full h-[28px] bg-[#1B2B34] rounded-[8px] px-2 text-[#CCD0CF] text-[13px] outline-none"
                                                />
                                                <button onClick={savePrice} disabled={savingPrice} className="text-[#00C896] cursor-pointer disabled:opacity-50">
                                                    <FaCheck size={12} />
                                                </button>
                                                <button onClick={cancelEditPrice} disabled={savingPrice} className="text-[#CD2F31] cursor-pointer">
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-[#CCD0CF] text-[14px] font-bold">
                                                {guide.currency} {guide.pricePerHour}/hr · {guide.currency} {guide.pricePerDay}/day
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}