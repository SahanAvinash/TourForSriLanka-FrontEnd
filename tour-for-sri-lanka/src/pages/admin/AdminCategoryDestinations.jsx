import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { ImagePlus, X } from "lucide-react";

// fix default leaflet marker icon paths breaking under vite bundling
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const MAX_IMAGES = 5;

// handles click-to-pick on the map
function LocationClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// re-centers the map when a search result is picked
function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function AdminCategoryDestinations() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [saving, setSaving] = useState(false);

  // existingImages = URLs already saved on the destination (only used when editing)
  // newImages = File objects picked in this session, newPreviews = their object URLs
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // map picker modal state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [mapResults, setMapResults] = useState([]);
  const [mapSearching, setMapSearching] = useState(false);
  const [tempLat, setTempLat] = useState(null);
  const [tempLng, setTempLng] = useState(null);
  const [tempAddress, setTempAddress] = useState("");
  const [flyTarget, setFlyTarget] = useState(null);
  const searchDebounceRef = useRef(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  function loadCategory() {
    axios
      .get(`http://localhost:3000/api/category/${categoryId}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setCategory(res.data))
      .catch(() => toast.error("Failed to load category"));
  }

  function loadDestinations() {
    setLoading(true);
    axios
      .get(`http://localhost:3000/api/destination/category/${categoryId}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setDestinations(res.data))
      .catch(() => toast.error("Failed to load destinations"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCategory();
    loadDestinations();
  }, [categoryId]);

  function resetForm() {
    // revoke any object URLs so we don't leak memory
    newPreviews.forEach((url) => URL.revokeObjectURL(url));

    setEditingId(null);
    setName("");
    setDescription("");
    setLocation("");
    setLatitude(null);
    setLongitude(null);
    setExistingImages([]);
    setNewImages([]);
    setNewPreviews([]);
    setSaving(false);
    setShowModal(false);
  }

  function openAddModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(destination) {
    setEditingId(destination._id);
    setName(destination.name);
    setDescription(destination.description || "");
    setLocation(destination.location || "");
    setLatitude(destination.latitude ?? null);
    setLongitude(destination.longitude ?? null);
    // support old data that only has a single "image" field, and new "images" array
    setExistingImages(destination.images?.length ? destination.images : destination.image ? [destination.image] : []);
    setNewImages([]);
    setNewPreviews([]);
    setShowModal(true);
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const slotsLeft = MAX_IMAGES - existingImages.length - newImages.length;
    if (slotsLeft <= 0) {
      toast.error(`You can only have ${MAX_IMAGES} images`);
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, slotsLeft);
    if (files.length > filesToAdd.length) {
      toast.error(`Only ${slotsLeft} more image(s) allowed, max ${MAX_IMAGES}`);
    }

    setNewImages((prev) => [...prev, ...filesToAdd]);
    setNewPreviews((prev) => [...prev, ...filesToAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = ""; // allow re-selecting the same file later
  }

  function removeExistingImage(index) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index) {
    URL.revokeObjectURL(newPreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Destination name is required");
      return;
    }
    if (existingImages.length + newImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("category", categoryId);
    if (latitude != null) formData.append("latitude", latitude);
    if (longitude != null) formData.append("longitude", longitude);

    // images the user kept from before (edit mode) - backend keeps these as-is
    if (editingId) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }
    // new files to upload
    newImages.forEach((file) => formData.append("images", file));

    setSaving(true);

    const request = editingId
      ? axios.put(`http://localhost:3000/api/destination/${editingId}`, formData, {
          headers: { Authorization: "Bearer " + token, "Content-Type": "multipart/form-data" },
        })
      : axios.post("http://localhost:3000/api/destination", formData, {
          headers: { Authorization: "Bearer " + token, "Content-Type": "multipart/form-data" },
        });

    request
      .then(() => {
        toast.success(editingId ? "Destination updated" : "Destination added");
        resetForm();
        loadDestinations();
      })
      .catch(() => toast.error("Failed to save destination"))
      .finally(() => setSaving(false));
  }

  function handleDelete(destination) {
    if (!window.confirm(`Delete destination "${destination.name}"? This cannot be undone.`)) return;
    axios
      .delete(`http://localhost:3000/api/destination/${destination._id}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(() => {
        toast.success("Destination deleted");
        loadDestinations();
      })
      .catch(() => toast.error("Failed to delete destination"));
  }

  const filtered = destinations.filter((d) =>
    JSON.stringify(d).toLowerCase().includes(search.toLowerCase())
  );

  // ---------- map picker ----------

  function openMapPicker() {
    setTempLat(latitude);
    setTempLng(longitude);
    setTempAddress(location);
    setMapQuery("");
    setMapResults([]);
    setFlyTarget(null);
    setShowMapPicker(true);
  }

  function closeMapPicker() {
    setShowMapPicker(false);
  }

  function reverseGeocode(lat, lng) {
    axios
      .get("https://nominatim.openstreetmap.org/reverse", {
        params: { format: "json", lat, lon: lng },
      })
      .then((res) => {
        const address = res.data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setTempAddress(address);
      })
      .catch(() => {
        setTempAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });
  }

  function handleMapClick(lat, lng) {
    setTempLat(lat);
    setTempLng(lng);
    reverseGeocode(lat, lng);
  }

  function handleMapSearchChange(value) {
    setMapQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!value.trim()) {
      setMapResults([]);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      setMapSearching(true);
      axios
        .get("https://nominatim.openstreetmap.org/search", {
          params: { format: "json", q: value, countrycodes: "lk", limit: 5 },
        })
        .then((res) => setMapResults(res.data || []))
        .catch(() => setMapResults([]))
        .finally(() => setMapSearching(false));
    }, 500);
  }

  function selectMapResult(result) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setTempLat(lat);
    setTempLng(lng);
    setTempAddress(result.display_name);
    setMapResults([]);
    setMapQuery(result.display_name);
    setFlyTarget([lat, lng]);
  }

  function confirmMapPick() {
    if (tempLat == null || tempLng == null) {
      toast.error("Please pick a location on the map first");
      return;
    }
    setLatitude(tempLat);
    setLongitude(tempLng);
    setLocation(tempAddress);
    setShowMapPicker(false);
  }

  const mapCenter = tempLat != null && tempLng != null ? [tempLat, tempLng] : SRI_LANKA_CENTER;
  const mapZoom = tempLat != null && tempLng != null ? 13 : 8;
  const totalImageCount = existingImages.length + newImages.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/admin/categories" className="text-[#00C896] text-sm hover:underline">
            ← Back to Categories
          </Link>
          <h2 className="text-[#CCD0CF] text-xl font-bold mt-1">
            {category ? category.name : "..."} — Destinations
          </h2>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1B2B34] text-[#CCD0CF] px-4 py-2 rounded-lg outline-none w-[250px] placeholder:text-[#4A5C6A]"
          />
          <button
            onClick={openAddModal}
            className="bg-[#00C896] text-[#06141B] px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition"
          >
            + Add Destination
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[#CCD0CF]">Loading...</p>
      ) : (
        <div className="bg-[#1B2B34] rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#253745]">
              <tr>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Image</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Name</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Location</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Description</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((destination) => {
                const thumb = destination.images?.[0] || destination.image;
                const extraCount = (destination.images?.length || (destination.image ? 1 : 0)) - 1;
                return (
                  <tr
                    key={destination._id}
                    className="border-t border-[#253745] hover:bg-[#243b4a] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="relative w-14 h-14">
                        <img
                          src={thumb}
                          alt={destination.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        {extraCount > 0 && (
                          <span className="absolute -bottom-1 -right-1 bg-[#00C896] text-[#06141B] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            +{extraCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-[#CCD0CF] px-4 py-3 text-sm font-medium">{destination.name}</td>
                    <td className="text-[#CCD0CF] px-4 py-3 text-sm">{destination.location || "-"}</td>
                    <td className="text-[#CCD0CF] px-4 py-3 text-sm max-w-[250px] truncate">
                      {destination.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(destination)}
                          className="bg-[#4A5C6A] text-white px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(destination)}
                          className="bg-red-500/80 text-white px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#CCD0CF] px-4 py-6">
                    No destinations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1B2B34] rounded-xl p-6 w-[420px]">
            <h3 className="text-[#CCD0CF] text-lg font-bold mb-4">
              {editingId ? "Edit Destination" : "Add Destination"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[#CCD0CF] text-sm mb-1 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#253745] text-[#CCD0CF] px-3 py-2 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-[#CCD0CF] text-sm mb-1 block">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Search or pick on map"
                    className="w-full bg-[#253745] text-[#CCD0CF] px-3 py-2 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={openMapPicker}
                    className="bg-[#00C896] text-[#06141B] px-3 py-2 rounded-lg font-semibold hover:opacity-80 transition whitespace-nowrap"
                  >
                    📍 Map
                  </button>
                </div>
                {latitude != null && longitude != null && (
                  <p className="text-[#4A5C6A] text-xs mt-1">
                    {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[#CCD0CF] text-sm mb-1 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#253745] text-[#CCD0CF] px-3 py-2 rounded-lg outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-[#CCD0CF] text-sm mb-1 block">
                  Images ({totalImageCount}/{MAX_IMAGES})
                </label>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} className="relative w-20 h-20">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((url, i) => (
                    <div key={`new-${i}`} className="relative w-20 h-20">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {totalImageCount < MAX_IMAGES && (
                    <label
                      htmlFor="destinationImages"
                      className="flex flex-col items-center justify-center w-20 h-20 bg-[#253745] border-2 border-dashed border-[#4A5C6A] cursor-pointer hover:border-[#00C896] transition-colors"
                    >
                      <ImagePlus size={20} className="text-[#4A5C6A]" />
                      <span className="text-[10px] text-[#4A5C6A]">Add</span>
                    </label>
                  )}
                </div>
                <input
                  id="destinationImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="bg-[#4A5C6A] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#00C896] text-[#06141B] px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (editingId ? "Updating..." : "Saving...") : (editingId ? "Update" : "Add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMapPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-[#1B2B34] rounded-xl p-5 w-[560px]">
            <h3 className="text-[#CCD0CF] text-lg font-bold mb-3">Pick Location</h3>

            <div className="relative mb-3 z-[1000]">
              <input
                type="text"
                value={mapQuery}
                onChange={(e) => handleMapSearchChange(e.target.value)}
                placeholder="Search for a place in Sri Lanka..."
                className="w-full bg-[#253745] text-[#CCD0CF] px-3 py-2 rounded-lg outline-none"
              />
              {mapSearching && <p className="text-[#4A5C6A] text-xs mt-1">Searching...</p>}
              {mapResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-[#253745] rounded-lg mt-1 max-h-[180px] overflow-y-auto z-10">
                  {mapResults.map((r) => (
                    <button
                      type="button"
                      key={r.place_id}
                      onClick={() => selectMapResult(r)}
                      className="block w-full text-left text-[#CCD0CF] text-sm px-3 py-2 hover:bg-[#00C896]/20 transition"
                    >
                      {r.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative z-0 rounded-lg overflow-hidden" style={{ height: 320 }}>
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {tempLat != null && tempLng != null && <Marker position={[tempLat, tempLng]} />}
                <LocationClickHandler onPick={handleMapClick} />
                <FlyToPosition position={flyTarget} />
              </MapContainer>
            </div>

            <p className="text-[#4A5C6A] text-xs mt-2">
              Click anywhere on the map to drop a pin, or search above.
            </p>

            {tempAddress && (
              <p className="text-[#CCD0CF] text-sm mt-2 truncate">{tempAddress}</p>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={closeMapPicker}
                className="bg-[#4A5C6A] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMapPick}
                className="bg-[#00C896] text-[#06141B] px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}