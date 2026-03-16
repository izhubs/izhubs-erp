import ComingSoon from '@/components/ui/ComingSoon';

export const metadata = { title: 'Settings — izhubs ERP' };

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      milestone="v0.1"
      description="Configure your workspace — profile, permissions, and preferences."
      plannedFeatures={[
        'User profile and password change',
        'Team members and roles',
        'Notification preferences',
        'Workspace branding',
      ]}
    />
  );
}
