import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

const DOCUMENTS = [
  { label: "Driving License", key: "drivingLicense" },
  { label: "Vehicle Registration Certificate", key: "vehicleRegistrationCertificate" },
  { label: "Insurance Certificate", key: "insuranceCertificate" },
  { label: "Revenue License", key: "revenueLicense" },
];

export default function AdminTransport() {
  const [selectedTransport, setSelectedTransport] = useState(null);

  const openPdf = (url) => {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  return (
    <div className="admin-content-anim w-full overflow-x-hidden">
      <AdminApprovalTable
        title="Transport"
        fetchUrl={`${API_BASE_URL}/api/transport/pending`}
        extractList={(data) => data.vehicles || data.transports || []}
        getId={(item) => item._id}
        getApproveUrl={(item) => `${API_BASE_URL}/api/transport/approve/${item._id}`}
        getRemoveUrl={(item) => `${API_BASE_URL}/api/transport/${item._id}`}
        columns={[
          { 
            header: "Status", 
            render: (item) => (
              <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border ${
                item.isApproved 
                  ? "bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30" 
                  : "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
              }`}>
                {item.isApproved ? "Approved" : "Pending"}
              </span>
            )
          },
          { header: "Owner", render: (item) => `${item.firstName || ""} ${item.lastName || ""}` },
          { header: "Email", render: (item) => item.email },
          { header: "Vehicle", render: (item) => `${item.vehicleBrand || ""} ${item.vehicleModel || ""}` },
          { 
            header: "Rate / Km", 
            render: (item) => {
              const oldRate = item.oldRatePerKm || item.previousRatePerKm || item.oldRate;
              const newRate = item.ratePerKm || item.newRatePerKm;
              
              if (!item.isApproved || oldRate) {
                return (
                  <div className="flex flex-col gap-1 bg-yellow-500/10 border border-yellow-500/30 p-2 rounded-lg my-1 min-w-[140px] max-w-[180px]">
                    <div className="flex justify-between items-center text-[11px] text-gray-400 border-b border-yellow-500/20 pb-0.5">
                      <span>Old:</span>
                      <span className="line-through text-gray-300">LKR {oldRate || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-[#00C896]">
                      <span>New:</span>
                      <span>LKR {newRate}</span>
                    </div>
                  </div>
                );
              }

              return (
                <span className="text-white font-semibold text-xs">LKR {newRate}</span>
              );
            } 
          },
          { header: "Area", render: (item) => (item.availableArea || []).join(", ") },
          {
            header: "Actions",
            render: (item) => (
              <button
                type="button"
                onClick={() => setSelectedTransport(item)}
                className="text-[#00C896] bg-[#00C896]/10 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#00C896] hover:text-white active:scale-95 transition-all duration-300 cursor-pointer whitespace-nowrap"
              >
                View Details & PDFs
              </button>
            ),
          },
        ]}
      />

      {selectedTransport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto modal-backdrop-anim">
          <div className="hotel-detail-card-anim bg-[#1e293b] text-white w-full max-w-3xl rounded-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-700">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center gap-3 border-b border-gray-700 pb-3 sm:pb-4 mb-4">
              <h2 className="text-base sm:text-xl font-bold text-[#00C896] truncate">
                {selectedTransport.firstName} {selectedTransport.lastName} - Transport Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedTransport(null)}
                className="shrink-0 text-gray-400 hover:text-white text-lg sm:text-xl font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-4 sm:space-y-6 text-sm">
              
              {/* Profile Header Box */}
              {selectedTransport.profilePhoto && (
                <div className="flex items-center gap-3 sm:gap-4 bg-black/20 p-3 sm:p-4 rounded-xl vehicle-info-card-anim">
                  <img 
                    src={selectedTransport.profilePhoto} 
                    alt="Profile" 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border border-[#00C896]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{selectedTransport.firstName} {selectedTransport.lastName}</p>
                    <p className="text-xs text-[#00C896] uppercase tracking-wider font-medium">{selectedTransport.role || "Driver/Owner"}</p>
                  </div>
                </div>
              )}

              {/* Owner Info */}
              <div className="vehicle-info-card-anim">
                <h3 className="text-xs sm:text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Owner & Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-black/20 p-3 sm:p-4 rounded-xl text-xs sm:text-sm">
                  <p className="truncate"><span className="text-gray-400">Name:</span> {selectedTransport.firstName} {selectedTransport.lastName}</p>
                  <p className="truncate"><span className="text-gray-400">Email:</span> {selectedTransport.email}</p>
                  <p className="truncate"><span className="text-gray-400">Mobile:</span> {selectedTransport.mobile}</p>
                  <p className="truncate"><span className="text-gray-400">NIC:</span> {selectedTransport.NIC}</p>
                </div>
              </div>

              {/* Vehicle & Pricing Info */}
              <div className="vehicle-info-card-anim">
                <h3 className="text-xs sm:text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Vehicle & Pricing Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-black/20 p-3 sm:p-4 rounded-xl text-xs sm:text-sm">
                  <p className="truncate"><span className="text-gray-400">Brand & Model:</span> {selectedTransport.vehicleBrand} {selectedTransport.vehicleModel}</p>
                  <p className="truncate"><span className="text-gray-400">Vehicle Type:</span> {selectedTransport.vehicleType}</p>
                  <p className="truncate"><span className="text-gray-400">Registration No:</span> {selectedTransport.registrationNo}</p>
                  
                  {/* Clean Rate Box */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-yellow-500/10 p-3 rounded-lg sm:col-span-2 border border-yellow-500/30 gap-2">
                    <span className="text-gray-300 font-medium">Rate Per Km:</span>
                    <div className="flex items-center gap-4 text-xs">
                      {(!selectedTransport.isApproved || selectedTransport.oldRatePerKm || selectedTransport.previousRatePerKm || selectedTransport.oldRate) ? (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 line-through">
                            Old: LKR {selectedTransport.oldRatePerKm || selectedTransport.previousRatePerKm || selectedTransport.oldRate || "N/A"}
                          </span>
                          <span className="text-[#00C896] font-bold bg-[#00C896]/10 px-2 py-1 rounded">
                            New: LKR {selectedTransport.ratePerKm}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#00C896] font-bold">LKR {selectedTransport.ratePerKm}</span>
                      )}
                    </div>
                  </div>

                  <p><span className="text-gray-400">Passenger Capacity:</span> {selectedTransport.passengerCapacity}</p>
                  <p><span className="text-gray-400">Luggage Capacity:</span> {selectedTransport.luggageCapacity}</p>
                </div>
              </div>

              {/* Documents Section */}
              <div className="vehicle-info-card-anim">
                <h3 className="text-xs sm:text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Uploaded Documents & Verification Files
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-black/20 p-3 sm:p-4 rounded-xl">
                  {DOCUMENTS.map(
                    (doc, idx) =>
                      selectedTransport[doc.key] && (
                        <div
                          key={doc.key}
                          style={{ animationDelay: `${idx * 0.08}s` }}
                          className="animate-box bg-black/30 p-2.5 sm:p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <span className="text-xs text-white truncate">📄 {doc.label}</span>
                          <button
                            type="button"
                            onClick={() => openPdf(selectedTransport[doc.key])}
                            className="text-xs bg-[#00C896]/20 text-[#00C896] px-3 py-1.5 rounded hover:bg-[#00C896] hover:text-white active:scale-95 transition-all cursor-pointer font-semibold w-full sm:w-auto shrink-0"
                          >
                            View PDF
                          </button>
                        </div>
                      )
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTransport(null)}
                className="bg-gray-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-600 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}