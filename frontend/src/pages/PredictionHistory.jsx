import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  History,
  Trash2,
  Eye,
  Search,
  Download
} from 'lucide-react'

import Badge from '../components/common/Badge'
import { TableSkeleton } from '../components/common/Skeleton'
import { predictionService } from '../services'

export default function PredictionHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchHistory = async () => {
    try {
      const { data } = await predictionService.getHistory()
      setHistory(data.items || [])
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleDelete = async (id) => {
    try {
      await predictionService.deleteHistory(id)

      setHistory((prev) =>
        prev.filter((item) => item.id !== id)
      )

      if (selected?.id === id) {
        setSelected(null)
      }

      toast.success('Prediction deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)

    const blob = new Blob([dataStr], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')

    a.href = url
    a.download = 'factshield-history.json'

    a.click()

    URL.revokeObjectURL(url)

    toast.success('History exported')
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.news_text
        ?.toLowerCase()
        .includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      item.prediction === filter

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <TableSkeleton rows={8} />
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <History className="h-8 w-8 text-brand-600" />
          Prediction History
        </h1>

        <p className="mt-1 text-slate-500">
          View, search, filter and export your previous AI analyses
        </p>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search prediction history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field max-w-[180px]"
          >
            <option value="all">All Results</option>
            <option value="fake">Fake News</option>
            <option value="real">Real News</option>
          </select>

          <button
            onClick={exportHistory}
            className="btn-secondary"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="card py-12 text-center">
          <History className="mx-auto h-12 w-12 text-slate-300" />

          <p className="mt-4 text-slate-500">
            No matching predictions found
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">

          <table className="w-full text-left text-sm">

            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">

              <tr>
                <th className="px-6 py-3 font-semibold">
                  Date
                </th>

                <th className="px-6 py-3 font-semibold">
                  News Preview
                </th>

                <th className="px-6 py-3 font-semibold">
                  Prediction
                </th>

                <th className="px-6 py-3 font-semibold">
                  Confidence
                </th>

                <th className="px-6 py-3 font-semibold">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody>

              {filteredHistory.map((item) => (

                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-100 dark:border-slate-800"
                >

                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td className="max-w-xs truncate px-6 py-4">
                    {item.news_text?.slice(0, 80)}...
                  </td>

                  <td className="px-6 py-4">
                    <Badge
                      label={item.prediction}
                      variant={item.prediction}
                    />
                  </td>

                  <td className="px-6 py-4 font-medium">
                    {(item.confidence * 100).toFixed(1)}%
                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() => setSelected(item)}
                        className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        className="rounded-lg p-2 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </td>

                </motion.tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

      {selected && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
        >

          <div className="flex items-center justify-between">

            <h3 className="text-lg font-semibold">
              Analysis Details
            </h3>

            <button
              onClick={() => setSelected(null)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Close
            </button>

          </div>

          <div className="mt-4 space-y-4">

            <Badge
              label={selected.prediction}
              variant={selected.prediction}
            />

            <p>
              <strong>Confidence:</strong>{' '}
              {(selected.confidence * 100).toFixed(1)}%
            </p>

            <p className="rounded-xl bg-slate-50 p-4 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {selected.news_text}
            </p>

            {selected.explanation && (
              <div>
                <strong>Explanation:</strong>

                <p className="mt-2">
                  {selected.explanation}
                </p>
              </div>
            )}

            {selected.keywords?.length > 0 && (
              <div>

                <p className="mb-2 font-semibold">
                  Top Keywords
                </p>

                <div className="flex flex-wrap gap-2">

                  {selected.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-medium dark:bg-brand-950"
                    >
                      {kw.word}
                    </span>
                  ))}

                </div>

              </div>
            )}

          </div>

        </motion.div>

      )}

    </div>
  )
}