"use client";
import OrdersTable from "./OrdersTable";

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إدارة الطلبات</h1>
      <p className="mb-8">هنا يمكنك عرض وإدارة جميع الطلبات.</p>
      <OrdersTable />
    </div>
  );
}