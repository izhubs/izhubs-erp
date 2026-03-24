import IzFormBuilder from '@izerp-plugin/components/plugins/izform/IzFormBuilder';
import RequireModule from '@/components/providers/RequireModule';

export const metadata = {
  title: 'Tạo Form Mới — izhubs ERP',
};

export default function CreateIzFormPage() {
  return (
    <RequireModule moduleId="izform">
      <IzFormBuilder />
    </RequireModule>
  );
}
