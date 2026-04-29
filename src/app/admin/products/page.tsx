"use client";
// import ProductImageUploader from './ProductImageUploader';
import ProductTable from './ProductTable';
import { clearProductsCache, getProductsFromFirebase, syncProductsToFirebase } from '../../../lib/firebaseSync';

import { useRef } from "react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

interface ExportProduct {
  id: number | string;
  name: string;
  category: string;
  categories?: string[];
  quantity: number;
  active: boolean;
  image?: string;
  images?: string[];
  units: { name: string; price: number }[];
  hasOffer?: boolean;
  discount?: number;
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [refresh, setRefresh] = useState(0);

  // تحميل باكاب Excel مع الصور
  const handleExportExcel = async () => {
    let products: ExportProduct[] = [];
    try {
      const firebaseProducts = await getProductsFromFirebase({ includeInactive: true, includeHidden: true });
      products = Array.isArray(firebaseProducts) && firebaseProducts.length > 0
        ? firebaseProducts
        : [];
    } catch {
      products = [];
    }
    
    // إنشاء محتوى CSV مع BOM لدعم Excel
    const BOM = '\uFEFF'; // Byte Order Mark
    let csv = BOM + t('admin.products.exportCsvHeaders') + '\n';
    
    for (const p of products) {
      // استخدام جميع الصور أو الصورة القديمة
      const imageUrls = p.images && p.images.length > 0 ? p.images.join('; ') : (p.image || '');
      const units = p.units.map((u: any) => `${u.name}:${u.price}`).join('; ');
      csv += `${p.id},"${p.name}","${p.category}",${p.quantity},${p.active ? t('common.yes') : t('common.no')},"${imageUrls}","${units}"\n`;
    }
    
    // تحميل ملف CSV مع ترميز UTF-8
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-backup-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(t('admin.products.exportExcelSuccess'));
  };

