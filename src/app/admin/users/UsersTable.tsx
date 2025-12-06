"use client";


"use client";
import { useState, useEffect } from "react";
import UserEditModal from "./UserEditModal";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  role: "عميل" | "مدير";
  password: string;
}

const initialUsers: User[] = [
  { id: 1, name: "محمد أحمد", email: "mohamed@email.com", phone: "55512345", active: true, role: "عميل", password: "1234" },
  { id: 2, name: "سارة علي", email: "sara@email.com", phone: "55567890", active: true, role: "عميل", password: "1234" },
  { id: 3, name: "مدير النظام", email: "summit_kw@hotmail.com", phone: "55500000", active: true, role: "مدير", password: "admin1234" },
  { id: 4, name: "خالد يوسف", email: "khaled@email.com", phone: "55522222", active: false, role: "عميل", password: "1234" },
];

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("users");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return initialUsers;
        }
      }
    }
    return initialUsers;
  });

  // مزامنة تلقائية عند تغيير بيانات localStorage (مثلاً عند إضافة مستخدم جديد)
  useEffect(() => {
    const syncUsers = () => {
      const stored = window.localStorage.getItem("users");
      if (stored) {
        try {
          setUsers(JSON.parse(stored));
        } catch {
          setUsers(initialUsers);
        }
      } else {
        setUsers(initialUsers);
      }
    };
    window.addEventListener("usersUpdated", syncUsers);
    // تحديث عند الرجوع للصفحة أو إعادة تحميلها
    syncUsers();
    return () => {
      window.removeEventListener("usersUpdated", syncUsers);
    };
  }, []);
  const [filter, setFilter] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editUser, setEditUser] = useState<User | null>(null);

  const toggleActive = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const filteredUsers = users.filter(user => {
    const nameMatch = user.name.includes(filter) || user.email.includes(filter) || user.phone.includes(filter);
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "active" && user.active) ||
      (filterStatus === "inactive" && !user.active);
    return nameMatch && statusMatch;
  });

  const handleEditSave = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setEditUser(null);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-bold mb-1">بحث</label>
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border rounded p-2 min-w-[180px]"
            placeholder="اسم أو إيميل أو رقم..."
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">الحالة</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded p-2 min-w-[120px]"
          >
            <option value="all">الكل</option>
            <option value="active">مفعل</option>
            <option value="inactive">موقوف</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-center">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2">الاسم</th>
              <th className="p-2">الإيميل</th>
              <th className="p-2">رقم الهاتف</th>
              <th className="p-2">الدور</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">تفعيل/إيقاف</th>
              <th className="p-2">تعديل</th>
              <th className="p-2">حذف</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.phone}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  {user.active ? (
                    <span className="text-green-600 font-bold">مفعل</span>
                  ) : (
                    <span className="text-red-600 font-bold">موقوف</span>
                  )}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => toggleActive(user.id)}
                    className={`px-3 py-1 rounded text-white ${user.active ? "bg-red-500" : "bg-green-500"}`}
                  >
                    {user.active ? "إيقاف" : "تفعيل"}
                  </button>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => setEditUser(user)}
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                  >
                    تعديل
                  </button>
                </td>
                <td className="p-2">
                  {user.email === "summit_kw@hotmail.com" ? (
                    <span className="text-gray-400 text-xs">لا يمكن حذف الأدمن</span>
                  ) : (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-800"
                    >
                      حذف
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* دالة حذف المستخدم */}
      {/* يجب أن تكون داخل جسم الدالة الرئيسية */}
      {editUser && (
        <UserEditModal
          user={editUser}
          onSave={handleEditSave}
          onClose={() => setEditUser(null)}
        />
      )}
    </div>
  );

  function handleDeleteUser(id: number) {
    if (typeof window === "undefined") return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    window.localStorage.setItem("users", JSON.stringify(updated));
    window.dispatchEvent(new Event("usersUpdated"));
  }
}
