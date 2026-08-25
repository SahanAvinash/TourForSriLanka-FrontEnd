import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminApprovalTable({
  title,
  fetchUrl,
  extractList,
  getId,
  getApproveUrl,
  getRemoveUrl,
  columns,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  function loadItems() {
    setLoading(true);
    axios
      .get(fetchUrl, { headers: { Authorization: "Bearer " + token } })
      .then((res) => {
        let data = extractList ? extractList(res.data) : res.data;
        if (!Array.isArray(data) && data && typeof data === "object") {
          data = data.hotels || data.vehicles || data.guides || [];
        }
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        toast.error(`Failed to load ${title}`);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApprove(item) {
    axios
      .put(getApproveUrl(item), {}, { headers: { Authorization: "Bearer " + token } })
      .then(() => {
        toast.success("Approved successfully");
        loadItems();
      })
      .catch(() => toast.error("Approval failed"));
  }

  function handleRemove(item) {
    if (!window.confirm("Remove this entry permanently?")) return;
    axios
      .delete(getRemoveUrl(item), { headers: { Authorization: "Bearer " + token } })
      .then(() => {
        toast.success("Removed successfully");
        loadItems();
      })
      .catch(() => toast.error("Remove failed"));
  }

  const filtered = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#CCD0CF] text-xl font-bold">{title}</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1B2B34] text-[#CCD0CF] px-4 py-2 rounded-lg outline-none w-[250px] placeholder:text-[#4A5C6A]"
        />
      </div>

      {loading ? (
        <p className="text-[#CCD0CF]">Loading...</p>
      ) : (
        <div className="bg-[#1B2B34] rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#253745]">
              <tr>
                {columns.map((col) => (
                  <th key={col.header} className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">
                    {col.header}
                  </th>
                ))}
                <th className="text-[#CCD0CF] px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={getId(item)}
                  className="border-t border-[#253745] hover:bg-[#243b4a] transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.header} className="text-[#CCD0CF] px-4 py-3 text-sm">
                      {col.render(item)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {!item.isApproved && (
                        <button
                          onClick={() => handleApprove(item)}
                          className="bg-[#00C896] text-[#06141B] px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(item)}
                        className="bg-red-500/80 text-white px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center text-[#CCD0CF] px-4 py-6">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}