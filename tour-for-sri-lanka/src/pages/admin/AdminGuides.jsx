import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

const DOCUMENTS = [
  { label: "NIC Document", key: "NICfile" },
  { label: "Guide License", key: "guiedLicense" },
];

export default function AdminGuides() {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const openPdf = (url) => {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  return (
    <>
      <AdminApprovalTable
        title="Guides"
        fetchUrl={`${API_BASE_URL}/api/guide`}
        extractList={(data) => data.guides || data}
        getId={(item) => item._id || item.email}
        getApproveUrl={(item) => `${API_BASE_URL}/api/guide/approve/${item._id || item.email}`}
        getRemoveUrl={(item) => `${API_BASE_URL}/api/guide/${item._id || item.email}`}
        columns={[
          { 
            header: "Status", 
            render: (item) => (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                item.isApproved 
                  ? "bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30" 
                  : "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
              }`}>
                {item.isApproved ? "Approved" : "Pending"}
              </span>
            )
          },
          { header: "Name", render: (item) => `${item.firstName || ""} ${item.lastName || ""}` },
          { header: "Email", render: (item) => item.email },
          { header: "District", render: (item) => item.district },
          { header: "License No.", render: (item) => item.GuideLicenseNumber },
          { header: "Price/Day", render: (item) => `${item.currency || "LKR"} ${item.pricePerDay}` },
          {
            header: "Actions",
            render: (item) => (
              <button
                type="button"
                onClick={() => setSelectedGuide(item)}
                className="text-[#00C896] bg-[#00C896]/10 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#00C896] hover:text-white active:scale-95 transition-all duration-300 cursor-pointer"
              >
                View Details & PDFs
              </button>
            ),
          },
        ]}
      />

      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto modal-backdrop-anim">
          <div className="hotel-detail-card-anim bg-[#1e293b] text-white w-full max-w-3xl rounded-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center gap-3 border-b border-gray-700 pb-4 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#00C896] truncate">
                {selectedGuide.firstName} {selectedGuide.lastName} - Guide Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="shrink-0 text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Profile Picture & Role */}
              {selectedGuide.profilePic && (
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl">
                  <img 
                    src={selectedGuide.profilePic} 
                    alt="Guide Profile" 
                    className="w-16 h-16 rounded-full object-cover border border-[#00C896]/30"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedGuide.firstName} {selectedGuide.lastName}</p>
                    <p className="text-xs text-[#00C896] uppercase tracking-wider font-medium">{selectedGuide.role || "Tourist Guide"}</p>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  <p><span className="text-gray-400">Name:</span> {selectedGuide.firstName} {selectedGuide.lastName}</p>
                  <p><span className="text-gray-400">Email:</span> {selectedGuide.email}</p>
                  <p><span className="text-gray-400">Mobile:</span> {selectedGuide.mobile}</p>
                  <p><span className="text-gray-400">NIC:</span> {selectedGuide.NIC}</p>
                  <p><span className="text-gray-400">Date of Birth:</span> {selectedGuide.dateOfBirth ? new Date(selectedGuide.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                  <p><span className="text-gray-400">Gender:</span> {selectedGuide.gender}</p>
                  <p><span className="text-gray-400">Marital Status:</span> {selectedGuide.maritalStatus}</p>
                  <p><span className="text-gray-400">Ethnicity:</span> {selectedGuide.ethnicity || "N/A"}</p>
                  <p><span className="text-gray-400">Country:</span> {selectedGuide.country}</p>
                  <p><span className="text-gray-400">Province / District:</span> {selectedGuide.province}, {selectedGuide.district}</p>
                  <p className="sm:col-span-2"><span className="text-gray-400">Address:</span> {selectedGuide.address}</p>
                </div>
              </div>

              {/* Professional Details & Pricing */}
              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Professional & Pricing Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  <p><span className="text-gray-400">License Number:</span> {selectedGuide.GuideLicenseNumber}</p>
                  <p><span className="text-gray-400">Experience:</span> {selectedGuide.yearsOfExperience} Years</p>
                  <p><span className="text-gray-400">Price Per Hour:</span> {selectedGuide.currency} {selectedGuide.pricePerHour}</p>
                  <p><span className="text-gray-400">Price Per Day:</span> {selectedGuide.currency} {selectedGuide.pricePerDay}</p>
                  <p><span className="text-gray-400">Max Guests:</span> {selectedGuide.maximumGuests}</p>
                </div>
                {selectedGuide.aboutYourSelf && (
                  <div className="mt-3 bg-black/20 p-4 rounded-xl">
                    <p className="text-gray-400 mb-1">About Self:</p>
                    <p className="text-gray-300">{selectedGuide.aboutYourSelf}</p>
                  </div>
                )}
                {selectedGuide.additionalFields && (
                  <div className="mt-3 bg-black/20 p-4 rounded-xl">
                    <p className="text-gray-400 mb-1">Additional Notes:</p>
                    <p className="text-gray-300">{selectedGuide.additionalFields}</p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {selectedGuide.skill && (
                <div>
                  <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                    Skills & Tour Types
                  </h3>
                  <div className="flex flex-wrap gap-2 bg-black/20 p-4 rounded-xl">
                    {Object.entries(selectedGuide.skill).map(
                      ([key, value]) =>
                        value && (
                          <span
                            key={key}
                            className="bg-[#00C896]/20 text-[#00C896] px-2.5 py-1 rounded-lg text-xs capitalize"
                          >
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Languages */}
              {selectedGuide.languages && (
                <div>
                  <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                    Languages Known
                  </h3>
                  <div className="flex flex-wrap gap-2 bg-black/20 p-4 rounded-xl">
                    {Object.entries(selectedGuide.languages).map(
                      ([key, value]) =>
                        value && (
                          <span
                            key={key}
                            className="bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg text-xs capitalize"
                          >
                            {key}
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded Documents */}
              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Uploaded Documents & Verification Files
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  {DOCUMENTS.map(
                    (doc, idx) =>
                      selectedGuide[doc.key] && (
                        <div
                          key={doc.key}
                          style={{ animationDelay: `${idx * 0.08}s` }}
                          className="animate-box bg-black/30 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <span className="text-xs text-white">📄 {doc.label}</span>
                          <button
                            type="button"
                            onClick={() => openPdf(selectedGuide[doc.key])}
                            className="text-xs bg-[#00C896]/20 text-[#00C896] px-3 py-1.5 rounded hover:bg-[#00C896] hover:text-white active:scale-95 transition-all cursor-pointer font-semibold w-full sm:w-auto"
                          >
                            View PDF
                          </button>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="bg-gray-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-600 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}