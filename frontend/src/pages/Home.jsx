import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Search, CheckCircle, BarChart3, Sparkles, ArrowRight, Zap, Lock, Brain } from 'lucide-react'

const features = [
  { icon: Brain, title: 'AI-Powered Detection', desc: 'TF-IDF + Logistic Regression model trained on 40K+ news articles.' },
  { icon: Sparkles, title: 'Explainable AI', desc: 'See top keywords and reasons behind every prediction.' },
  { icon: CheckCircle, title: 'Fact Verification', desc: 'Verify claims against trusted knowledge sources.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track fake vs real news trends with interactive charts.' },
  { icon: Search, title: 'URL Analysis', desc: 'Paste any article URL and get instant analysis.' },
  { icon: Lock, title: 'Secure & Private', desc: 'JWT authentication with encrypted password storage.' },
]

const stats = [
  { value: '94%+', label: 'Model Accuracy' },
  { value: '40K+', label: 'Training Articles' },
  { value: '<2s', label: 'Analysis Time' },
  { value: '100%', label: 'Open Source' },
]

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/30" />
        <div className="mx-auto max-w-7xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
              <Zap className="h-4 w-4" /> AI-Powered Misinformation Defense
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Detect Fake News with{' '}
              <span className="gradient-text">FactShield AI</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Paste any news article, analyze URLs, verify facts, and get explainable AI predictions
              with confidence scores — all in one professional platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register" className="btn-primary px-8 py-3 text-base">
                Start Free Analysis <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/analyze" className="btn-secondary px-8 py-3 text-base">
                Try Demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="card text-center">
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-20 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything You Need</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              A complete platform for news analysis, fact-checking, and misinformation defense.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card group hover:border-brand-200 dark:hover:border-brand-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950 dark:text-brand-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-brand-600 to-violet-600 p-12 text-center text-white">
          <Shield className="mx-auto h-12 w-12" />
          <h2 className="mt-6 text-3xl font-bold">Ready to Fight Misinformation?</h2>
          <p className="mt-4 text-brand-100">Join FactShield AI and analyze news with confidence.</p>
          <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-brand-600 transition hover:bg-brand-50">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
