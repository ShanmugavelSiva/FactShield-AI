import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileText, Copy, Check } from 'lucide-react'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { summarizerService } from '../services'

export default function Summarizer() {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const originalWords = text.trim()
    ? text.trim().split(/\s+/).length
    : 0

  const summaryWords = summary.trim()
    ? summary.trim().split(/\s+/).length
    : 0

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to summarize')
      return
    }

    try {
      setLoading(true)
      setSummary('')
      setCopied(false)

      console.log('Sending text:', text)

      const response = await summarizerService.summarize(text)

      console.log('API response:', response.data)

      setSummary(response.data.summary)

      toast.success('Summary generated!')
    } catch (error) {
      console.error('Summarize error:', error)

      toast.error(
        error.response?.data?.detail || 'Failed to generate summary'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)

      setCopied(true)
      toast.success('Copied to clipboard!')

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('Failed to copy summary')
    }
  }

  const loadDemoArticle = () => {
    const demoText =
      'Artificial Intelligence is transforming industries across the world. Companies are investing heavily in AI-powered tools to improve productivity, automate workflows, and make better decisions. AI technologies such as machine learning, natural language processing, and computer vision are being used in healthcare, finance, education, and manufacturing sectors. Experts believe AI will continue to shape the future of innovation and business growth.'

    setText(demoText)

    // Clear the previous result whenever demo content is loaded.
    setSummary('')
    setCopied(false)
  }

  const handleTextChange = (event) => {
    setText(event.target.value)

    // Clear old summary when user starts editing the article.
    setSummary('')
    setCopied(false)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">News Summarizer</h1>

        <p className="mt-1 text-slate-500">
          Get concise summaries of long news articles
        </p>
      </div>

      <Card>
        <label className="mb-2 block text-sm font-medium">
          Article Text
        </label>

        <textarea
          className="input-field min-h-[220px] resize-y"
          placeholder="Paste a long news article here..."
          value={text}
          onChange={handleTextChange}
        />

        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Words: {originalWords}
          </p>

          <button
            onClick={loadDemoArticle}
            type="button"
            className="btn-secondary text-sm"
          >
            Load Demo Article
          </button>
        </div>

        <button
          onClick={handleSummarize}
          type="button"
          disabled={loading}
          className="btn-primary mt-4"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Summary
            </>
          )}
        </button>
      </Card>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Summary</h3>

            <button
              onClick={handleCopy}
              type="button"
              className="btn-secondary py-1.5 text-sm"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}

              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
            {summary}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500">Original Words</p>
              <p className="text-xl font-bold">{originalWords}</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <p className="text-sm text-slate-500">Summary Words</p>
              <p className="text-xl font-bold">{summaryWords}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}