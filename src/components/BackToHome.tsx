import Link from "next/link";

export default function BackToHome({ className = "" }: { className?: string }) {
  return (
    <div className={`my-4 text-center ${className}`}>
      <Link href="/" className="inline-block px-4 py-2 bg-green-600 text-white rounded-full font-bold shadow hover:bg-green-700 transition">
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}
