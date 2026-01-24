"use client";
import { useState, useEffect } from "react";
import UserEditModal from "./UserEditModal";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  role: "عميل" | "مدير" | "مندوب";
  password: string;
}

const initialUsers: User[] = [
  { id: 1, name: "محمد أحمد", email: "mohamed@email.com", phone: "55512345", active: true, role: "عميل", password: "1234" },
  { id: 2, name: "سارة علي", email: "sara@email.com", phone: "55567890", active: true, role: "عميل", password: "1234" },
  { id: 3, name: "مدير النظام", email: "summit_kw@hotmail.com", phone: "55500000", active: true, role: "مدير", password: "admin1234" },
  { id: 4, name: "خالد يوسف", email: "khaled@email.com", phone: "55522222", active: false, role: "عميل", password: "1234" },
];

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editUser, setEditUser] = useState<User | null>(null);

  // تحميل المستخدمين من Firebase
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (typeof window === 'undefined') return;

    try {
      setLoading(true);
      
      // 🔥 جلب من Firebase أولاً
      if (db) {
        try {
          const snapshot = await getDocs(collection(db, 'users'));
          
          if (!snapshot.empty) {
            const firebaseUsers = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: parseInt(doc.id),
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                active: data.active === true,
                role: data.role || 'عميل',
                password: data.password || '1234'
              } as User;
            });
            
            const uniqueUsers = Array.from(
              new Map(firebaseUsers.map(u => [u.id, u])).values()
            ) as User[];
            
            console.log('✅ تم جلب المستخدمين من Firebase:', uniqueUsers);
            setUsers(uniqueUsers);
            window.localStorage.setItem('users', JSON.stringify(uniqueUsers));
            setLoading(false);
            return;
          } else {
            console.log('⚠️ Firebase فارغ، استخدام البيانات الافتراضية');
          }
        } catch (fbError) {
          console.error('❌ خطأ Firebase:', fbError);
        }
      }
      
      // fallback: localStorage أو initialUsers
      const stored = window.localStorage.getItem('users');
      if (stored) {
        const parsed = JSON.parse(stored) as User[];
        console.log('📦 تم جلب المستخدمين من localStorage:', parsed);
        setUsers(parsed);
      } else {
        console.log('🆕 استخدام البيانات الافتراضية');
        setUsers(initialUsers);
        window.localStorage.setItem('users', JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error('❌ خطأ عام:', error);
      setUsers(initialUsers);
    } finally {
      setLoading(false);
    }
  };

  // تفعيل/إيقاف مستخدم
  const toggleActive = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    const newStatus = !user.active;
    console.log(`🔄 تغيير حالة ${user.name} من ${user.active} إلى ${newStatus}`);
    
    const updatedUsers = users.map(u => 
      u.id === id ? { ...u, active: newStatus } : u
    );
    
    setUsers(updatedUsers);
    window.localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // حفظ في Firebase
    if (db) {
      try {
        const userToUpdate = updatedUsers.find(u => u.id === id);
        if (userToUpdate) {
          await setDoc(doc(db, 'users', id.toString()), userToUpdate);
          console.log('✅ تم تحديث الحالة في Firebase');
        }
      } catch (error) {
        console.error('❌ خطأ في تحديث Firebase:', error);
        alert('⚠️ تم التحديث محلياً فقط');
      }
    }
  };

  // حذف مستخدم
  const handleDeleteUser = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) return;
    
    console.log(`🗑️ حذف المستخدم ${id} - ${user.name}`);
    
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    window.localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // حذف من Firebase
    if (db) {
      try {
        await deleteDoc(doc(db, 'users', id.toString()));
        console.log('✅ تم حذف المستخدم من Firebase');
        alert('✅ تم حذف المستخدم بنجاح!');
      } catch (error) {
        console.error('❌ خطأ في حذف المستخدم من Firebase:', error);
        alert('⚠️ تم حذف المستخدم محلياً فقط');
      }
    } else {
      alert('✅ تم حذف المستخدم بنجاح!');
    }
  };

  // تعديل مستخدم
  const handleEditSave = async (updated: User) => {
    console.log('💾 حفظ تعديلات المستخدم:', updated);
    
    const updatedUsers = users.map(u => u.id === updated.id ? updated : u);
    setUsers(updatedUsers);
    window.localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // حفظ في Firebase
    if (db) {
      try {
        await setDoc(doc(db, 'users', updated.id.toString()), updated);
        console.log('✅ تم تحديث المستخدم في Firebase');
        alert('✅ تم حفظ التعديلات بنجاح!');
      } catch (error) {
        console.error('❌ خطأ في تحديث Firebase:', error);
        alert('⚠️ تم الحفظ محلياً فقط');
      }
    } else {
      alert('✅ تم حفظ التعديلات!');
    }
    
    setEditUser(null);
  };

  const filteredUsers = users.filter(user => {
    const nameMatch = user.name.includes(filter) || user.email.includes(filter) || user.phone.includes(filter);
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "active" && user.active) ||
      (filterStatus === "inactive" && !user.active);
    return nameMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">🔄 جاري التحميل...</div>
      </div>
    );
  }

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
              <tr key={`user-${user.id}-${user.email}`} className="border-b">
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

      {editUser && (
        <UserEditModal
          user={editUser}
          onSave={handleEditSave}
          onClose={() => setEditUser(null)}
        />
      )}
    </div>
  );
}
