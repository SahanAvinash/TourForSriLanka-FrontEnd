import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminHotels() {
  return (
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
          header: "Documents & Details", 
          render: (item) => (
            <a 
              href={`/hotel/${item._id}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#00C896] underline text-xs font-semibold hover:text-white"
            >
              View Full Info & PDFs
            </a>
          ) 
        },
      ]}
    />
  );
}