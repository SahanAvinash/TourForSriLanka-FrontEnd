import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ImagePlus } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  function loadCategories() {
    setLoading(true);
    axios
      .get("http://localhost:3000/api/category", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setImage(null);
    setPreview("");
    setShowModal(false);
  }

  function openAddModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(category) {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description || "");
    setPreview(category.image);
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
      toast.error("Category name is required");
      return;
    }
    if (!editingId && !image) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) formData.append("image", image);

    const request = editingId
      ? axios.put(`http://localhost:3000/api/category/${editingId}`, formData, {
          headers: { Authorization: "Bearer " + token },
        })
      : axios.post("http://localhost:3000/api/category", formData, {
          headers: { Authorization: "Bearer " + token },
        });

    request
      .then(() => {
        toast.success(editingId ? "Category updated" : "Category added");
        resetForm();
        loadCategories();
      })
      .catch(() => toast.error("Failed to save category"));
  }

  function handleDelete(category) {
    if (!window.confirm(`Delete category "${category.name}"? This cannot be undone.`)) return;
    axios
      .delete(`http://localhost:3000/api/category/${category._id}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(() => {
        toast.success("Category deleted");
        loadCategories();
      })
      .catch(() => toast.error("Failed to delete category"));
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#CCD0CF] text-xl font-bold">Categories</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1B2B34] text-[#CCD0CF] px-4 py-2 rounded-[20px] outline-none w-[250px] placeholder:text-[#4A5C6A] text-[12px]"
          />
          <button
            onClick={openAddModal}
            className="bg-[#00C896]/80 text-[#CCD0CF] px-4 py-2 rounded-[20px] font-semibold hover:opacity-80 transition duration-300 text-[14px]"
          >
            + Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[#CCD0CF]">Loading...</p>
      ) : (
        <div className="bg-[#1B2B34] rounded-[20px] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#253745]">
              <tr>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Image</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Name</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Description</th>
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((category) => (
                <tr
                  key={category._id}
                  className="border-t border-[#253745] hover:bg-[#243b4a] transition-colors"
                >
                  <td className="px-4 py-3">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                  </td>
                  <td className="text-[#CCD0CF] px-4 py-3 text-sm font-medium">{category.name}</td>
                  <td className="text-[#CCD0CF] px-4 py-3 text-sm max-w-[300px] truncate">
                    {category.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/categories/${category._id}`}
                        className="bg-[#00C896]/80 text-[#CCD0CF] px-3 py-1 rounded-[20px] font-semibold hover:opacity-80 transition duration-300"
                      >
                        Destinations
                      </Link>
                      <button
                        onClick={() => openEditModal(category)}
                        className="bg-[#4A5C6A] text-[#CCD0CF] px-3 py-1 rounded-[20px] font-semibold hover:opacity-80 transition duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="bg-red-500/80 text-[#CCD0CF] px-3 py-1 rounded-[20px] font-semibold hover:opacity-80 transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-[#CCD0CF] px-4 py-6">
                    No categories found
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
              {editingId ? "Edit Category" : "Add Category"}
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
                <label
                  htmlFor="categoryImage"
                  className="flex flex-col items-center justify-center w-24 h-24 bg-[#253745] border-2 border-dashed border-[#4A5C6A] rounded-lg cursor-pointer hover:border-[#00C896] transition-colors overflow-hidden"
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[#4A5C6A]">
                      <ImagePlus size={22} />
                      <span className="text-[10px]">Upload</span>
                    </div>
                  )}
                </label>
                <input
                  id="categoryImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-[#4A5C6A] text-white px-4 py-2 rounded-[20px] font-semibold hover:opacity-80 transition duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00C896] text-[#06141B] px-4 py-2 rounded-[20px] font-semibold hover:opacity-80 transition duration-300 cursor-pointer"
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