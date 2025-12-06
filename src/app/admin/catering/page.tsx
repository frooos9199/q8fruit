import CateringTable from "./CateringTable";

export default function CateringPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إدارة الكاترينج</h1>
      <p className="mb-8">هنا يمكنك إضافة تصنيفات كاترينج ومنتجاتها.</p>
      <CateringTable />
    </div>
  );
}