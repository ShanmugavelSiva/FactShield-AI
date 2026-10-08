import clsx from 'clsx'

const variants = {
  fake: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  real: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  verified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  unverified: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  inconclusive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  user: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
}

export default function Badge({ label, variant = 'real', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        variants[variant] || variants.real,
        className,
      )}
    >
      {label}
    </span>
  )
}
