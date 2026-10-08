import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  Save,
  Shield,
  Calendar,
  Award
} from 'lucide-react'

import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services'

export default function Profile() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    email: user?.email || '',
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      const { data } = await authService.updateProfile(form)

      updateUser(data)

      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(
        err.response?.data?.detail || 'Update failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          My Profile
        </h1>

        <p className="mt-1 text-slate-500">
          Manage your FactShield AI account
        </p>
      </div>

      <Card>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">

          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-100 text-4xl font-bold text-brand-600 dark:bg-brand-950">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>

          <div className="flex-1">

            <h2 className="text-2xl font-bold">
              {user?.full_name || user?.username}
            </h2>

            <p className="mt-1 text-slate-500">
              {user?.email}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              <Badge
                label={user?.role || 'user'}
                variant={
                  user?.role === 'admin'
                    ? 'admin'
                    : 'user'
                }
              />

              <Badge
                label="FactShield Member"
                variant="success"
              />

            </div>

          </div>

        </div>

      </Card>

      <div className="grid gap-4 md:grid-cols-3">

        <Card>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-brand-600" />
            <div>
              <p className="text-sm text-slate-500">
                Account Type
              </p>
              <p className="font-semibold capitalize">
                {user?.role || 'user'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-slate-500">
                Status
              </p>
              <p className="font-semibold">
                Active
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-slate-500">
                Membership
              </p>
              <p className="font-semibold">
                Premium
              </p>
            </div>
          </div>
        </Card>

      </div>

      <Card>

        <h3 className="text-xl font-semibold">
          Edit Profile
        </h3>

        <form
          onSubmit={handleSave}
          className="mt-6 space-y-5"
        >

          <div>

            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <div className="relative">

              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                className="input-field pl-10"
                value={form.full_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    full_name: e.target.value,
                  })
                }
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Username
            </label>

            <div className="relative">

              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                className="input-field pl-10"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <div className="relative">

              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="email"
                className="input-field pl-10"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>

        </form>

      </Card>

    </div>
  )
}