import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminHotels() {
  return (
    <AdminApprovalTable
      title="Hotels"
      fetchUrl={`${API_BASE_URL}/api/hotel`}
      extractList={(res) => res.hotels || res}
      getId={(item) => item.email}
      getApproveUrl={(item) => `${API_BASE_URL}/api/hotel/approve/${item.email}`}
      getRemoveUrl={(item) => `${API_BASE_URL}/api/hotel/${item.email}`}
      columns={[
        { header: "Email", render: (item) => item.email },
        { header: "District", render: (item) => item.district },
        { header: "Description", render: (item) => item.shortDescription },
        {
          header: "Approval Status",
          render: (item) => item.isApproved ? "Approved" : "Pending"
        }
      ]}
    />
  );
}
