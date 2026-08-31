import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminHotels() {
  const [selectedHotel, setSelectedHotel] = useState(null);

  return (
    <>
      <AdminApprovalTable
        title="Hotels"
        fetchUrl={`${API_BASE_URL}/api/hotel`}
        extractList={(data) => data.hotels || []}
        getId={(item) => item._id || item.email}
        getApproveUrl={(item) => `${API_BASE_URL}/api/hotel/approve/${item.email}`}
        getRemoveUrl={(item) => `${API_BASE_URL}/api/hotel/${item.email}`}
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
          { header: "Hotel Name", render: (item) => item.name },
          { header: "Owner", render: (item) => `${item.firstName || ""} ${item.lastName || ""}` },
          { header: "Email", render: (item) => item.email },
          { header: "Mobile", render: (item) => item.ownerMobile },
          { header: "District", render: (item) => item.district },
          { 
            header: "Actions", 
            render: (item) => (
              <button
                type="button"
                onClick={() => setSelectedHotel(item)}
                className="text-[#00C896] bg-[#00C896]/10 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#00C896] hover:text-white transition-all duration-300 cursor-pointer"
              >
                View Details & PDFs
              </button>
            ) 
          },
        ]}
      />

      {/* Modal Popup for Hotel & Owner Details */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1e293b] text-white w-full max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
              <h2 className="text-xl font-bold text-[#00C896]">
                {selectedHotel.name} - Full Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedHotel(null)}
                className="text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Owner Details */}
              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Owner Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  <p><span className="text-gray-400">Name:</span> {selectedHotel.firstName} {selectedHotel.lastName}</p>
                  <p><span className="text-gray-400">Email:</span> {selectedHotel.email}</p>
                  <p><span className="text-gray-400">Mobile:</span> {selectedHotel.ownerMobile}</p>
                  <p><span className="text-gray-400">NIC / Passport:</span> {selectedHotel.nicOrPassport}</p>
                </div>
              </div>

              {/* Hotel Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Hotel Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
                  <p><span className="text-gray-400">Hotel Type:</span> {selectedHotel.hotelType || "N/A"}</p>
                  <p><span className="text-gray-400">District:</span> {selectedHotel.district}</p>
                  <p className="sm:col-span-2"><span className="text-gray-400">Address:</span> {selectedHotel.address}</p>
                  <p><span className="text-gray-400">Phone 1:</span> {selectedHotel.phone1}</p>
                  <p><span className="text-gray-400">Phone 2:</span> {selectedHotel.phone2 || "N/A"}</p>
                  <p><span className="text-gray-400">BR Number:</span> {selectedHotel.BRnumber}</p>
                  <p><span className="text-gray-400">License Number:</span> {selectedHotel.licenseNumber}</p>
                </div>
                {selectedHotel.shortDescription && (
                  <div className="mt-3 bg-black/20 p-4 rounded-xl">
                    <p className="text-gray-400 mb-1">Description:</p>
                    <p className="text-gray-300">{selectedHotel.shortDescription}</p>
                  </div>
                )}
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                  Facilities
                </h3>
                <div className="flex flex-wrap gap-2 bg-black/20 p-4 rounded-xl">
                  {Object.entries(selectedHotel.facilities || {}).map(([key, value]) => (
                    value && (
                      <span key={key} className="bg-[#00C896]/20 text-[#00C896] px-2.5 py-1 rounded-lg text-xs capitalize">
                        {key}
                      </span>
                    )
                  ))}
                  {selectedHotel.otherFacility?.map((facility, index) => (
                    <span key={index} className="bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg text-xs">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              {/* Uploaded Documents & PDFs */}
<div>
  <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
    Uploaded Documents & Verification Files
  </h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl">
    {[
      { label: "BR Certificate", url: selectedHotel.brCertificate },
      { label: "Hotel License", url: selectedHotel.hotelLicenseFile },
      { label: "Owner ID / Passport", url: selectedHotel.ownerIdFile },
      { label: "Address Proof", url: selectedHotel.addressProofFile },
    ].map((doc, idx) => (
      doc.url && (
        <div key={idx} className="bg-black/30 p-3 rounded-lg flex items-center justify-between">
          <span className="text-xs text-white">📄 {doc.label}</span>
          <div className="flex gap-2">
            {/* Direct view / Google Viewer link */}
            <a 
              href={`https://docs.google.com/gview?url=${encodeURIComponent(doc.url)}&embedded=true`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs bg-[#00C896]/20 text-[#00C896] px-2.5 py-1 rounded hover:bg-[#00C896] hover:text-white transition-all"
            >
              Preview
            </a>
            {/* Direct download/open link */}
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs bg-gray-700 text-gray-300 px-2.5 py-1 rounded hover:bg-gray-600 transition-all"
            >
              Download
            </a>
          </div>
        </div>
      )
    ))}
  </div>
</div>

              {/* Images Preview */}
              {selectedHotel.images?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#00C896] uppercase tracking-wider mb-2">
                    Hotel Images
                  </h3>
                  <div className="grid grid-cols-3 gap-2 bg-black/20 p-4 rounded-xl">
                    {selectedHotel.images.map((imgUrl, index) => (
                      <a key={index} href={imgUrl} target="_blank" rel="noopener noreferrer">
                        <img src={imgUrl} alt="Hotel preview" className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHotel(null)}
                className="bg-gray-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-600 transition-all cursor-pointer"
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