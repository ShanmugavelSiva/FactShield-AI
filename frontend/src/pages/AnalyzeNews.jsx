import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Search,
  Link as LinkIcon,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  CircleHelp,
} from 'lucide-react'

import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { predictionService } from '../services'
import API_BASE from '../config/api'

function PredictionResult({ result }) {
  const prediction = String(result?.prediction || 'UNKNOWN').toUpperCase()
  const isFake = prediction === 'FAKE'
  const isKnown = prediction === 'FAKE' || prediction === 'REAL'
  const confidence = Number(result?.confidence ?? 0)
  const confidencePercent = confidence * 100
  const keywords = Array.isArray(result?.keywords) ? result.keywords : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mt-6 border-2 border-dashed"
    >
      <div className="flex items-start gap-4">
        <div className={`rounded-2xl p-3 ${isFake ? 'bg-red-100 dark:bg-red-950' : 'bg-emerald-100 dark:bg-emerald-950'}`}>
          {isFake ? <AlertTriangle className="h-8 w-8 text-red-600" /> : <CheckCircle2 className="h-8 w-8 text-emerald-600" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold">ML model prediction: {prediction}</h3>
            {isKnown && <Badge label={`${confidencePercent.toFixed(1)}% model score`} variant={isFake ? 'danger' : 'success'} />}
          </div>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            This is a text-pattern prediction, not proof that the story is factually true or false. See the source-grounded check below.
          </p>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all ${isFake ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(Math.max(confidencePercent, 0), 100)}%` }}
            />
          </div>

          {result?.explanation && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-brand-600" /> Model explanation</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{result.explanation}</p>
            </div>
          )}

          {keywords.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold">Top influential keywords</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {keywords.map((item, index) => {
                  const keyword = typeof item === 'string' ? item : item?.word || 'keyword'
                  const influence = typeof item === 'object' && item?.influence !== undefined ? Number(item.influence) : null
                  return (
                    <span key={`${keyword}-${index}`} className="rounded-lg bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {keyword}{influence !== null && <span className="ml-1">({influence > 0 ? '+' : ''}{influence.toFixed(3)})</span>}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {(result?.fake_probability !== undefined || result?.real_probability !== undefined) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
                <p className="text-xs font-medium text-slate-500">Fake class score</p>
                <p className="mt-1 text-lg font-bold text-red-600">{(Number(result?.fake_probability ?? 0) * 100).toFixed(1)}%</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <p className="text-xs font-medium text-slate-500">Real class score</p>
                <p className="mt-1 text-lg font-bold text-emerald-600">{(Number(result?.real_probability ?? 0) * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const verdictStyles = {
  TRUE: {
    label: 'SUPPORTED',
    shell: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20',
    pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: 'text-emerald-600',
  },
  FALSE: {
    label: 'FALSE',
    shell: 'border-red-500/30 bg-red-50 dark:bg-red-950/20',
    pill: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: 'text-red-600',
  },
  MISLEADING: {
    label: 'MISLEADING',
    shell: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/20',
    pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    icon: 'text-amber-600',
  },
  UNVERIFIED: {
    label: 'UNVERIFIED',
    shell: 'border-slate-500/30 bg-slate-50 dark:bg-slate-900/40',
    pill: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    icon: 'text-slate-600',
  },
}

function FactCheckResult({ result }) {
  const verdict = String(result?.verdict || 'UNVERIFIED').toUpperCase()
  const style = verdictStyles[verdict] || verdictStyles.UNVERIFIED
  const sources = Array.isArray(result?.sources) ? result.sources : []
  const findings = Array.isArray(result?.key_findings) ? result.key_findings : []
  const Icon = verdict === 'UNVERIFIED' ? CircleHelp : ShieldCheck

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`card mt-6 border-2 ${style.shell}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/60"><Icon className={`h-7 w-7 ${style.icon}`} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold">Source-grounded fact check</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.pill}`}>{style.label}</span>
          </div>
          <p className="mt-2 font-semibold">{result?.headline || 'Review the linked evidence'}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{result?.explanation || 'No explanation was returned.'}</p>

          {findings.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold">Key findings</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-200">
                {findings.map((finding, index) => <li key={`${index}-${finding}`}>{finding}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-5">
            <p className="text-sm font-semibold">News sources found by Google News RSS</p>
            {sources.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {sources.map((source, index) => (
                  <li key={source.url || index}>
                    <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-brand-700 underline dark:text-brand-300">
                      <span>{source.title || source.url}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No news source links were returned. Treat this as unverified and retry later.</p>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">AI-assisted assessment only. This preliminary assessment uses Google News RSS results, which may be incomplete. Open the sources and check full article context; it is not an official fact-check verdict.</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function AnalyzeNews() {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState('text')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [factCheck, setFactCheck] = useState(null)
  const [factCheckError, setFactCheckError] = useState('')

  const handleAnalyze = async () => {
    if (mode === 'text' && !text.trim()) {
      toast.error('Please enter news text')
      return
    }
    if (mode === 'url' && !url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    setResult(null)
    setFactCheck(null)
    setFactCheckError('')

    try {
      const { data } = mode === 'text'
        ? await predictionService.predict(text.trim())
        : await predictionService.predictUrl(url.trim())

      setResult(data)
      toast.success('ML analysis complete')

      const textToCheck = mode === 'text' ? text.trim() : String(data?.news_text || '').trim()
      if (!textToCheck) {
        setFactCheckError('The article text could not be extracted, so source-grounded fact-checking could not run.')
        return
      }

      try {
        const response = await fetch(`${API_BASE}/fact-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claim: textToCheck.slice(0, 8000) }),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.detail || `Fact-check request failed (${response.status})`)
        }
        setFactCheck(payload)
        toast.success('Source-grounded fact check complete')
      } catch (error) {
        console.error('Source-grounded fact-check error:', error)
        setFactCheckError(error?.message || 'The source-grounded fact check is unavailable right now.')
        toast.error('ML prediction is ready, but source verification failed')
      }
    } catch (error) {
      console.error('Prediction error:', error)
      toast.error(error.response?.data?.detail || error.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analyze News</h1>
        <p className="mt-1 text-slate-500">Compare a text-pattern ML prediction with current web evidence.</p>
      </div>

      <Card>
        <div className="mb-4 flex gap-2">
          <button onClick={() => { setMode('text'); setResult(null); setFactCheck(null); setFactCheckError('') }} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${mode === 'text' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <Search className="mr-1 inline h-4 w-4" /> Paste Text
          </button>
          <button onClick={() => { setMode('url'); setResult(null); setFactCheck(null); setFactCheckError('') }} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${mode === 'url' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <LinkIcon className="mr-1 inline h-4 w-4" /> Analyze URL
          </button>
        </div>

        {mode === 'text' ? (
          <textarea className="input-field min-h-[200px] resize-y" placeholder="Paste a news article or factual claim here..." value={text} onChange={(event) => { setText(event.target.value); setResult(null); setFactCheck(null); setFactCheckError('') }} />
        ) : (
          <input type="url" className="input-field" placeholder="https://example.com/news-article" value={url} onChange={(event) => { setUrl(event.target.value); setResult(null); setFactCheck(null); setFactCheckError('') }} />
        )}

        <button onClick={handleAnalyze} disabled={loading} className="btn-primary mt-4 w-full py-3 sm:w-auto">
          {loading ? <LoadingSpinner size="sm" /> : <><Search className="h-4 w-4" /> Analyze & Check Sources</>}
        </button>
      </Card>

      {result && <PredictionResult result={result} />}

      {loading && result && (
        <div className="card mt-6 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <LoadingSpinner size="sm" /> Checking current web sources. This can take a little longer than the ML prediction.
        </div>
      )}

      {factCheck && <FactCheckResult result={factCheck} />}

      {factCheckError && (
        <div className="card mt-6 border border-amber-500/40 bg-amber-50 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-semibold">Source-grounded fact check unavailable</p>
          <p className="mt-1">{factCheckError}</p>
          <p className="mt-2">The ML prediction above is not a confirmed truth verdict. Please open trusted sources or retry the source check.</p>
        </div>
      )}
    </div>
  )
}
