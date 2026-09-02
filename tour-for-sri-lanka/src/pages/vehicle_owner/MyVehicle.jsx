import { API_BASE_URL } from "../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCar,
  FaMoneyBillWave,
  FaUsers,
  FaSuitcase,
  FaGasPump,
  FaMapMarkerAlt,
  FaIdCard,
  FaCalendarAlt,
  FaPalette,
  FaPen,
  FaCheck,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import { MdVerified, MdPending } from "react-icons/md";
import ScrollFadeIn from "../../components/ScrollFadeIn";

export default function MyVehicle() {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [transportId, setTransportId] = useState(null);

  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState("");
  const [savingRate, setSavingRate] = useState(false);

  const [editingImages, setEditingImages] = useState(false);
  const [photoDraft, setPhotoDraft] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingImages, setSavingImages] = useState(false);

  function fetchVehicle(id) {
    return axios
      .get(`${API_BASE_URL}/api/transport/${id}`)
      .then((res) => {
        setVehicle(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    setTransportId(user._id);

    fetchVehicle(user._id).finally(() => setLoading(false));
  }, []);

  const photos = vehicle?.addVehiclePhotos?.length
    ? vehicle.addVehiclePhotos
    : [];

  const infoItems = vehicle
    ? [
        { icon: FaCar, label: "Vehicle Type", value: vehicle.vehicleType },
        { icon: FaIdCard, label: "Registration No", value: vehicle.registrationNo },
        {
          icon: FaCalendarAlt,
          label: "Manufacture Year",
          value: vehicle.manufactureYear,
        },
        { icon: FaPalette, label: "Color", value: vehicle.vehicleColor },
        {
          icon: FaUsers,
          label: "Passenger Capacity",
          value: `${vehicle.passengerCapacity} Seats`,
        },
        {
          icon: FaSuitcase,
          label: "Luggage Capacity",
          value: vehicle.luggageCapacity,
        },
        { icon: FaGasPump, label: "Fuel Type", value: vehicle.fuelType },
      ]
    : [];

  function startEditRate() {
    setRateInput(vehicle.ratePerKm);
    setEditingRate(true);
  }

  function cancelEditRate() {
    setEditingRate(false);
    setRateInput("");
  }

  function saveRate() {
    if (!rateInput || isNaN(rateInput) || Number(rateInput) < 1) {
      toast.error("Enter a valid rate");
      return;
    }
    setSavingRate(true);
    axios
      .put(`${API_BASE_URL}/api/transport/${transportId}`, {
        ratePerKm: rateInput,
      })
      .then((res) => {
        setVehicle(res.data);
        setEditingRate(false);
        toast.success("Rate updated successfully");
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to update rate");
      })
      .finally(() => {
        setSavingRate(false);
      });
  }

  function startEditImages() {
    setPhotoDraft(photos);
    setEditingImages(true);
  }

  function cancelEditImages() {
    setEditingImages(false);
    setPhotoDraft([]);
  }

  function removeDraftImage(index) {
    setPhotoDraft((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (photoDraft.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setUploadingImage(true);

    const uploadPromises = files.map((file) => {
      const formData = new FormData();
      formData.append("photo", file);
      return axios.post(`${API_BASE_URL}/api/transport/upload-photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    });

    Promise.all(uploadPromises)
      .then((responses) => {
        const urls = responses.map((res) => res.data.url);
        setPhotoDraft((prev) => [...prev, ...urls]);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Image upload failed");
      })
      .finally(() => {
        setUploadingImage(false);
        e.target.value = "";
      });
  }

  function saveImages() {
    if (photoDraft.length === 0) {
      toast.error("At least one image is required");
      return;
    }
    setSavingImages(true);
    axios
      .put(`${API_BASE_URL}/api/transport/${transportId}`, {
        addVehiclePhotos: photoDraft,
      })
      .then((res) => {
        setVehicle(res.data);
        setActiveImage(0);
        setEditingImages(false);
        toast.success("Images updated successfully");
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to update images");
      })
      .finally(() => {
        setSavingImages(false);
      });
  }

  return (
    <div className="w-full">
      {loading ? (
        <p className="text-[#CCD0CF]/60 text-sm">Loading vehicle details...</p>
      ) : !vehicle ? (
        <p className="text-[#CCD0CF]/60 text-sm">Vehicle details not found.</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <h1 className="text-[#CCD0CF] text-[20px] sm:text-[24px] font-bold">
              My Vehicle
            </h1>
            <span className="flex items-center gap-2 text-xs sm:text-[13px]">
              {vehicle.isApproved ? (
                <>
                  <MdVerified className="text-[#00C896] text-base sm:text-[18px]" />
                  <span className="text-[#00C896]">Approved</span>
                </>
              ) : (
                <>
                  <MdPending className="text-[#CD2F31] text-base sm:text-[18px]" />
                  <span className="text-[#CD2F31]">Pending Approval</span>
                </>
              )}
            </span>
          </div>

          <div className="bg-[#253745] rounded-[20px] p-4 sm:p-6 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <ScrollFadeIn className="flex flex-col h-full">
                <div className="w-full aspect-[16/10] sm:min-h-[280px] rounded-[15px] bg-[#1B2B34] overflow-hidden flex items-center justify-center relative shadow-inner">
                  {photos.length > 0 ? (
                    <img
                      src={photos[activeImage] || photos[0]}
                      alt={vehicle.vehicleBrand}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaCar className="text-[#4A5C6A] text-[50px] sm:text-[60px]" />
                  )}
                  {!editingImages && (
                    <button
                      onClick={startEditImages}
                      className="absolute top-3 right-3 bg-[#06141B]/70 hover:bg-[#06141B] text-[#00C896] w-[32px] h-[32px] rounded-full flex items-center justify-center cursor-pointer transition-colors duration-300 shadow-md"
                    >
                      <FaPen size={12} />
                    </button>
                  )}
                </div>

                {!editingImages && photos.length > 1 && (
                  <div className="flex gap-2 sm:gap-3 mt-3 overflow-x-auto pb-1">
                    {photos.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-[10px] overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all duration-300 ${
                          activeImage === index
                            ? "border-[#00C896]"
                            : "border-transparent"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {editingImages && (
                  <div className="mt-4 bg-[#4A5C6A]/20 rounded-[15px] p-3 sm:p-4">
                    <p className="text-[#CCD0CF]/60 text-[11px] sm:text-[12px] mb-3">
                      Manage Photos (max 5)
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {photoDraft.map((url, index) => (
                        <div
                          key={index}
                          className="relative w-[60px] h-[60px] sm:w-[70px] sm:h-[70px]"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover rounded-[10px]"
                          />
                          <button
                            type="button"
                            onClick={() => removeDraftImage(index)}
                            className="absolute -top-2 -right-2 bg-[#CD2F31] rounded-full w-[20px] h-[20px] flex items-center justify-center text-white text-[10px] cursor-pointer"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                      {photoDraft.length < 5 && (
                        <label className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-[10px] border-2 border-dashed border-[#4A5C6A] flex items-center justify-center cursor-pointer text-[#CCD0CF]/50 hover:text-[#00C896] hover:border-[#00C896] transition-all duration-300">
                          {uploadingImage ? "..." : <FaImage size={18} />}
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
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={saveImages}
                        disabled={savingImages || uploadingImage}
                        className="flex-1 h-[38px] bg-[#00C896]/80 hover:bg-[#00C896] transition-all duration-300 text-white text-[13px] font-semibold rounded-[12px] cursor-pointer disabled:opacity-50"
                      >
                        {savingImages ? "Saving..." : "Save Photos"}
                      </button>
                      <button
                        onClick={cancelEditImages}
                        disabled={savingImages}
                        className="flex-1 h-[38px] bg-[#4A5C6A] text-[#CCD0CF] text-[13px] font-semibold rounded-[12px] cursor-pointer transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </ScrollFadeIn>

              <ScrollFadeIn className="flex flex-col">
                <h2 className="text-[#CCD0CF] text-[18px] sm:text-[20px] font-bold capitalize">
                  {vehicle.vehicleBrand} {vehicle.vehicleModel}
                </h2>
                <p className="text-[#CCD0CF]/60 text-xs sm:text-[13px] mt-1 mb-4">
                  {vehicle.shortDescription}
                </p>

                <div className="flex items-start gap-2 mb-4">
                  <FaMapMarkerAlt className="text-[#00C896] text-[14px] mt-[3px] flex-shrink-0" />
                  <p className="text-[#CCD0CF] text-xs sm:text-[13px] break-words">
                    {vehicle.availableArea?.join(", ")}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {infoItems.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="bg-[#4A5C6A]/30 rounded-[12px] p-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="text-[#00C896] text-[13px] flex-shrink-0" />
                        <p className="text-[#CCD0CF]/60 text-[11px]">{label}</p>
                      </div>
                      <p className="text-[#CCD0CF] text-[13px] sm:text-[14px] font-bold truncate">
                        {value}
                      </p>
                    </div>
                  ))}

                  <div className="bg-[#4A5C6A]/30 rounded-[12px] p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <FaMoneyBillWave className="text-[#00C896] text-[13px] flex-shrink-0" />
                        <p className="text-[#CCD0CF]/60 text-[11px]">Rate per KM</p>
                      </div>
                      {!editingRate && (
                        <button
                          onClick={startEditRate}
                          className="text-[#00C896] cursor-pointer"
                        >
                          <FaPen size={10} />
                        </button>
                      )}
                    </div>

                    {editingRate ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={rateInput}
                          onChange={(e) => setRateInput(e.target.value)}
                          className="w-full h-[30px] bg-[#1B2B34] rounded-[8px] px-2 text-[#CCD0CF] text-[13px] outline-none"
                          autoFocus
                        />
                        <button
                          onClick={saveRate}
                          disabled={savingRate}
                          className="text-[#00C896] cursor-pointer disabled:opacity-50 flex-shrink-0"
                        >
                          <FaCheck size={12} />
                        </button>
                        <button
                          onClick={cancelEditRate}
                          disabled={savingRate}
                          className="text-[#CD2F31] cursor-pointer flex-shrink-0"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[#CCD0CF] text-[13px] sm:text-[14px] font-bold">
                        LKR {Number(vehicle.ratePerKm).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </>
      )}
    </div>
  );
}