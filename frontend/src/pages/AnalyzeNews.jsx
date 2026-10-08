import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Search,
  Link as LinkIcon,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { predictionService } from '../services'


function PredictionResult({ result }) {
  const prediction = String(result?.prediction || 'UNKNOWN').toUpperCase()
  const isFake = prediction === 'FAKE'

  const confidence = Number(result?.confidence ?? 0)
  const confidencePercent = confidence * 100

  const keywords = Array.isArray(result?.keywords)
    ? result.keywords
    : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mt-6 border-2 border-dashed"
    >
      <div className="flex items-start gap-4">
        <div
          className={`rounded-2xl p-3 ${
            isFake
              ? 'bg-red-100 dark:bg-red-950'
              : 'bg-emerald-100 dark:bg-emerald-950'
          }`}
        >
          {isFake ? (
            <AlertTriangle className="h-8 w-8 text-red-600" />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold">
              Prediction: {prediction}
            </h3>

            <Badge
              label={`${confidencePercent.toFixed(1)}% confidence`}
              variant={isFake ? 'danger' : 'success'}
            />
          </div>

          <div className="mt-4">
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full transition-all ${
                  isFake ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(Math.max(confidencePercent, 0), 100)}%`,
                }}
              />
            </div>
          </div>

          {result?.explanation && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-brand-600" />
                Explanation
              </p>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {result.explanation}
              </p>
            </div>
          )}

          {keywords.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold">
                Top Influential Keywords
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {keywords.map((item, index) => {
                  /*
                   * Backend currently returns keywords as strings.
                   * This also supports object format in case the API
                   * is extended later.
                   */
                  const keyword =
                    typeof item === 'string'
                      ? item
                      : item?.word || 'keyword'

                  const influence =
                    typeof item === 'object' &&
                    item?.influence !== undefined
                      ? Number(item.influence)
                      : null

                  return (
                    <span
                      key={`${keyword}-${index}`}
                      className="rounded-lg bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    >
                      {keyword}

                      {influence !== null && (
                        <span className="ml-1">
                          (
                          {influence > 0 ? '+' : ''}
                          {influence.toFixed(3)}
                          )
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {(result?.fake_probability !== undefined ||
            result?.real_probability !== undefined) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
                <p className="text-xs font-medium text-slate-500">
                  Fake Probability
                </p>

                <p className="mt-1 text-lg font-bold text-red-600">
                  {(Number(result?.fake_probability ?? 0) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <p className="text-xs font-medium text-slate-500">
                  Real Probability
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-600">
                  {(Number(result?.real_probability ?? 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
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

    try {
      const { data } =
        mode === 'text'
          ? await predictionService.predict(text)
          : await predictionService.predictUrl(url)

      setResult(data)

      toast.success('Analysis complete!')
    } catch (err) {
      console.error('Prediction error:', err)

      toast.error(
        err.response?.data?.detail ||
          'Analysis failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Analyze News
        </h1>

        <p className="mt-1 text-slate-500">
          Detect fake or real news with AI-powered analysis
        </p>
      </div>


      <Card>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => {
              setMode('text')
              setResult(null)
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === 'text'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <Search className="mr-1 inline h-4 w-4" />
            Paste Text
          </button>


          <button
            onClick={() => {
              setMode('url')
              setResult(null)
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === 'url'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <LinkIcon className="mr-1 inline h-4 w-4" />
            Analyze URL
          </button>
        </div>


        {mode === 'text' ? (
          <textarea
            className="input-field min-h-[200px] resize-y"
            placeholder="Paste your news article here..."
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setResult(null)
            }}
          />
        ) : (
          <input
            type="url"
            className="input-field"
            placeholder="https://example.com/news-article"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setResult(null)
            }}
          />
        )}


        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="btn-primary mt-4 w-full py-3 sm:w-auto"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyze Now
            </>
          )}
        </button>
      </Card>


      {result && <PredictionResult result={result} />}
    </div>
  )
}