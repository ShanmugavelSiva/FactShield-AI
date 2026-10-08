import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Users, Activity, Shield, BarChart3 } from 'lucide-react'
import { StatCard } from '../components/common/Card'
import Badge from '../components/common/Badge'
import { DashboardSkeleton, TableSkeleton } from '../components/common/Skeleton'
import { adminService } from '../services'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, logsRes] = await Promise.all([
          adminService.getSystemStats(),
          adminService.getUsers(),
          adminService.getActivityLogs(),
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data.users || [])
        setLogs(logsRes.data.logs || [])
      } catch {
        toast.error('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Shield className="h-8 w-8 text-purple-600" /> Admin Dashboard
        </h1>
        <p className="mt-1 text-slate-500">System overview and user management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats?.total_users ?? 0} icon={Users} color="brand" />
        <StatCard title="Total Predictions" value={stats?.total_predictions ?? 0} icon={BarChart3} color="green" />
        <StatCard title="Verifications" value={stats?.total_verifications ?? 0} icon={Activity} color="blue" />
        <StatCard title="Active Today" value={stats?.active_today ?? 0} icon={Activity} color="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold">Users</h3>
          <div className="mt-4 max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-800">
                  <th className="py-2 text-left">Username</th>
                  <th className="py-2 text-left">Role</th>
                  <th className="py-2 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b dark:border-slate-800">
                    <td className="py-2">{u.username}</td>
                    <td className="py-2"><Badge label={u.role} variant={u.role === 'admin' ? 'admin' : 'user'} /></td>
                    <td className="py-2 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold">Activity Logs</h3>
          <div className="mt-4 max-h-80 overflow-y-auto space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-slate-500">No activity logs yet</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-slate-500">{log.details}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
