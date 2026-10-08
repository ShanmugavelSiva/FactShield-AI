import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, HelpCircle, ExternalLink } from 'lucide-react'
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
      setResult(data)
      toast.success('Verification complete!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = result ? statusIcons[result.status] || HelpCircle : null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fact Verification</h1>
        <p className="mt-1 text-slate-500">Verify claims against trusted knowledge sources</p>
      </div>

      <Card>
        <label className="mb-2 block text-sm font-medium">Enter a claim to verify</label>
        <textarea
          className="input-field min-h-[120px] resize-y"
          placeholder="e.g., Drinking bleach cures COVID-19"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />
        <button onClick={handleVerify} disabled={loading} className="btn-primary mt-4">
          {loading ? <LoadingSpinner size="sm" /> : 'Verify Claim'}
        </button>
      </Card>

      {result && StatusIcon && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-start gap-4">
            <StatusIcon className={`h-10 w-10 ${
              result.status === 'verified' ? 'text-emerald-500' :
              result.status === 'unverified' ? 'text-red-500' : 'text-amber-500'
            }`} />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold capitalize">{result.status}</h3>
                <Badge label={result.status} variant={result.status} />
              </div>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{result.verification_result}</p>
              {result.sources?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold">Sources</p>
                  <ul className="mt-2 space-y-2">
                    {result.sources.map((src, i) => (
                      <li key={i}>
                        <a
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
                        >
                          {src} <ExternalLink className="h-3 w-3" />
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
