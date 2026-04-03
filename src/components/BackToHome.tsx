import Link from "next/link";

export default function BackToHome({ className = "" }: { className?: string }) {
  return (
    <div className={`my-4 text-center ${className}`}>
      <Link href="/" className="inline-block rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-600 hover:shadow-xl">
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}
