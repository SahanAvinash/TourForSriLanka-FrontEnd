import AdminApprovalTable from "./AdminApprovalTable";

export default function AdminHotels() {
  return (
    <AdminApprovalTable
      title="Hotels"
      fetchUrl="http://localhost:3000/api/hotel"
      getId={(item) => item.email}
      getApproveUrl={(item) => `http://localhost:3000/api/hotel/approve/${item.email}`}
      getRemoveUrl={(item) => `http://localhost:3000/api/hotel/${item.email}`}
      columns={[
        { header: "Email", render: (item) => item.email },
        { header: "District", render: (item) => item.district },
        { header: "Description", render: (item) => item.shortDescription },
        { header: "Status", render: (item) => item.status },
      ]}
    />
  );
}
