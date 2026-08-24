import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminTransport() {
  return (
    <AdminApprovalTable
      title="Transport"
      fetchUrl={`${API_BASE_URL}/api/transport/pending`}
      extractList={(data) => data.vehicles}
      getId={(item) => item._id}
      getApproveUrl={(item) => `${API_BASE_URL}/api/transport/approve/${item._id}`}
      getRemoveUrl={(item) => `${API_BASE_URL}/api/transport/${item._id}`}
      columns={[
        { header: "Owner", render: (item) => `${item.firstName || ""} ${item.lastName || ""}` },
        { header: "Email", render: (item) => item.email },
        { header: "Vehicle", render: (item) => `${item.vehicleBrand || ""} ${item.vehicleModel || ""}` },
        { header: "Type", render: (item) => item.vehicleType },
        { header: "Area", render: (item) => (item.availableArea || []).join(", ") },
      ]}
    />
  );
}