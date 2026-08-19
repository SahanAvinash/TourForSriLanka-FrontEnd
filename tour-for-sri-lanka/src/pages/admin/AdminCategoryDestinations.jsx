import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

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
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

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
    setEditingId(null);
    setName("");
    setDescription("");
    setLocation("");
    setImage(null);
    setPreview("");
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
    setPreview(destination.image);
    setImage(null);
    setShowModal(true);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Destination name is required");
      return;
    }
    if (!editingId && !image) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("category", categoryId);
    if (image) formData.append("image", image);

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
      .catch(() => toast.error("Failed to save destination"));
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
              {filtered.map((destination) => (
                <tr
                  key={destination._id}
                  className="border-t border-[#253745] hover:bg-[#243b4a] transition-colors"
                >
                  <td className="px-4 py-3">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
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
              ))}
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
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#253745] text-[#CCD0CF] px-3 py-2 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-[#CCD0CF] text-sm mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#253745] text-[#CCD0CF] px-3 py-2 rounded-lg outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-[#CCD0CF] text-sm mb-1 block">Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="text-[#CCD0CF] text-sm" />
                {preview && (
                  <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg mt-2" />
                )}
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-[#4A5C6A] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00C896] text-[#06141B] px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}