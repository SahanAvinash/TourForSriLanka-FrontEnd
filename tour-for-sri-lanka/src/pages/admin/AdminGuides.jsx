import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminGuides() {
  return (
    <AdminApprovalTable
      title="Guides"
      fetchUrl="http://localhost:3000/api/guide"
      getId={(item) => item._id}
      getApproveUrl={(item) => `http://localhost:3000/api/guide/approve/${item._id}`}
      getRemoveUrl={(item) => `http://localhost:3000/api/guide/${item._id}`}
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
