"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "الرئيسية", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
  { href: "/offers", label: "العروض", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l2.4 4.9L20 9l-4 3.9.9 5.6-4.9-2.6-4.9 2.6.9-5.6-4-3.9 5.6-1.1L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
  { href: "/cart", label: "السلة", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6h15l-1.5 9h-13L6 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1" fill="currentColor" />
      <circle cx="18" cy="20" r="1" fill="currentColor" />
    </svg>
  ) },
  { href: "/account", label: "البروفايل", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) }
];

export default function BottomNav() {
  const pathname = usePathname();
  const isHidden = pathname?.startsWith("/admin");

  if (isHidden) return null;

  return (
    <>
      <div className="h-20 sm:h-24" aria-hidden="true" />
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-emerald-100/80 bg-white/88 shadow-[0_-12px_30px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-2 py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-200"
                      : "text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-current"}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
