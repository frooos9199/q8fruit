import CateringTable from "./CateringTable";

export default function CateringPage() {
  return (
    <div>
      <h1 className="mb-4 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">إدارة الكاترينج</h1>
      <p className="mb-8 text-slate-600">هنا يمكنك إضافة تصنيفات كاترينج ومنتجاتها.</p>
      <CateringTable />
    </div>
  );
}