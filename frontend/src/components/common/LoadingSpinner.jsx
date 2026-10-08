import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-brand-800 dark:border-t-brand-400',
        sizes[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
