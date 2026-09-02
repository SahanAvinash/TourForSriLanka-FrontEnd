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
          { 
            header: "Price/Day", 
            render: (item) => {
              const oldDayPrice = item.oldPricePerDay || item.previousPricePerDay || item.oldPrice;
              const currency = item.currency || "LKR";
              return (
                <div className="flex flex-col text-xs space-y-1 bg-yellow-500/10 border border-yellow-500/30 p-2 rounded-lg">
                  {oldDayPrice ? (
                    <>
                      <span className="text-gray-300">Old Rate : {currency} {oldDayPrice}</span>
                      <span className="text-[#00C896] font-bold">New Rate : {currency} {item.pricePerDay}</span>
                    </>
                  ) : (
                    <span className="text-yellow-400 font-semibold">Rate : {currency} {item.pricePerDay}</span>
                  )}
                </div>
              );
            } 
          },
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

              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  <p><span className="text-gray-400">Name:</span> {selectedGuide.firstName} {selectedGuide.lastName}</p>
                  <p><span className="text-gray-400">Email:</span> {selectedGuide.email}</p>
                  <p><span className="text-gray-400">Mobile:</span> {selectedGuide.mobile}</p>
                  <p><span className="text-gray-400">NIC:</span> {selectedGuide.NIC}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Professional & Pricing Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  <p><span className="text-gray-400">License Number:</span> {selectedGuide.GuideLicenseNumber}</p>
                  <p><span className="text-gray-400">Experience:</span> {selectedGuide.yearsOfExperience} Years</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30 gap-2">
                    <span className="text-gray-300">Price Per Hour:</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                      {(selectedGuide.oldPricePerHour || selectedGuide.previousPricePerHour) ? (
                        <>
                          <span className="text-gray-300">
                            Old Rate : {selectedGuide.currency || "LKR"} {selectedGuide.oldPricePerHour || selectedGuide.previousPricePerHour}
                          </span>
                          <span className="text-[#00C896] font-bold">
                            New Rate : {selectedGuide.currency || "LKR"} {selectedGuide.pricePerHour}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#00C896] font-bold">{selectedGuide.currency || "LKR"} {selectedGuide.pricePerHour}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30 gap-2">
                    <span className="text-gray-300">Price Per Day:</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                      {(selectedGuide.oldPricePerDay || selectedGuide.previousPricePerDay || selectedGuide.oldPrice) ? (
                        <>
                          <span className="text-gray-300">
                            Old Rate : {selectedGuide.currency || "LKR"} {selectedGuide.oldPricePerDay || selectedGuide.previousPricePerDay || selectedGuide.oldPrice}
                          </span>
                          <span className="text-[#00C896] font-bold">
                            New Rate : {selectedGuide.currency || "LKR"} {selectedGuide.pricePerDay}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#00C896] font-bold">{selectedGuide.currency || "LKR"} {selectedGuide.pricePerDay}</span>
                      )}
                    </div>
                  </div>

                  {!selectedGuide.isApproved && (
                    <div className="sm:col-span-2 bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-yellow-300 text-xs flex items-center gap-2">
                      <span>⚠️</span>
                      <span>This profile / pricing has been recently updated and is awaiting admin approval.</span>
                    </div>
                  )}
                </div>
              </div>

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