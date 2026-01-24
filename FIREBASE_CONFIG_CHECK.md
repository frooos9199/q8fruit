# 🔥 فحص إعدادات Firebase

## ✅ الإعدادات الحالية في المشروع

### من `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBW2-EDd8K8Nq5Uj5fJFaeAzQnchjcdbJU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fruitq8-ba5ef.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fruitq8-ba5ef
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fruitq8-ba5ef.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=496410641214
NEXT_PUBLIC_FIREBASE_APP_ID=1:496410641214:web:bc829a07ac23b9ba0ae26f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-0HH05NRQ77
```

### من `firebase.ts`:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBW2-EDd8K8Nq5Uj5fJFaeAzQnchjcdbJU",
  authDomain: "fruitq8-ba5ef.firebaseapp.com",
  projectId: "fruitq8-ba5ef",
  storageBucket: "fruitq8-ba5ef.firebasestorage.app",
  messagingSenderId: "496410641214",
  appId: "1:496410641214:web:bc829a07ac23b9ba0ae26f",
  measurementId: "G-0HH05NRQ77"
};
```

## ✅ التطابق: جميع الأرقام متطابقة

---

## 🔍 خطوات التحقق من Vercel

### 1. تسجيل الدخول إلى Vercel Dashboard:
https://vercel.com/dashboard

### 2. اختر المشروع: `fruitq8`

### 3. اذهب إلى: Settings → Environment Variables

### 4. تأكد من وجود هذه المتغيرات:

| المتغير | القيمة المطلوبة |
|---------|-----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBW2-EDd8K8Nq5Uj5fJFaeAzQnchjcdbJU` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `fruitq8-ba5ef.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `fruitq8-ba5ef` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `fruitq8-ba5ef.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `496410641214` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:496410641214:web:bc829a07ac23b9ba0ae26f` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-0HH05NRQ77` |

---

## ⚠️ أسباب محتملة لفشل الحذف من Firebase

### 1. صلاحيات Firestore Rules
تحقق من قواعد Firestore في Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // السماح بالقراءة للجميع
    match /{document=**} {
      allow read: if true;
    }
    
    // السماح بالكتابة والحذف للمستخدمين المصادق عليهم فقط
    match /products/{productId} {
      allow write, delete: if request.auth != null;
    }
    
    match /orders/{orderId} {
      allow write: if true;
      allow read, delete: if request.auth != null;
    }
  }
}
```

### 2. التحقق من المصادقة (Authentication)
- تأكد من تسجيل دخول المستخدم قبل محاولة الحذف
- تحقق من أن المستخدم لديه صلاحيات Admin

### 3. فحص الكود في ProductTable.tsx
الكود الحالي يحذف من localStorage أولاً ثم يحاول الحذف من Firebase في الخلفية.

---

## 🔧 الحل المقترح

### إذا كانت المشكلة في Firestore Rules:

1. اذهب إلى Firebase Console
2. Firestore Database → Rules
3. استبدل القواعد بالقواعد أعلاه
4. انشر التغييرات

### إذا كانت المشكلة في المصادقة:

تحقق من أن المستخدم مسجل دخول في `ProductTable.tsx`:

```typescript
import { auth } from '../../../lib/firebase';

const removeProduct = async (id: number) => {
  // التحقق من المصادقة
  if (!auth?.currentUser) {
    console.error('❌ المستخدم غير مسجل دخول');
    alert('⚠️ يجب تسجيل الدخول أولاً');
    return;
  }
  
  // باقي الكود...
};
```

---

## 📝 ملاحظات

- جميع الأرقام في `.env.local` و `firebase.ts` متطابقة ✅
- يجب التأكد من نفس الإعدادات في Vercel Dashboard
- المشكلة غالباً في صلاحيات Firestore أو المصادقة
