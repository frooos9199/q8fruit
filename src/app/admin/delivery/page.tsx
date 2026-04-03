import DeliverySettings from "./DeliverySettings";

export default function DeliveryPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">إعدادات التوصيل</h1>
      <DeliverySettings />
    </div>
  );
}