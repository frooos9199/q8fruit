"use client";
import { useState, useEffect } from 'react';

interface Product {
  name: string;
  active: boolean;
}

interface User {
  name: string;
  email: string;
}

interface Order {
  id: string;
  customer: string;
  total: number;
}

declare global {
  interface Window {
    addFruitProducts?: () => void;
  }
}

export default function NanoConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // أوامر متاحة
  const commands = {
    help: () => 'الأوامر المتاحة:\n- clear: مسح الشاشة\n- products: عرض المنتجات\n- addproducts: إضافة منتجات الفواكه\n- clearproducts: مسح جميع المنتجات\n- reload: إعادة تحميل البيانات من Firebase\n- users: عرض المستخدمين\n- orders: عرض الطلبات\n- admin: تفعيل وضع الإدارة\n- refresh: إعادة تحميل الصفحة',
    clear: () => { setOutput([]); return ''; },
    products: () => {
      const products: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
      return `عدد المنتجات: ${products.length}\n${products.map((p) => `- ${p.name} (${p.active ? 'مفعل' : 'معطل'})`).join('\n')}`;
    },
    addproducts: () => {
      if (typeof window.addFruitProducts === 'function') {
        window.addFruitProducts();
        return 'تم إضافة منتجات الفواكه!';
      }
      return 'خطأ: دالة إضافة المنتجات غير متاحة';
    },
    clearproducts: () => {
      localStorage.removeItem('products');
      // إعادة تحميل البيانات من Firebase بعد المسح
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
      return 'تم مسح جميع المنتجات وإعادة تحميل الصفحة';
    },
    users: () => {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      return `عدد المستخدمين: ${users.length}\n${users.map((u) => `- ${u.name} (${u.email})`).join('\n')}`;
    },
    orders: () => {
      const orders: Order[] = JSON.parse(localStorage.getItem('orders') || '[]');
      return `عدد الطلبات: ${orders.length}\n${orders.map((o) => `- طلب #${o.id} - ${o.customer} - ${o.total} د.ك`).join('\n')}`;
    },
    admin: () => {
      localStorage.setItem('isAdmin', 'true');
      return 'تم تفعيل وضع الإدارة';
    },
    reload: () => {
      // إعادة تحميل البيانات من Firebase
      if (typeof window !== 'undefined' && window.location) {
        // محاولة إعادة تحميل البيانات من Firebase أولاً
        try {
          // استدعاء دالة إعادة تحميل البيانات إذا كانت متاحة
          const win = window as { forceReloadData?: () => void };
          if (win.forceReloadData) {
            win.forceReloadData();
            return 'جاري إعادة تحميل البيانات من Firebase...';
          } else {
            // إعادة تحميل الصفحة كحل بديل
            window.location.reload();
            return 'جاري إعادة تحميل الصفحة...';
          }
        } catch {
          window.location.reload();
          return 'جاري إعادة تحميل الصفحة...';
        }
      }
      return 'غير متاح في هذا السياق';
    },
  };

  // تنفيذ الأوامر
  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    if (trimmedCmd === '') return;

    setHistory(prev => [...prev, cmd]);
    setOutput(prev => [...prev, `> ${cmd}`]);

    if (commands[trimmedCmd as keyof typeof commands]) {
      const result = commands[trimmedCmd as keyof typeof commands]();
      if (result) {
        setOutput(prev => [...prev, result]);
      }
    } else {
      setOutput(prev => [...prev, `خطأ: أمر غير معروف "${cmd}". اكتب "help" لعرض الأوامر المتاحة.`]);
    }

    setCommand('');
    setHistoryIndex(-1);
  };

  // التحكم بالكيبورد
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  // فتح/إغلاق الكونسول بـ Ctrl+`
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800 text-green-400 p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="فتح Nano Console (Ctrl+`)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
      <div className="w-full h-96 bg-gray-900 text-green-400 font-mono text-sm border-t-2 border-green-400">
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-green-400">
          <span className="text-green-300 font-bold">Q8 Fruit Nano Console</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Ctrl+` للإغلاق</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-red-400 hover:text-red-300 font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="h-80 overflow-y-auto p-2 space-y-1">
          <div className="text-green-300">مرحباً بك في Q8 Fruit Console! اكتب &quot;help&quot; لعرض الأوامر المتاحة.</div>
          {output.map((line, index) => (
            <div key={index} className={line.startsWith('>') ? 'text-yellow-400' : 'text-green-400'}>
              {line}
            </div>
          ))}
          
          {/* Input */}
          <div className="flex items-center">
            <span className="text-green-300 mr-2">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-green-400 outline-none"
              placeholder="اكتب أمر..."
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
}