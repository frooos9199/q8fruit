"use client";
import UsersTable from "./UsersTable";

export default function UsersPage() {
  return (
    <div>
      <h1 className="mb-4 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">إدارة المستخدمين</h1>
      <p className="mb-8 text-slate-600">هنا يمكنك عرض وتعديل بيانات المستخدمين.</p>
      <UsersTable />
    </div>
  );
}