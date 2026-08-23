import { API_BASE_URL } from "../../config/api";
import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminGuides() {
  return (
    <AdminApprovalTable
      title="Guides"
      fetchUrl={`${API_BASE_URL}/api/guide`}
      getId={(item) => item._id}
      getApproveUrl={(item) => `${API_BASE_URL}/api/guide/approve/${item._id}`}
      getRemoveUrl={(item) => `${API_BASE_URL}/api/guide/${item._id}`}
      columns={[
        { header: "Name", render: (item) => `${item.firstName || ""} ${item.lastName || ""}` },
        { header: "Email", render: (item) => item.email },
        { header: "District", render: (item) => item.district },
        { header: "License No.", render: (item) => item.GuideLicenseNumber },
        { header: "Price/Day", render: (item) => item.pricePerDay },
      ]}
    />
  );
}
