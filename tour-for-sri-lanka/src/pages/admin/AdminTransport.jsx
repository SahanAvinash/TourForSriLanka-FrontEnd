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
    <>
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
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
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
          { header: "Type", render: (item) => item.vehicleType },
          { header: "Area", render: (item) => (item.availableArea || []).join(", ") },
          {
            header: "Actions",
            render: (item) => (
              <button
                type="button"
                onClick={() => setSelectedTransport(item)}
                className="text-[#00C896] bg-[#00C896]/10 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#00C896] hover:text-white active:scale-95 transition-all duration-300 cursor-pointer"
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
            <div className="flex justify-between items-center gap-3 border-b border-gray-700 pb-4 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#00C896] truncate">
                {selectedTransport.firstName} {selectedTransport.lastName} - Transport Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedTransport(null)}
                className="shrink-0 text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Profile Photo & Basic Role Header */}
              {selectedTransport.profilePhoto && (
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl">
                  <img 
                    src={selectedTransport.profilePhoto} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover border border-[#00C896]/30"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedTransport.firstName} {selectedTransport.lastName}</p>
                    <p className="text-xs text-[#00C896] uppercase tracking-wider font-medium">{selectedTransport.role || "Driver/Owner"}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Owner & Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  <p><span className="text-gray-400">Name:</span> {selectedTransport.firstName} {selectedTransport.lastName}</p>
                  <p><span className="text-gray-400">Email:</span> {selectedTransport.email}</p>
                  <p><span className="text-gray-400">Mobile:</span> {selectedTransport.mobile}</p>
                  <p><span className="text-gray-400">NIC:</span> {selectedTransport.NIC}</p>
                  <p><span className="text-gray-400">Country:</span> {selectedTransport.country}</p>
                  <p><span className="text-gray-400">Role:</span> {selectedTransport.role}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Vehicle & Technical Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  <p><span className="text-gray-400">Brand & Model:</span> {selectedTransport.vehicleBrand} {selectedTransport.vehicleModel}</p>
                  <p><span className="text-gray-400">Vehicle Type:</span> {selectedTransport.vehicleType}</p>
                  <p><span className="text-gray-400">Registration No:</span> {selectedTransport.registrationNo}</p>
                  <p><span className="text-gray-400">Manufacture Year:</span> {selectedTransport.manufactureYear}</p>
                  <p><span className="text-gray-400">Chassis Number:</span> {selectedTransport.chassisNumber}</p>
                  <p><span className="text-gray-400">Color:</span> {selectedTransport.vehicleColor}</p>
                  <p><span className="text-gray-400">Fuel Type:</span> {selectedTransport.fuelType}</p>
                  <p><span className="text-gray-400">Passenger Capacity:</span> {selectedTransport.passengerCapacity}</p>
                  <p><span className="text-gray-400">Luggage Capacity:</span> {selectedTransport.luggageCapacity}</p>
                  <p><span className="text-gray-400">Rate Per Km:</span> LKR {selectedTransport.ratePerKm}</p>
                  <p className="sm:col-span-2"><span className="text-gray-400">Available Areas:</span> {(selectedTransport.availableArea || []).join(", ")}</p>
                </div>
                {selectedTransport.shortDescription && (
                  <div className="mt-3 bg-black/20 p-4 rounded-xl">
                    <p className="text-gray-400 mb-1">Description:</p>
                    <p className="text-gray-300">{selectedTransport.shortDescription}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Uploaded Documents & Verification Files
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  {DOCUMENTS.map(
                    (doc, idx) =>
                      selectedTransport[doc.key] && (
                        <div
                          key={doc.key}
                          style={{ animationDelay: `${idx * 0.08}s` }}
                          className="animate-box bg-black/30 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <span className="text-xs text-white">📄 {doc.label}</span>
                          <button
                            type="button"
                            onClick={() => openPdf(selectedTransport[doc.key])}
                            className="text-xs bg-[#00C896]/20 text-[#00C896] px-3 py-1.5 rounded hover:bg-[#00C896] hover:text-white active:scale-95 transition-all cursor-pointer font-semibold w-full sm:w-auto"
                          >
                            View PDF
                          </button>
                        </div>
                      )
                  )}
                </div>
              </div>

              {selectedTransport.addVehiclePhotos?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                    Vehicle Photos
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/20 p-4 rounded-xl">
                    {selectedTransport.addVehiclePhotos.map((imgUrl, index) => (
                      <a
                        key={index}
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ animationDelay: `${index * 0.06}s` }}
                        className="animate-box block"
                      >
                        <img
                          src={imgUrl}
                          alt="Vehicle preview"
                          className="w-full h-24 object-cover rounded-lg hover:opacity-80 hover:scale-[1.02] transition-all duration-300"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTransport(null)}
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