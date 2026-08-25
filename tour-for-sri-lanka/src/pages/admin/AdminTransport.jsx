import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminTransport() {
  return (
    <AdminApprovalTable
      title="Transport"
      fetchUrl={`${API_BASE_URL}/api/transport/pending`}
      extractList={(data) => data.vehicles || []}
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
      ]}
    />
  );
}