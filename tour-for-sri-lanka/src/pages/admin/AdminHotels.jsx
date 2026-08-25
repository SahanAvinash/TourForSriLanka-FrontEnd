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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              item.isApproved 
                ? "bg-green-100 text-green-700 border border-green-300" 
                : "bg-yellow-100 text-yellow-700 border border-yellow-300"
            }`}>
              {item.isApproved ? "Approved" : "Pending"}
            </span>
          )
        },
        { header: "Email", render: (item) => item.email },
        { header: "District", render: (item) => item.district },
        { header: "Description", render: (item) => item.shortDescription },
      ]}
    />
  );
}