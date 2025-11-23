export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Books" value="12" color="bg-blue-500" />
        <StatCard title="Total Resources" value="156" color="bg-emerald-500" />
        <StatCard title="Active Students" value="24" color="bg-purple-500" />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="text-slate-500 text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className={`h-1 w-full mt-4 rounded-full ${color} opacity-20`}>
        <div className={`h-1 w-1/2 rounded-full ${color}`} />
      </div>
    </div>
  );
}
