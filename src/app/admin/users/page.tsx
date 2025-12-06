"use client";
import UsersTable from "./UsersTable";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إدارة المستخدمين</h1>
      <p className="mb-8">هنا يمكنك عرض وتعديل بيانات المستخدمين.</p>
      <UsersTable />
    </div>
  );
}