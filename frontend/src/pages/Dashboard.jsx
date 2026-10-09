import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  FileSearch,
  TrendingUp,
} from 'lucide-react'

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { StatCard } from '../components/common/Card'
import { DashboardSkeleton } from '../components/common/Skeleton'
import { dashboardService } from '../services'
import toast from 'react-hot-toast'

const COLORS = ['#ef4444', '#10b981']

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
      } catch (error) {
        console.error('Dashboard loading error:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  // -------------------------------------------------------
  // Backend values
  // -------------------------------------------------------

  const totalAnalyses =
    stats?.total_predictions ??
    stats?.total_analyses ??
    0

  const fakeCount =
    stats?.fake ??
    stats?.fake_count ??
    charts?.distribution?.fake ??
    0

  const realCount =
    stats?.real ??
    stats?.real_count ??
    charts?.distribution?.real ??
    0

  const verificationCount =
    stats?.total_verifications ??
    stats?.verification_count ??
    0

  // -------------------------------------------------------
  // Pie chart data
  // -------------------------------------------------------

  const pieData = [
    {
      name: 'Fake',
      value: fakeCount,
    },
    {
      name: 'Real',
      value: realCount,
    },
  ]

  // -------------------------------------------------------
  // Weekly chart data
  // -------------------------------------------------------

  const barData =
    charts?.weekly ??
    charts?.weekly_activity ??
    charts?.activity ??
    charts?.bar_chart ??
    []

  return (
    <div className="space-y-8">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-slate-500">
          Your news analysis overview
        </p>
      </motion.div>


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Analyses"
          value={totalAnalyses}
          icon={BarChart3}
          color="brand"
        />

        <StatCard
          title="Fake News"
          value={fakeCount}
          icon={ShieldAlert}
          color="red"
        />

        <StatCard
          title="Real News"
          value={realCount}
          icon={ShieldCheck}
          color="green"
        />

        <StatCard
          title="Verifications"
          value={verificationCount}
          icon={FileSearch}
          color="blue"
        />

      </div>


      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ===================================================
            FAKE VS REAL
        =================================================== */}

        <div className="card">

          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-brand-600" />

            Fake vs Real Distribution
          </h3>

          <div className="mt-6 h-72">

            {totalAnalyses === 0 ? (

              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />

                  <p className="mt-3 text-sm text-slate-500">
                    No analysis data available yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Analyze a news article to see the distribution
                  </p>
                </div>
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >

                    {pieData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* ===================================================
            WEEKLY ACTIVITY
        =================================================== */}

        <div className="card">

          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5 text-brand-600" />

            Weekly Activity
          </h3>

          <div className="mt-6 h-72">

            {barData.length === 0 ? (

              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />

                  <p className="mt-3 text-sm text-slate-500">
                    No weekly activity yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your analysis activity will appear here
                  </p>
                </div>
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={barData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="opacity-30"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="fake"
                    fill="#ef4444"
                    name="Fake"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="real"
                    fill="#10b981"
                    name="Real"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            )}

          </div>

        </div>

      </div>

    </div>
  )
}