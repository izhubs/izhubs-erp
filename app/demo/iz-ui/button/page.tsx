'use client';

import React from 'react';
import { IzButton } from '@/components/ui/IzButton';
import { IzAsyncButton } from '@/components/ui/IzAsyncButton';
import { IzIconButton } from '@/components/ui/IzIconButton';
import { IzPermissionButton } from '@/components/ui/IzPermissionButton';
import { Settings, Trash, Plus, Save, Mail } from 'lucide-react';

export default function IzUIButtonDemo() {
  const handleAsyncClick = async () => {
    return new Promise<void>((resolve) => setTimeout(resolve, 2000));
  };

  const handleCrashClick = async () => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => reject(new Error('Demo API Lỗi!')), 1000);
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 bg-white min-h-screen text-slate-800">
      <div>
        <h1 className="text-3xl font-bold mb-2">IzUI Buttons - Design System</h1>
        <p className="text-slate-500">Trang trựng bày và tái sử dụng (Showcase & Reusable Components) cho các nút bấm của Izhubs ERP.</p>
      </div>

      {/* 1. Variants */}
      <section>
        <h2 className="text-xl font-semibold border-b pb-2 mb-6">1. Variants (Loại nút)</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-slate-50 rounded-xl border border-slate-100">
          <IzButton variant="default">Default</IzButton>
          <IzButton variant="secondary">Secondary</IzButton>
          <IzButton variant="outline">Outline</IzButton>
          <IzButton variant="ghost">Ghost</IzButton>
          <IzButton variant="destructive">Destructive</IzButton>
        </div>
      </section>

      {/* 2. Sizes */}
      <section>
        <h2 className="text-xl font-semibold border-b pb-2 mb-6">2. Sizes (Kích cỡ)</h2>
        <div className="flex flex-wrap gap-4 items-end p-6 bg-slate-50 rounded-xl border border-slate-100">
          <IzButton size="sm">Small</IzButton>
          <IzButton size="md">Medium (Default)</IzButton>
          <IzButton size="lg">Large</IzButton>
          <IzButton size="icon" aria-label="Settings"><Settings size={18} /></IzButton>
        </div>
      </section>

      {/* 3. States */}
      <section>
        <h2 className="text-xl font-semibold border-b pb-2 mb-6">3. States (Trạng thái)</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-slate-50 rounded-xl border border-slate-100">
          <IzButton disabled>Disabled Default</IzButton>
          <IzButton disabled variant="outline">Disabled Outline</IzButton>
          <IzButton isLoading>Đang xử lý...</IzButton>
          <IzButton isLoading variant="destructive">Đang xóa...</IzButton>
        </div>
      </section>

      {/* 4. Smart/Async Buttons */}
      <section>
        <h2 className="text-xl font-semibold border-b pb-2 mb-6">4. Smart Buttons (Nút thông minh)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-medium text-slate-700">IzAsyncButton (Tự handle Promise)</h3>
            <p className="text-sm text-slate-500">Bấm vào để thấy nút tự khóa và hiện Spinner trong 2 giây.</p>
            <div className="flex gap-4">
              <IzAsyncButton onClick={handleAsyncClick}>
                <Save className="w-4 h-4 mr-2" />
                Lưu Nháp
              </IzAsyncButton>
              <IzAsyncButton variant="destructive" onClick={handleCrashClick}>
                Test Nút Lỗi
              </IzAsyncButton>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-medium text-slate-700">IzIconButton (Nút Icon kèm Tooltip)</h3>
            <p className="text-sm text-slate-500">Hover để thấy tooltip (hiện fallback title).</p>
            <div className="flex gap-4">
              <IzIconButton icon={<Plus size={18} />} aria-label="Thêm mới" variant="outline" tooltip="Thêm KH mới" />
              <IzIconButton icon={<Trash size={18} />} aria-label="Xóa" variant="destructive" tooltip="Xóa bản ghi này" />
              <IzIconButton icon={<Mail size={18} />} aria-label="Gửi Email" variant="secondary" tooltip="Gửi email nhắc nợ" />
            </div>
          </div>

          <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-medium text-slate-700">IzPermissionButton (Phân quyền)</h3>
            <p className="text-sm text-slate-500">Giả lập nút bị vô hiệu hóa vì không có quyền thao tác.</p>
            <div>
              <IzPermissionButton permissions={['deals.delete']} variant="default">
                Xóa Deal X (Cần Quyền)
              </IzPermissionButton>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
