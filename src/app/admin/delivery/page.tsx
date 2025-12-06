import DeliverySettings from "./DeliverySettings";

export default function DeliveryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">إعدادات التوصيل</h1>
      <DeliverySettings />
    </div>
  );
}