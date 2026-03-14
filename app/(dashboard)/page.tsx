// Dashboard home — KPI cards shell
// TODO: implement real data from Core API
export default function DashboardPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="card-grid">
        {['Total Contacts', 'Open Deals', 'Won This Month', 'Active Contracts'].map((label) => (
          <div key={label} className="card">
            <p className="text-muted text-sm">{label}</p>
            <div className="skeleton" style={{ height: 32, width: 80, marginTop: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
