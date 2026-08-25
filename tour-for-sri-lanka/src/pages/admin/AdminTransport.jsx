import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminVehicles() {
  return (
    <AdminApprovalTable
      title="Vehicles"
      fetchUrl={`${API_BASE_URL}/api/vehicle`}
      extractList={(res) => res.vehicles || res.vehicle || res.data || res}
      getId={(item) => item.email || item._id}
      getApproveUrl={(item) => `${API_BASE_URL}/api/vehicle/approve/${item.email}`}
      getRemoveUrl={(item) => `${API_BASE_URL}/api/vehicle/${item.email}`}
      columns={[
        { header: "Email", render: (item) => item.email },
        { header: "Vehicle Type", render: (item) => item.vehicleType || item.type || "N/A" },
        { header: "District", render: (item) => item.district || "N/A" },
        {
          header: "Status",
          render: (item) => (
            <span className={item.isApproved ? "text-[#00C896] font-semibold" : "text-yellow-400 font-semibold"}>
              {item.isApproved ? "Approved" : "Pending"}
            </span>
          )
        }
      ]}
    />
  );
}