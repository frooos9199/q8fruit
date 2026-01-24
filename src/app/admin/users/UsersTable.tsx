"use client";
import { useState, useEffect } from "react";
import UserEditModal from "./UserEditModal";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
  role?: "عميل" | "مدير" | "مندوب";
  password?: string;
}

const initialUsers: User[] = [];

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
      console.log('🔥 بدء جلب المستخدمين من Firebase...');
      
      if (!db) {
        console.error('❌ Firebase غير مهيأ');
        setUsers([]);
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(collection(db, 'users'));
      
      if (snapshot.empty) {
        console.log('⚠️ Firebase فارغ');
        setUsers([]);
        setLoading(false);
        return;
      }

      const firebaseUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          active: !data.isBlocked,
          isAdmin: data.isAdmin || false,
          isBlocked: data.isBlocked || false,
          role: data.isAdmin ? 'مدير' : 'عميل',
          password: data.password || ''
        } as User;
      });
      
      console.log(`✅ تم جلب ${firebaseUsers.length} مستخدم من Firebase`);
      console.table(firebaseUsers);
      setUsers(firebaseUsers);
      
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدمين:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    const newBlockedStatus = !user.isBlocked;
    console.log(`🔄 تغيير حالة ${user.name} - isBlocked: ${newBlockedStatus}`);
    
    const updatedUsers = users.map(u => 
      u.id === id ? { ...u, isBlocked: newBlockedStatus, active: !newBlockedStatus } : u
    );
    
    setUsers(updatedUsers);
    
    if (db) {
      try {
        await setDoc(doc(db, 'users', id), { isBlocked: newBlockedStatus }, { merge: true });
        console.log('✅ تم تحديث الحالة في Firebase');
      } catch (error) {
        console.error('❌ خطأ في تحديث Firebase:', error);
        alert('⚠️ تم التحديث محلياً فقط');
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    if (user.isAdmin) {
      alert('❌ لا يمكن حذف المدير');
      return;
    }
    
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) return;
    
    console.log(`🗑️ حذف المستخدم ${id} - ${user.name}`);
    
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    
    if (db) {
      try {
        await deleteDoc(doc(db, 'users', id));
        console.log('✅ تم حذف المستخدم من Firebase');
        alert('✅ تم حذف المستخدم بنجاح!');
      } catch (error) {
        console.error('❌ خطأ في حذف المستخدم من Firebase:', error);
        alert('⚠️ فشل الحذف');
      }
    }
  };

  const handleEditSave = async (updated: User) => {
    console.log('💾 حفظ تعديلات المستخدم:', updated);
    
    const updatedUsers = users.map(u => u.id === updated.id ? updated : u);
    setUsers(updatedUsers);
    
    if (db) {
      try {
        await setDoc(doc(db, 'users', updated.id), updated, { merge: true });
        console.log('✅ تم تحديث المستخدم في Firebase');
        alert('✅ تم حفظ التعديلات بنجاح!');
      } catch (error) {
        console.error('❌ خطأ في تحديث Firebase:', error);
        alert('⚠️ فشل الحفظ');
      }
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
                <td className="p-2">{user.role || (user.isAdmin ? 'مدير' : 'عميل')}</td>
                <td className="p-2">
                  {user.isBlocked ? (
                    <span className="text-red-600 font-bold">محظور</span>
                  ) : (
                    <span className="text-green-600 font-bold">مفعل</span>
                  )}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => toggleActive(user.id)}
                    className={`px-3 py-1 rounded text-white ${user.isBlocked ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {user.isBlocked ? "تفعيل" : "حظر"}
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
                  {user.isAdmin ? (
                    <span className="text-gray-400 text-xs">لا يمكن حذف المدير</span>
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
