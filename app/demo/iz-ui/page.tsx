'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Trash, Plus, Save, Mail, Zap, ShieldAlert, Workflow, Briefcase, Lock, User, Code, Bell, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table';

import { IzButton } from '@/components/ui/IzButton';
import { IzAsyncButton } from '@/components/ui/IzAsyncButton';
import { IzIconButton } from '@/components/ui/IzIconButton';
import { IzPermissionButton } from '@/components/ui/IzPermissionButton';
import { IzForm } from '@/components/ui/IzForm';
import { IzFormInput } from '@/components/ui/IzFormInput';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzFormTextarea } from '@/components/ui/IzFormTextarea';
import { IzFormCheckbox } from '@/components/ui/IzFormCheckbox';
import { IzSwitch } from '@/components/ui/IzSwitch';
import { IzFormSwitch } from '@/components/ui/IzFormSwitch';
import { IzFormRadioGroup } from '@/components/ui/IzFormRadioGroup';
import { IzFormSelect } from '@/components/ui/IzFormSelect';
import { IzFormDatePicker } from '@/components/ui/IzFormDatePicker';
import { IzSubmitButton } from '@/components/ui/IzSubmitButton';
import { IzTable } from '@/components/ui/IzTable';
import { IzBadge } from '@/components/ui/IzBadge';
import { IzPagination } from '@/components/ui/IzPagination';
import { 
  IzModal, IzModalTrigger, IzModalContent, IzModalHeader, IzModalFooter, IzModalTitle, IzModalDescription, IzModalClose, IzModalBody
} from '@/components/ui/IzModal';
import { 
  IzAlertDialog, IzAlertDialogTrigger, IzAlertDialogContent, IzAlertDialogHeader, IzAlertDialogFooter, IzAlertDialogTitle, IzAlertDialogDescription, IzAlertDialogAction, IzAlertDialogCancel 
} from '@/components/ui/IzAlertDialog';
import { IzCard, IzCardHeader, IzCardTitle, IzCardDescription, IzCardContent, IzCardFooter } from '@/components/ui/IzCard';
import { IzAvatar, IzAvatarImage, IzAvatarFallback } from '@/components/ui/IzAvatar';
import { IzTabs, IzTabsList, IzTabsTrigger, IzTabsContent } from '@/components/ui/IzTabs';
import { IzDropdownMenu, IzDropdownMenuTrigger, IzDropdownMenuContent, IzDropdownMenuItem, IzDropdownMenuLabel, IzDropdownMenuSeparator, IzDropdownMenuGroup, IzDropdownMenuShortcut } from '@/components/ui/IzDropdownMenu';
import { IzTooltip, IzTooltipTrigger, IzTooltipContent, IzTooltipProvider } from '@/components/ui/IzTooltip';
import { IzPopover, IzPopoverTrigger, IzPopoverContent } from '@/components/ui/IzPopover';
import { IzDrawer, IzDrawerTrigger, IzDrawerContent, IzDrawerHeader, IzDrawerTitle, IzDrawerDescription, IzDrawerFooter, IzDrawerClose, IzDrawerBody } from '@/components/ui/IzDrawer';
import { IzBreadcrumb, IzBreadcrumbList, IzBreadcrumbItem, IzBreadcrumbLink, IzBreadcrumbPage, IzBreadcrumbSeparator } from '@/components/ui/IzBreadcrumb';
import { useToast } from '@/hooks/use-toast';
import styles from './Demo.module.scss'; 

const CodeSnippet = ({ code }: { code: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`${styles.wFull} ${styles.mt4} ${styles.borderTop} ${styles.pt5}`}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className={styles.codeBtn}
      >
        <Code size={16} />
        {isOpen ? 'Ẩn Code' : 'Xem Code Mẫu'}
      </button>
      {isOpen && (
        <div className={styles.codeBlock}>
          <pre>{code.trim()}</pre>
        </div>
      )}
    </div>
  );
};

// Form Zod Schema
const recruitSchema = z.object({
  fullName: z.string().min(5, 'Họ tên phải dài ít nhất 5 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
  role: z.string().min(2, 'Vui lòng nhập vị trí ứng tuyển'),
  department: z.string().min(1, 'Vui lòng chọn phòng ban'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày có thể nhận việc'),
  experience: z.string().min(1, 'Vui lòng chọn cấp bậc chuyên môn'),
  reason: z.string().min(10, 'Lý do ứng tuyển phải dài ít nhất 10 ký tự'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Bạn phải đồng ý với điều khoản bảo mật' })
  }),
  subscribeNews: z.boolean().optional(),
});

type RecruitForm = z.infer<typeof recruitSchema>;

// --- TABLE MOCK DATA ---
export type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'banned';
};