  // تصدير المنتجات كـ XML
  const handleExportXML = async () => {
    try {
      const products = await getProductsFromFirebase({ includeInactive: true, includeHidden: true }) as ExportProduct[];
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<products>\n';
      for (const p of products) {
        // تنظيف البيانات من XML injection
        const safeName = String(p.name || '').replace(/[<>&"']/g, (match) => {
          const entities: {[key: string]: string} = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
          return entities[match] || match;
        });
        const safeCategory = String(p.category || '').replace(/[<>&"']/g, (match) => {
          const entities: {[key: string]: string} = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
          return entities[match] || match;
        });
        const safeImage = String(p.image || '').replace(/[<>&"']/g, (match) => {
          const entities: {[key: string]: string} = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
          return entities[match] || match;
        });
        
        // إضافة جميع الصور
        const imagesXml = [];
        if (p.images && Array.isArray(p.images)) {
          for (const img of p.images) {
            const safeImg = String(img || '').replace(/[<>&"']/g, (match) => {
              const entities: {[key: string]: string} = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
              return entities[match] || match;
            });
            imagesXml.push(`      <image>${safeImg}</image>`);
          }
        } else if (p.image) {
          imagesXml.push(`      <image>${safeImage}</image>`);
        }
        
        xml += `  <product>\n`;
        xml += `    <id>${Number(p.id) || 0}</id>\n`;
        xml += `    <name>${safeName}</name>\n`;
        xml += `    <category>${safeCategory}</category>\n`;
        xml += `    <quantity>${Number(p.quantity) || 0}</quantity>\n`;
        xml += `    <active>${Boolean(p.active)}</active>\n`;
        xml += `    <images>\n`;
        for (const imgXml of imagesXml) {
          xml += `${imgXml}\n`;
        }
        xml += `    </images>\n`;
        xml += `    <units>\n`;
        if (Array.isArray(p.units)) {
          for (const u of p.units) {
            const safUnitName = String(u.name || '').replace(/[<>&"']/g, (match) => {
              const entities: {[key: string]: string} = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
              return entities[match] || match;
            });
            xml += `      <unit>\n`;
            xml += `        <name>${safUnitName}</name>\n`;
            xml += `        <price>${Number(u.price) || 0}</price>\n`;
            xml += `      </unit>\n`;
          }
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
    } catch (error) {
      console.error('خطأ في تصدير XML:', error);
      alert(t('admin.products.exportXmlError'));
    }
  };

  // استيراد المنتجات من XML ودمجها
  const handleImportXML = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // فحص نوع الملف
    if (!file.name.toLowerCase().endsWith('.xml')) {
      alert(t('admin.products.importXmlOnly'));
      return;
    }
    
    // فحص حجم الملف (5MB ماكس)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('admin.products.importXmlTooLarge'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        
        // فحص أساسي للمحتوى
        if (!text || typeof text !== 'string') {
          throw new Error(t('admin.products.importXmlInvalidContent'));
        }
        
        // منع XML entities الضارة
        if (text.includes('<!ENTITY') || text.includes('<!DOCTYPE')) {
          throw new Error(t('admin.products.importXmlUnsafe'));
        }
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        
        // فحص أخطاء XML
        const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
        if (parseError) {
          throw new Error(t('admin.products.importXmlInvalid'));
        }
        
        const productNodes = Array.from(xmlDoc.getElementsByTagName("product"));
        
        if (productNodes.length === 0) {
          throw new Error(t('admin.products.importXmlNoProducts'));
        }
        
        const imported: ExportProduct[] = productNodes.map((node) => {
          const get = (tag: string) => {
            const element = node.getElementsByTagName(tag)[0];
            return element?.textContent?.trim() || "";
          };
          
          const units = Array.from(node.getElementsByTagName("unit")).map(u => {
            const name = u.getElementsByTagName("name")[0]?.textContent?.trim() || "";
            const priceText = u.getElementsByTagName("price")[0]?.textContent?.trim() || "0";
            const price = parseFloat(priceText);
            
            return {
              name: name.substring(0, 100), // حد طول النص
              price: isNaN(price) ? 0 : Math.max(0, price) // فقط أرقام موجبة
            };
          });
          
          const id = parseInt(get("id")) || 0;
          const quantity = parseInt(get("quantity")) || 0;
          const active = get("active") === "true" || get("active") === "1";
          
          return {
            id: Math.max(0, id),
            name: get("name").substring(0, 200),
            category: get("category").substring(0, 100),
            categories: [get("category").substring(0, 100)].filter(Boolean),
            quantity: Math.max(0, quantity),
            active,
            image: get("image").substring(0, 500),
            images: get("image") ? [get("image").substring(0, 500)] : [],
            units: units.slice(0, 10) // حد عدد الوحدات
          };
        });
        
        // دمج المنتجات
        const products = await getProductsFromFirebase({ includeInactive: true, includeHidden: true }) as ExportProduct[];
        const merged: ExportProduct[] = [...products];
        let importedCount = 0;
        
        for (const p of imported) {
          if (Number(p.id) > 0 && p.name) { // فقط المنتجات الصحيحة
            const idx = merged.findIndex((x: any) => x.id === p.id);
            if (idx > -1) {
              merged[idx] = p;
            } else {
              merged.push(p);
            }
            importedCount++;
          }
        }
        
        if (importedCount === 0) {
          throw new Error(t('admin.products.importXmlNoValidProducts'));
        }
        
        await syncProductsToFirebase(merged);
        clearProductsCache();
        setRefresh(r => r + 1);
        alert(t('admin.products.importXmlSuccess', { count: importedCount }));
      } catch (error) {
        console.error('خطأ في استيراد XML:', error);
        const message = error instanceof Error ? error.message : t('admin.products.importXmlUnknownError');
        alert(t('admin.products.importXmlError', { message }));
      }
    };
    
    reader.onerror = () => {
      alert(t('admin.products.importXmlReadError'));
    };
    
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="mb-6 text-center lg:text-start">
        <h1 className="mb-4 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">{t('admin.products.title')}</h1>
        <p className="text-slate-600">{t('admin.products.subtitle')}</p>
      </div>

      <div className="flex gap-4 my-6">
        <button onClick={handleExportExcel} className="px-4 py-2 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-900">{t('admin.products.exportExcel')}</button>
        <button onClick={handleExportXML} className="px-4 py-2 rounded bg-green-700 text-white font-bold hover:bg-green-900">{t('admin.products.exportXml')}</button>
        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded bg-blue-700 text-white font-bold hover:bg-blue-900">{t('admin.products.importXml')}</button>
        <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={handleImportXML} />
      </div>

      <div className="mt-12">
        <ProductTable key={refresh} />
      </div>
    </div>
  );
}