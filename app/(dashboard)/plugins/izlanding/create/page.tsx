import CreateProjectForm from '@/components/plugins/izlanding/CreateProjectForm';
import RequireModule from '@/components/providers/RequireModule';

export const metadata = {
  title: 'New Landing Page — izhubs ERP',
};

export default function CreateIzLandingPage() {
  return (
    <RequireModule moduleId="izlanding">
      <CreateProjectForm />
    </RequireModule>
  );
}