const columnHelper = createColumnHelper<UserRow>();
const userColumns = [
  columnHelper.accessor('fullName', {
    header: 'Họ & Tên',
    cell: info => <span style={{ fontWeight: 500 }}>{info.getValue()}</span>,
  }),
  columnHelper.accessor('email', {
    header: 'Địa chỉ Email',
  }),
  columnHelper.accessor('role', {
    header: 'Vai Trò',
  }),
  columnHelper.accessor('status', {
    header: 'Trạng Thái',
    cell: info => {
      const val = info.getValue();
      if (val === 'active') return <IzBadge variant="success" dot>Hoạt động</IzBadge>;
      if (val === 'pending') return <IzBadge variant="warning" dot>Chờ duyệt</IzBadge>;
      return <IzBadge variant="destructive" dot>Bị khóa</IzBadge>;
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Thao tác',
    cell: () => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <IzIconButton icon={<Settings size={16} />} aria-label="Cài đặt" variant="ghost" />
        <IzIconButton icon={<Trash size={16} />} aria-label="Xóa" variant="ghost" />
      </div>
    ),
  }),
];

const MOCK_TABLE_DATA: UserRow[] = [
  { id: '1', fullName: 'Nguyễn Văn Minh', email: 'minhnv@izhubs.com', role: 'Admin', status: 'active' },
  { id: '2', fullName: 'Trần Thị Mai', email: 'maitt@izhubs.com', role: 'Kế toán', status: 'pending' },
  { id: '3', fullName: 'Lê Hoàng Phát', email: 'phatlh@izhubs.com', role: 'Nhân sự', status: 'active' },
  { id: '4', fullName: 'Phạm Quang Hiếu', email: 'hieupq@izhubs.com', role: 'Sale', status: 'banned' },
  { id: '5', fullName: 'Vũ Đức Duy', email: 'duyvd@izhubs.com', role: 'Admin', status: 'active' },
];

