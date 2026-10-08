import { Link } from 'react-router-dom'
import { Shield, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-brand-600" />
              <span className="text-lg font-bold">FactShield AI</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-slate-500 dark:text-slate-400">
              AI-powered fake news detection and fact verification platform.
              Protect yourself from misinformation with machine learning and explainable AI.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/analyze" className="hover:text-brand-600">Analyze News</Link></li>
              <li><Link to="/verify" className="hover:text-brand-600">Fact Verification</Link></li>
              <li><Link to="/summarize" className="hover:text-brand-600">Summarizer</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Connect</h4>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-slate-400 hover:text-brand-600"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-brand-600"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-brand-600"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800">
          © {new Date().getFullYear()} FactShield AI. Built for educational & portfolio use.
        </div>
      </div>
    </footer>
  )
}
