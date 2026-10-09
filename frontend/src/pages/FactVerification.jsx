import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Info,
} from 'lucide-react'

import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { verificationService } from '../services'

const statusIcons = {
  verified: CheckCircle,
  unverified: XCircle,
  inconclusive: HelpCircle,
}

export default function FactVerification() {
  const [claim, setClaim] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleVerify = async () => {
    if (!claim.trim()) {
      toast.error('Please enter a claim to verify')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const { data } = await verificationService.verify(claim)

      console.log('Verification response:', data)

      setResult(data)

      toast.success('Verification complete!')
    } catch (err) {
      console.error('Verification error:', err)

      toast.error(
        err.response?.data?.detail ||
        'Verification failed'
      )
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------
  // Support both old and new backend response formats
  // -------------------------------------------------------

  const rawStatus =
    result?.status ||
    result?.result ||
    'Inconclusive'

  const normalizedStatus = String(rawStatus)
    .toLowerCase()
    .replace(/\s+/g, '_')

  const statusKey =
    normalizedStatus === 'verified'
      ? 'verified'
      : normalizedStatus === 'unverified'
      ? 'unverified'
      : 'inconclusive'

  const StatusIcon = statusIcons[statusKey]

  const statusLabel =
    result?.status ||
    result?.result ||
    'Inconclusive'

  const verificationMessage =
    result?.verification_result ||
    result?.explanation ||
    'No verification explanation was provided.'

  const confidence =
    typeof result?.confidence === 'number'
      ? result.confidence * 100
      : null

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>
        <h1 className="text-3xl font-bold">
          Fact Verification
        </h1>

        <p className="mt-1 text-slate-500">
          Verify claims against trusted knowledge sources
        </p>
      </div>


      {/* =====================================================
          INPUT CARD
      ===================================================== */}

      <Card>

        <label className="mb-2 block text-sm font-medium">
          Enter a claim to verify
        </label>

        <textarea
          className="input-field min-h-[120px] resize-y"
          placeholder="e.g., The Earth revolves around the Sun."
          value={claim}
          onChange={(e) => {
            setClaim(e.target.value)
            setResult(null)
          }}
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="btn-primary mt-4 inline-flex items-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Verify Claim
            </>
          )}
        </button>

      </Card>


      {/* =====================================================
          RESULT
      ===================================================== */}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >

          <div className="flex items-start gap-4">

            {/* Status icon */}

            <div
              className={`rounded-2xl p-3 ${
                statusKey === 'verified'
                  ? 'bg-emerald-100 dark:bg-emerald-950'
                  : statusKey === 'unverified'
                  ? 'bg-red-100 dark:bg-red-950'
                  : 'bg-amber-100 dark:bg-amber-950'
              }`}
            >
              <StatusIcon
                className={`h-9 w-9 ${
                  statusKey === 'verified'
                    ? 'text-emerald-600'
                    : statusKey === 'unverified'
                    ? 'text-red-600'
                    : 'text-amber-600'
                }`}
              />
            </div>


            <div className="flex-1">

              {/* Status + confidence */}

              <div className="flex flex-wrap items-center gap-3">

                <h3 className="text-xl font-bold capitalize">
                  {statusLabel}
                </h3>

                <Badge
                  label={statusLabel}
                  variant={statusKey}
                />

                {confidence !== null && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {confidence.toFixed(1)}% confidence
                  </span>
                )}

              </div>


              {/* Claim */}

              <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">

                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Info className="h-4 w-4 text-brand-600" />
                  Claim
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {result?.claim || claim}
                </p>

              </div>


              {/* Explanation */}

              <div className="mt-4">

                <p className="text-sm font-semibold">
                  Verification Result
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {verificationMessage}
                </p>

              </div>


              {/* Confidence bar */}

              {confidence !== null && (
                <div className="mt-4">

                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Confidence</span>
                    <span>
                      {confidence.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">

                    <div
                      className={`h-full rounded-full transition-all ${
                        statusKey === 'verified'
                          ? 'bg-emerald-500'
                          : statusKey === 'unverified'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.max(confidence, 0),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              )}


              {/* Sources */}

              {Array.isArray(result?.sources) &&
                result.sources.length > 0 && (
                  <div className="mt-5">

                    <p className="text-sm font-semibold">
                      Trusted Sources
                    </p>

                    <ul className="mt-2 space-y-2">

                      {result.sources.map((source, index) => (
                        <li key={index}>

                          <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
                          >
                            {source}

                            <ExternalLink className="h-3 w-3" />
                          </a>

                        </li>
                      ))}

                    </ul>

                  </div>
                )}

            </div>

          </div>

        </motion.div>
      )}

    </div>
  )
}