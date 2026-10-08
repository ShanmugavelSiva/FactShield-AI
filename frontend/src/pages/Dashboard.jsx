import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, ShieldAlert, ShieldCheck, FileSearch, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { StatCard } from '../components/common/Card'
import { DashboardSkeleton } from '../components/common/Skeleton'
import { dashboardService } from '../services'
import toast from 'react-hot-toast'

const COLORS = ['#ef4444', '#10b981', '#6366f1', '#f59e0b']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getCharts(),
        ])
        setStats(statsRes.data)
        setCharts(chartsRes.data)
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <DashboardSkeleton />

  const pieData = charts?.pie_chart || [
    { name: 'Fake', value: stats?.fake_count || 0 },
    { name: 'Real', value: stats?.real_count || 0 },
  ]

  const barData = charts?.bar_chart || []

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-slate-500">Your news analysis overview</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Analyses" value={stats?.total_analyses ?? 0} icon={BarChart3} color="brand" />
        <StatCard title="Fake News" value={stats?.fake_count ?? 0} icon={ShieldAlert} color="red" />
        <StatCard title="Real News" value={stats?.real_count ?? 0} icon={ShieldCheck} color="green" />
        <StatCard title="Verifications" value={stats?.verification_count ?? 0} icon={FileSearch} color="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-brand-600" /> Fake vs Real Distribution
          </h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5 text-brand-600" /> Weekly Activity
          </h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="fake" fill="#ef4444" name="Fake" radius={[4, 4, 0, 0]} />
                <Bar dataKey="real" fill="#10b981" name="Real" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