export default function IzUIDemoPage() {
  const { toast } = useToast();
  const handleAsyncClick = async () => new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const handleCrashClick = async () => new Promise<void>((resolve, reject) => setTimeout(() => reject(new Error('Lỗi cố ý để test!')), 1000));

  const [submittedData, setSubmittedData] = useState<RecruitForm | null>(null);

  const form = useForm<RecruitForm>({
    resolver: zodResolver(recruitSchema),
    defaultValues: { fullName: '', email: '', role: '', department: '', startDate: '', experience: '', reason: '', acceptTerms: false as true, subscribeNews: true },
  });

  const onSubmit = async (values: RecruitForm) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmittedData(values);
    form.reset();
  };

  // --- TABLE STATE ---
  const [tableData, setTableData] = useState<UserRow[]>(MOCK_TABLE_DATA);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const table = useReactTable({
    data: tableData,
    columns: userColumns,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const simulateLoading = () => {
    setIsTableLoading(true);
    setTimeout(() => setIsTableLoading(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        <header className={styles.header}>
          <h1>IzUI Master Component Library</h1>
          <p>Hệ thống Design System UI dành riêng cho Izhubs ERP. Trực quan, tối ưu hiệu suất và kèm sẵn code mẫu cho Developer.</p>
        </header>

        {/* --- PART 1: BUTTONS --- */}
        <div className={styles.partContainer}>
          <h2 className={styles.partHeader}>A. Các Component Nút Bấm (Buttons)</h2>
          
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Các biến thể cơ bản</h2>
              <span className={styles.badge}>UI VARIANTS</span>
            </div>
            <div className={styles.card}>
              <div className={`${styles.flexRow} ${styles.gap4} ${styles.wFull} ${styles.flexWrap}`}>
                <IzButton variant="default">Giao diện gốc</IzButton>
                <IzButton variant="secondary">Nút thứ cấp</IzButton>
                <IzButton variant="outline">Viền ngoài</IzButton>
                <IzButton variant="ghost">Tàng hình</IzButton>
                <IzButton variant="destructive">Nguy hiểm</IzButton>
              </div>
              <CodeSnippet code={`
<IzButton variant="default">Giao diện gốc</IzButton>
<IzButton variant="secondary">Nút thứ cấp</IzButton>
<IzButton variant="outline">Viền ngoài</IzButton>
<IzButton variant="ghost">Tàng hình</IzButton>
<IzButton variant="destructive">Nguy hiểm</IzButton>
              `} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Kích thước linh hoạt</h2>
              <span className={styles.badge}>MULTI SIZES</span>
            </div>
            <div className={styles.card}>
              <div className={`${styles.flexRow} ${styles.gap4} ${styles.wFull} ${styles.flexWrap} ${styles.itemsEnd}`}>
                <IzButton size="sm">Nhỏ gọn</IzButton>
                <IzButton size="md">Tiêu chuẩn (Mặc định)</IzButton>
                <IzButton size="lg">Kích thước Lớn</IzButton>
                <IzButton size="icon" aria-label="Settings"><Settings size={18} /></IzButton>
              </div>
              <CodeSnippet code={`
<IzButton size="sm">Nhỏ gọn</IzButton>
<IzButton size="md">Tiêu chuẩn (Mặc định)</IzButton>
<IzButton size="lg">Kích thước Lớn</IzButton>
<IzButton size="icon" aria-label="Settings"><Settings size={18} /></IzButton>
              `} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Trạng thái phản hồi</h2>
              <span className={styles.badge}>INTERACTIVE STATES</span>
            </div>
            <div className={styles.card}>
              <div className={`${styles.flexRow} ${styles.gap4} ${styles.wFull} ${styles.flexWrap}`}>
                <IzButton disabled>Vô hiệu hóa (Default)</IzButton>
                <IzButton disabled variant="outline">Vô hiệu hóa (Outline)</IzButton>
                <IzButton isLoading>Đang truyền tải dữ liệu...</IzButton>
                <IzButton isLoading variant="destructive">Đang xóa bản ghi...</IzButton>
              </div>
              <CodeSnippet code={`
<IzButton disabled>Vô hiệu hóa (Default)</IzButton>
<IzButton isLoading>Đang truyền tải dữ liệu...</IzButton>
<IzButton isLoading variant="destructive">Đang xóa bản ghi...</IzButton>
              `} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Nút nghiệp vụ tự động (Smart Buttons)</h2>
              <span className={styles.badge}>ERP SPECIFIC</span>
            </div>
            
            <div className={styles.grid}>
              <div className={styles.smartCard}>
                <h3><Zap size={20} /> IzAsyncButton</h3>
                <p>Tự động quản lý vòng đời Promise. Tự hiện Spinner, khóa click đúp ngăn spam API.</p>
                <div className={styles.actions}>
                  <IzAsyncButton onClick={handleAsyncClick}>
                    <Save className="w-4 h-4 mr-2" /> Lưu Lên Cloud
                  </IzAsyncButton>
                </div>
                <CodeSnippet code={`
<IzAsyncButton onClick={async () => {
  await fetch('/api/save');
}}>
  <Save className="w-4 h-4 mr-2" /> Lưu Lên Cloud
</IzAsyncButton>
                `} />
              </div>

              <div className={styles.smartCard}>
                <h3><Workflow size={20} /> IzIconButton</h3>
                <p>Nút Icon siêu gọn nhẹ cho Table, kèm Tooltip Hover và chuẩn cấu trúc ARIA.</p>
                <div className={styles.actions}>
                  <IzIconButton icon={<Plus size={18} />} aria-label="Thêm mới" tooltip="Thêm KH mới" />
                  <IzIconButton icon={<Trash size={18} />} aria-label="Xóa" variant="destructive" />
                </div>
                <CodeSnippet code={`
<IzIconButton 
  icon={<Plus size={18} />} 
  aria-label="Thêm mới" 
  tooltip="Thêm KH mới" 
/>
                `} />
              </div>

              <div className={styles.smartCard} style={{ gridColumn: '1 / -1' }}>
                <h3><ShieldAlert size={20} /> IzPermissionButton (Kiểm soát RBAC)</h3>
                <p>Tự rà soát cờ Permissions, nếu thiếu quyền thao tác (VD: deals.delete) nút sẽ bị vô hiệu hóa kèm khóa.</p>
                <div className={styles.actions}>
                  <IzPermissionButton permissions={['deals.delete']} variant="default">
                    Xóa Hợp Đồng Giao Dịch
                  </IzPermissionButton>
                </div>
                <CodeSnippet code={`
<IzPermissionButton permissions={['deals.delete']} variant="default">
  Xóa Hợp Đồng Giao Dịch
</IzPermissionButton>
                `} />
              </div>
            </div>
          </section>
        </div>

        {/* --- PART 2: FORMS AND INPUTS --- */}
        <div className={styles.partContainer}>
          <h2 className={styles.partHeader}>B. Các Component Nhập Liệu (Forms & Inputs)</h2>
          
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>1. Text Input Tiêu Chuẩn (Chưa bọc Form)</h2>
              <span className={styles.badge}>UI BASE</span>
            </div>
            
            <div className={styles.grid}>
              <div className={styles.smartCard}>
                <h3 className={`${styles.textXl} ${styles.mb6} ${styles.flexRow} ${styles.gap2}`}><User size={20} /> Sử dụng độc lập</h3>
                <div className={`${styles.flexCol} ${styles.gap4} ${styles.wFull}`}>
                  <IzInput placeholder="Nhập tên đăng nhập..." />
                  <IzInput placeholder="Kèm Icon trái..." leftIcon={<Mail size={16} />} />
                </div>
                <CodeSnippet code={`
<IzInput placeholder="Nhập tên đăng nhập..." />
<IzInput 
  placeholder="Kèm Icon trái..." 
  leftIcon={<Mail size={16} />} 
/>
                `} />
              </div>

              <div className={styles.smartCard}>
                <h3 className={`${styles.textXl} ${styles.mb6} ${styles.flexRow} ${styles.gap2}`}><Lock size={20} /> Trạng thái Đặc Biệt</h3>
                <div className={`${styles.flexCol} ${styles.gap4} ${styles.wFull}`}>
                  <IzInput placeholder="Input bị vô hiệu hóa..." disabled />
                  <IzInput placeholder="Lỗi Validation..." leftIcon={<Lock size={16} />} error="Sai mật khẩu" />
                </div>
                <CodeSnippet code={`
<IzInput placeholder="Input bị vô hiệu hóa..." disabled />
<IzInput 
  error="Sai mật khẩu"
  leftIcon={<Lock size={16} />} 
/>
                `} />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>2. Ứng dụng Form Auto-Validate Thực Tế</h2>
              <span className={styles.badge}>ZOD + REACT HOOK FORM</span>
            </div>
            
            <div className={`${styles.card} ${styles.flexCol}`}>
              <div className={styles.wFull}>
                <CodeSnippet code={`
const schema = z.object({
  fullName: z.string().min(5, 'Họ tên phải dài ít nhất 5 ký tự'),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { fullName: '' },
});

return (
  <IzForm form={form} onSubmit={onSubmit}>
    <IzFormInput 
      name="fullName" 
      label="Họ và Tên" 
      leftIcon={<User size={16} />}
      required
    />
    <IzSubmitButton>Nộp Hồ Sơ Ngay</IzSubmitButton>
  </IzForm>
);
                `} />
              </div>

              <div className={styles.formLayout}>
                {/* Form Column */}
                <div className={styles.mt8}>
                  <h3 className={`${styles.textXl} ${styles.mb6}`}>Thông tin ứng viên</h3>
                  
                  <IzForm form={form} onSubmit={onSubmit} className={styles.formColumn}>
                    <IzFormInput 
                      name="fullName" label="Họ và Tên" placeholder="VD: Nguyễn Văn A"
                      leftIcon={<User size={16} />} required
                    />
                    <IzFormInput 
                      name="email" label="Địa chỉ Email" placeholder="john@doe.com" 
                      type="email" leftIcon={<Mail size={16} />} required
                    />
                    
                    <div className={`${styles.flexRow} ${styles.gap4}`}>
                      <IzFormSelect
                        name="department"
                        label="Phòng ban ứng tuyển (*)"
                        options={[
                          { label: 'Kỹ thuật / IT', value: 'engineering' },
                          { label: 'Marketing', value: 'marketing' },
                          { label: 'Nhân sự', value: 'hr' },
                          { label: 'Kinh doanh (Sales)', value: 'sales' },
                        ]}
                        placeholder="Chọn phòng ban..."
                        wrapperClassName={styles.flex1}
                      />
                      <IzFormDatePicker
                        name="startDate"
                        label="Ngày có thể nhận việc (*)"
                        wrapperClassName={styles.flex1}
                      />
                    </div>

                    <IzFormRadioGroup
                      name="experience"
                      label="Cấp bậc kinh nghiệm (*)"
                      options={[
                        { label: 'Thực tập sinh (Intern/Fresher)', value: 'intern' },
                        { label: 'Chuyên viên (Junior/Mid)', value: 'junior' },
                        { label: 'Chuyên gia (Senior+)', value: 'senior' },
                      ]}
                    />
                    <IzFormTextarea 
                      name="reason" label="Lý do ứng tuyển (*)" placeholder="Bạn mong muốn điều gì khi gia nhập Izhubs?"
                      rows={3}
                    />
                    <IzFormCheckbox 
                      name="acceptTerms" 
                      label="Tôi đồng ý với các điều khoản bảo mật." 
                      description="Thông tin của bạn được mã hóa an toàn 100%."
                    />
                    <IzFormSwitch 
                      name="subscribeNews" 
                      label="Nhận thông báo việc làm mới qua Email" 
                    />
                    <div className={`${styles.flexRow} ${styles.gap4} ${styles.pt6}`}>
                      <IzButton type="button" variant="outline" onClick={() => form.reset()}>Xóa Trắng Form</IzButton>
                      <IzSubmitButton size="lg" className={styles.flex1}>Nộp Hồ Sơ Ngay</IzSubmitButton>
                    </div>
                  </IzForm>
                </div>

                {/* Display Column */}
                <div className={styles.mt8}>
                  <h3 className={`${styles.textXl} ${styles.mb6}`}>Dữ liệu Zod Gửi Lên (Mock)</h3>
                  <div className={styles.mockDataColumn}>
                    {submittedData ? (
                      <pre>{JSON.stringify(submittedData, null, 2)}</pre>
                    ) : (
                      <span className={styles.textSlate500}>{"// Hãy điền Form bên trái rồi Submit.\n// Nhấn Nộp ngay khi để trống để xem Zod văng lỗi đỏ."}</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* --- PART 3: DATA DISPLAY --- */}
        <div className={styles.partContainer}>
          <h2 className={styles.partHeader}>C. Các Component Hiển thị Dữ liệu (Data Display)</h2>
          
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>1. Bảng Dữ Liệu (IzTable)</h2>
              <span className={styles.badge}>TANSTACK TABLE V8</span>
            </div>
            
            <div className={styles.card}>
              <div className={`${styles.flexRow} ${styles.gap4} ${styles.mb6}`}>
                <IzAsyncButton onClick={async () => simulateLoading()}>
                  <Settings size={16} className="mr-2" /> Tải lại dữ liệu (Loading)
                </IzAsyncButton>
                <IzButton variant="destructive" onClick={() => setTableData([])} disabled={tableData.length === 0}>
                  <Trash size={16} className="mr-2" /> Giả lập Bảng Rỗng
                </IzButton>
                {tableData.length === 0 && (
                  <IzButton variant="outline" onClick={() => setTableData(MOCK_TABLE_DATA)}>
                    Khôi phục dữ liệu
                  </IzButton>
                )}
              </div>

              <div className={styles.wFull}>
                <IzTable 
                  table={table}
                  isLoading={isTableLoading}
                  isEmpty={tableData.length === 0}
                  onRowClick={(row) => console.log('Row clicked:', row)}
                  emptyProps={{
                    title: 'Chưa có thành viên nào',
                    description: 'Hệ thống hiện chưa có dữ liệu thành viên. Hãy thêm người dùng mới để bắt đầu.',
                    actionLabel: '+ Thêm Mới',
                    onAction: () => setTableData(MOCK_TABLE_DATA)
                  }}
                />
                {!isTableLoading && tableData.length > 0 && (
                  <IzPagination 
                    pageIndex={pagination.pageIndex}
                    pageCount={Math.ceil(tableData.length / pagination.pageSize)}
                    canPreviousPage={table.getCanPreviousPage()}
                    canNextPage={table.getCanNextPage()}
                    setPageIndex={table.setPageIndex}
                    nextPage={table.nextPage}
                    previousPage={table.previousPage}
                    pageSize={pagination.pageSize}
                    setPageSize={table.setPageSize}
                    totalRows={tableData.length}
                  />
                )}
                
                <div className={styles.mt8}>
                  <CodeSnippet code={`
// 1. Định nghĩa Data Model & Cấu hình Cột
const columnHelper = createColumnHelper<UserRow>();
const columns = [
  columnHelper.accessor('fullName', { header: 'Họ & Tên' }),
  columnHelper.accessor('status', {
    header: 'Trạng Thái',
    cell: info => <IzBadge variant="success" dot>{info.getValue()}</IzBadge>,
  }),
];

// 2. Render Template Bảng
<IzTable 
  table={table}
  isLoading={isLoading}
  isEmpty={data.length === 0}
  emptyProps={{
    title: 'Chưa có thành viên nào',
    description: 'Hệ thống hiện chưa có dữ liệu thành viên. Hãy thêm người dùng mới.',
    actionLabel: '+ Thêm Mới',
    onAction: () => console.log('Thêm mới clicked')
  }}
/>

// 3. Thanh Phân Trang (Tùy chọn)
<IzPagination 
  pageIndex={table.getState().pagination.pageIndex}
  pageCount={table.getPageCount()}
  ... 
/>
                  `} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --- PART 4: OVERLAYS AND FEEDBACK --- */}
        <div className={styles.partContainer}>
          <h2 className={styles.partHeader}>D. Cửa Sổ Nổi & Phản Hồi (Overlays & Feedback)</h2>
          
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>1. Modal Đa Dụng (IzModal) & Cảnh Báo (IzAlertDialog)</h2>
              <span className={styles.badge}>RADIX UI PORTALS</span>
            </div>
            
            <div className={styles.grid}>
              <div className={styles.smartCard}>
                <h3 className={`${styles.textXl} ${styles.mb6} ${styles.flexRow} ${styles.gap2}`}><Workflow size={20} /> Modal Tiêu Chuẩn</h3>
                <div className={`${styles.flexRow} ${styles.gap4}`}>
                  <IzModal>
                    <IzModalTrigger asChild>
                      <IzButton variant="outline"><Plus size={16} className="mr-2" /> Mở Form Tạo Mới</IzButton>
                    </IzModalTrigger>
                    <IzModalContent size="md">
                      <IzModalHeader>
                        <IzModalTitle>Tạo chiến dịch mới</IzModalTitle>
                        <IzModalDescription>Mở đầu một chiến dịch marketing mới bằng cách điền thông tin bên dưới.</IzModalDescription>
                      </IzModalHeader>
                      <IzModalBody>
                        <div className={`${styles.flexCol} ${styles.gap4} ${styles.py4}`}>
                           <div>
                             <label className={`${styles.textSm} ${styles.fontMedium} ${styles.mb2} ${styles.block}`}>Tên chiến dịch</label>
                             <IzInput placeholder="VD: Khuyến mãi Tết" />
                           </div>
                           <div>
                             <label className={`${styles.textSm} ${styles.fontMedium} ${styles.mb2} ${styles.block}`}>Mô tả chiến dịch</label>
                             <IzTextarea placeholder="Nhập mô tả..." rows={3} />
                           </div>
                        </div>
                      </IzModalBody>
                      <IzModalFooter>
                        <IzModalClose asChild><IzButton variant="ghost">Hủy bỏ</IzButton></IzModalClose>
                        <IzModalClose asChild><IzButton>Lưu Chiến Dịch</IzButton></IzModalClose>
                      </IzModalFooter>
                    </IzModalContent>
                  </IzModal>
                </div>
              </div>

              <div className={styles.smartCard}>
                <h3 className={`${styles.textXl} ${styles.mb6} ${styles.flexRow} ${styles.gap2}`}><ShieldAlert size={20} /> Alert Dialog Xác Nhận</h3>
                <div className={`${styles.flexRow} ${styles.gap4}`}>
                  <IzAlertDialog>
                    <IzAlertDialogTrigger asChild>
                      <IzButton variant="destructive"><Trash2 size={16} className="mr-2" /> Xóa Dữ Liệu</IzButton>
                    </IzAlertDialogTrigger>
                    <IzAlertDialogContent>
                      <IzAlertDialogHeader>
                        <IzAlertDialogTitle>Bạn có chắc chắn muốn xóa?</IzAlertDialogTitle>
                        <IzAlertDialogDescription>Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.</IzAlertDialogDescription>
                      </IzAlertDialogHeader>
                      <IzAlertDialogFooter>
                        <IzAlertDialogCancel>Quay lại</IzAlertDialogCancel>
                        <IzAlertDialogAction variant="destructive" onClick={() => toast({ title: 'Đã xóa!', description: 'Xóa dữ liệu thành công', variant: 'destructive'})}>Xóa Vĩnh Viễn</IzAlertDialogAction>
                      </IzAlertDialogFooter>
                    </IzAlertDialogContent>
                  </IzAlertDialog>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>2. Hệ Thống Thông Báo (IzToast)</h2>
              <span className={styles.badge}>SONNER / RADIX TOAST</span>
            </div>
            
            <div className={styles.card}>
                <h3 className={`${styles.textXl} ${styles.mb6}`}>Bắn Toast từ Global</h3>
                <div className={`${styles.flexRow} ${styles.gap4}`}>
                  <IzButton variant="outline" onClick={() => toast({ title: 'Cập nhật thành công', description: 'Bản ghi đã được lưu vào hệ thống.', variant: 'success'})}>
                    <CheckCircle size={16} className="mr-2 text-emerald-500" /> Toast Thành Công
                  </IzButton>
                  
                  <IzButton variant="outline" onClick={() => toast({ title: 'Cảnh báo hệ thống', description: 'Phiên đăng nhập sắp hết hạn.', variant: 'default'})}>
                    <Bell size={16} className="mr-2" /> Toast Tiêu Chuẩn
                  </IzButton>

                  <IzButton variant="destructive" onClick={() => toast({ title: 'Lỗi đồng bộ', description: 'Bỏ qua đồng bộ do mất kết nối mạng.', variant: 'destructive'})}>
                    <AlertTriangle size={16} className="mr-2" /> Toast Xóa/Lỗi
                  </IzButton>
                </div>
            </div>
          </section>
        </div>

        {/* --- PART 5: DATA DISPLAY & NAVIGATION --- */}
        <div className={styles.partContainer}>
          <h2 className={styles.partHeader}>E. Hiển Thị Dữ Liệu & Điều Hướng (Data & Navigation)</h2>
          
          <IzTooltipProvider delayDuration={300}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>1. Card, Avatar & Breadcrumb</h2>
                <span className={styles.badge}>FOUNDATION</span>
              </div>
              
              <div className={styles.grid}>
                <div className={styles.smartCard}>
                  <IzBreadcrumb className={`${styles.mb6}`}>
                    <IzBreadcrumbList>
                      <IzBreadcrumbItem>
                        <IzBreadcrumbLink href="#">Trang Chủ</IzBreadcrumbLink>
                      </IzBreadcrumbItem>
                      <IzBreadcrumbSeparator />
                      <IzBreadcrumbItem>
                        <IzBreadcrumbLink href="#">Khách Hàng</IzBreadcrumbLink>
                      </IzBreadcrumbItem>
                      <IzBreadcrumbSeparator />
                      <IzBreadcrumbItem>
                        <IzBreadcrumbPage>Isaac Vu</IzBreadcrumbPage>
                      </IzBreadcrumbItem>
                    </IzBreadcrumbList>
                  </IzBreadcrumb>

                  <h3 className={`${styles.textXl} ${styles.mb6} ${styles.flexRow} ${styles.gap2}`}><User size={20} /> Hồ sơ tóm tắt</h3>
                  
                  <IzCard>
                    <IzCardHeader>
                      <div className={`${styles.flexRow} ${styles.gap4}`}>
                        <IzAvatar size="xl">
                          <IzAvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Isaac Vu" />
                          <IzAvatarFallback>IV</IzAvatarFallback>
                        </IzAvatar>
                        <div>
                          <IzCardTitle>Isaac Vu</IzCardTitle>
                          <IzCardDescription>isaac@izhubs.com</IzCardDescription>
                        </div>
                      </div>
                    </IzCardHeader>
                    <IzCardContent>
                      <p className={`${styles.textSm} ${styles.textMutedForeground}`}>
                        Giám đốc kỹ thuật phụ trách hệ thống ERP. Đã tham gia từ tháng 1, 2026.
                      </p>
                    </IzCardContent>
                    <IzCardFooter>
                      <div className={`${styles.flexRow} ${styles.gap2} ${styles.wFull}`}>
                        <IzTooltip>
                          <IzTooltipTrigger asChild>
                            <IzButton variant="outline" className={`${styles.wFull}`}><Mail size={16} className="mr-2" />Gửi Email</IzButton>
                          </IzTooltipTrigger>
                          <IzTooltipContent side="bottom"> Soạn email qua hệ thống IzHubs Mail </IzTooltipContent>
                        </IzTooltip>
                      </div>
                    </IzCardFooter>
                  </IzCard>
                </div>

                <div className={styles.smartCard}>
                  <h3 className={`${styles.textXl} ${styles.mb6} ${styles.flexRow} ${styles.gap2}`}><Briefcase size={20} /> Tabs & Popovers</h3>
                  
                  <IzTabs defaultValue="account" className={`${styles.wFull} ${styles.mb6}`}>
                    <IzTabsList className={`${styles.wFull}`}>
                      <IzTabsTrigger value="account" className={`${styles.wFull}`}>Tài Khoản</IzTabsTrigger>
                      <IzTabsTrigger value="password" className={`${styles.wFull}`}>Mật Khẩu</IzTabsTrigger>
                    </IzTabsList>
                    <IzTabsContent value="account">
                      <div className={`${styles.flexCol} ${styles.gap4} ${styles.pt4}`}>
                        <IzInput placeholder="Tên hiển thị" defaultValue="Isaac Vu" />
                        <IzButton>Lưu thay đổi</IzButton>
                      </div>
                    </IzTabsContent>
                    <IzTabsContent value="password">
                      <div className={`${styles.flexCol} ${styles.gap4} ${styles.pt4}`}>
                        <IzInput type="password" placeholder="Mật khẩu cũ" />
                        <IzInput type="password" placeholder="Mật khẩu mới" />
                        <IzButton variant="outline">Đổi mật khẩu</IzButton>
                      </div>
                    </IzTabsContent>
                  </IzTabs>

                  <IzPopover>
                    <IzPopoverTrigger asChild>
                      <IzButton variant="secondary" className={`${styles.wFull}`}>Mở Quick Settings (Popover)</IzButton>
                    </IzPopoverTrigger>
                    <IzPopoverContent align="center" side="top">
                      <div className={`${styles.flexCol} ${styles.gap2}`}>
                        <h4 className={`${styles.textSm} ${styles.fontMedium}`}>Cài đặt nhanh</h4>
                        <p className={`${styles.textSm} ${styles.textMutedForeground} ${styles.mb2}`}>Bật thông báo đẩy và email.</p>
                        <div className={`${styles.flexRow} ${styles.itemsCenter} ${styles.justifyBetween}`}>
                          <label className={`${styles.textSm}`}>Email Alerts</label>
                          <IzSwitch checked={true} />
                        </div>
                      </div>
                    </IzPopoverContent>
                  </IzPopover>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>2. Menu Chức Năng & Bảng Trượt Kéo (Complex Layouts)</h2>
                <span className={styles.badge}>RADIX & VAUL</span>
              </div>
              
              <div className={styles.card}>
                <div className={`${styles.flexRow} ${styles.gap4}`}>
                  
                  <IzDropdownMenu>
                    <IzDropdownMenuTrigger asChild>
                      <IzButton variant="outline"><Settings size={16} className="mr-2" /> Menu Chức Năng</IzButton>
                    </IzDropdownMenuTrigger>
                    <IzDropdownMenuContent align="start">
                      <IzDropdownMenuLabel>Tài Khoản Của Tôi</IzDropdownMenuLabel>
                      <IzDropdownMenuSeparator />
                      <IzDropdownMenuGroup>
                        <IzDropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Hồ sơ</span>
                          <IzDropdownMenuShortcut>⇧⌘P</IzDropdownMenuShortcut>
                        </IzDropdownMenuItem>
                        <IzDropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Cài đặt</span>
                          <IzDropdownMenuShortcut>⌘S</IzDropdownMenuShortcut>
                        </IzDropdownMenuItem>
                      </IzDropdownMenuGroup>
                      <IzDropdownMenuSeparator />
                      <IzDropdownMenuItem variant="destructive">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                        <IzDropdownMenuShortcut>⇧⌘Q</IzDropdownMenuShortcut>
                      </IzDropdownMenuItem>
                    </IzDropdownMenuContent>
                  </IzDropdownMenu>

                  <IzDrawer>
                    <IzDrawerTrigger asChild>
                      <IzButton><Workflow size={16} className="mr-2" /> Mở Bảng Phải (Drawer)</IzButton>
                    </IzDrawerTrigger>
                    <IzDrawerContent side="right">
                      <IzDrawerHeader>
                        <IzDrawerTitle>Chỉnh sửa quy trình bán hàng</IzDrawerTitle>
                        <IzDrawerDescription>Kéo thả các bước để thay đổi thứ tự quy trình (Tính năng giả lập).</IzDrawerDescription>
                      </IzDrawerHeader>
                      <IzDrawerBody>
                         <div className={`${styles.flexCol} ${styles.gap4} ${styles.py6}`}>
                            <div>
                              <label className={`${styles.textSm} ${styles.fontMedium} ${styles.mb2} ${styles.block}`}>Tên quy trình</label>
                              <IzInput defaultValue="SaaS Sales Pipeline" />
                            </div>
                            <div>
                              <label className={`${styles.textSm} ${styles.fontMedium} ${styles.mb2} ${styles.block}`}>Mô tả</label>
                              <IzTextarea rows={5} defaultValue="Dùng cho các khách hàng mua gói trả góp định kỳ." />
                            </div>
                         </div>
                      </IzDrawerBody>
                      <IzDrawerFooter>
                        <IzDrawerClose asChild>
                          <IzButton variant="ghost">Hủy bỏ</IzButton>
                        </IzDrawerClose>
                        <IzDrawerClose asChild>
                          <IzButton>Lưu Thay Đổi</IzButton>
                        </IzDrawerClose>
                      </IzDrawerFooter>
                    </IzDrawerContent>
                  </IzDrawer>

                </div>
              </div>
            </section>
          </IzTooltipProvider>
        </div>

      </div>
    </div>
  );
}
