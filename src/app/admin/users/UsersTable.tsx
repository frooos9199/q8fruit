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
  language?: "ar" | "en" | "bn";
  password?: string;
}

const resolveRoleLabel = (rawRole: unknown, isAdmin: boolean) => {
  const roleValue = typeof rawRole === "string" ? rawRole.toLowerCase() : "";

  if (roleValue === "admin" || rawRole === "مدير" || isAdmin) return "مدير";
  if (roleValue === "delivery" || rawRole === "مندوب") return "مندوب";
  return "عميل";
};

const toFirestoreRole = (role?: string) => {
  if (role === "مدير") return "admin";
  if (role === "مندوب") return "delivery";
  return "user";
};

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
        const data = doc.data() as Record<string, unknown>;
        const isAdmin = data.isAdmin === true || data.role === 'admin' || data.role === 'مدير';
        const isBlocked = data.isBlocked === true || data.active === false;
        const rawLanguage = typeof data.language === 'string' ? data.language.trim().toLowerCase() : '';
        const language = rawLanguage === 'en' || rawLanguage === 'bn' || rawLanguage === 'ar' ? (rawLanguage as User['language']) : undefined;

        return {
          id: doc.id,
          name: typeof data.name === 'string' ? data.name : '',
          email: typeof data.email === 'string' ? data.email : '',
          phone: typeof data.phone === 'string' ? data.phone : '',
          active: !isBlocked,
          isAdmin,
          isBlocked,
          role: resolveRoleLabel(data.role, isAdmin),
          language,
          password: typeof data.password === 'string' ? data.password : ''
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

    const firestoreRole = toFirestoreRole(updated.role);
    const normalizedUser = {
      ...updated,
      role: updated.role,
      isAdmin: firestoreRole === 'admin',
      isBlocked: !updated.active,
      active: updated.active,
      language: updated.language,
    };
    
    const updatedUsers = users.map(u => u.id === updated.id ? normalizedUser : u);
    setUsers(updatedUsers);
    
    if (db) {
      try {
        const payload: Record<string, unknown> = {
          id: updated.id,
          uid: updated.id,
          name: updated.name,
          email: updated.email.trim().toLowerCase(),
          phone: updated.phone,
          role: firestoreRole,
          isAdmin: firestoreRole === 'admin',
          active: updated.active,
          isBlocked: !updated.active,
          updatedAt: new Date(),
        };

        if (updated.language) {
          payload.language = updated.language;
        }

        await setDoc(doc(db, 'users', updated.id), payload, { merge: true });
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
        <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 text-center">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
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
              <tr key={`user-${user.id}-${user.email}`} className="border-b border-slate-200 hover:bg-emerald-50/50 transition-colors">
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
                      className="rounded-lg bg-cyan-600 px-3 py-1 text-white"
                  >
                    تعديل
                  </button>
                </td>
                <td className="p-2">
                  {user.isAdmin ? (
                    <span className="text-slate-400 text-xs">لا يمكن حذف المدير</span>
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
