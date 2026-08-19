import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminTransport() {
  return (
    <AdminApprovalTable
      title="Transport"
      fetchUrl="http://localhost:3000/api/transport/vehicles"
      extractList={(data) => data.vehicles}
      getId={(item) => item._id}
      getApproveUrl={(item) => `http://localhost:3000/api/transport/approve/${item._id}`}
      getRemoveUrl={(item) => `http://localhost:3000/api/transport/${item._id}`}
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
