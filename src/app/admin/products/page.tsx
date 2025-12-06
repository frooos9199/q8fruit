"use client";
// import ProductImageUploader from './ProductImageUploader';
import ProductTable from './ProductTable';

import { useRef } from "react";
import { useState } from "react";

export default function ProductsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [refresh, setRefresh] = useState(0);

  // تصدير المنتجات كـ XML
  const handleExportXML = () => {
    const products = JSON.parse(window.localStorage.getItem("products") || "[]");
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<products>\n';
    for (const p of products) {
      xml += `  <product>\n`;
      xml += `    <id>${p.id}</id>\n`;
      xml += `    <name>${p.name}</name>\n`;
      xml += `    <category>${p.category}</category>\n`;
      xml += `    <quantity>${p.quantity}</quantity>\n`;
      xml += `    <active>${p.active}</active>\n`;
      xml += `    <image>${p.image || ""}</image>\n`;
      xml += `    <units>\n`;
      for (const u of p.units) {
        xml += `      <unit>\n`;
        xml += `        <name>${u.name}</name>\n`;
        xml += `        <price>${u.price}</price>\n`;
        xml += `      </unit>\n`;
      }
      xml += `    </units>\n`;
      xml += `  </product>\n`;
    }
    xml += '</products>';
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  // استيراد المنتجات من XML ودمجها
  const handleImportXML = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "application/xml");
      const productNodes = Array.from(xmlDoc.getElementsByTagName("product"));
      const imported = productNodes.map((node) => {
        const get = (tag: string) => node.getElementsByTagName(tag)[0]?.textContent || "";
        const units = Array.from(node.getElementsByTagName("unit")).map(u => ({
          name: u.getElementsByTagName("name")[0]?.textContent || "",
          price: Number(u.getElementsByTagName("price")[0]?.textContent || 0)
        }));
        return {
          id: Number(get("id")),
          name: get("name"),
          category: get("category"),
          quantity: Number(get("quantity")),
          active: get("active") === "true" || get("active") === "1",
          image: get("image"),
          units
        };
      });
      // دمج المنتجات
      const products = JSON.parse(window.localStorage.getItem("products") || "[]");
      const merged = [...products];
      for (const p of imported) {
        const idx = merged.findIndex((x:any) => x.id === p.id);
        if (idx > -1) merged[idx] = p;
        else merged.push(p);
      }
      window.localStorage.setItem("products", JSON.stringify(merged));
      setRefresh(r => r + 1);
      alert("تم استيراد المنتجات ودمجها بنجاح!");
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إدارة المنتجات</h1>
      <p>هنا يمكنك إضافة وتعديل وحذف المنتجات والوحدات.</p>

      <div className="flex gap-4 my-6">
        <button onClick={handleExportXML} className="px-4 py-2 rounded bg-green-700 text-white font-bold hover:bg-green-900">تحميل XML</button>
        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded bg-blue-700 text-white font-bold hover:bg-blue-900">رفع XML</button>
        <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={handleImportXML} />
      </div>

      <div className="mt-12">
        <ProductTable key={refresh} />
      </div>
    </div>
  );
}