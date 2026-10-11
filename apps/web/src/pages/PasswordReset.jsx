import { useState } from 'react'
import AppShell from '../components/AppShell'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, Check, AlertCircle, KeyRound, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function PasswordReset() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, setMustChangePassword } = useApp()

  const forcedFirstLogin = location.state?.forcedFirstLogin || false

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleChange = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPw || newPw.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (newPw !== confirmPw) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          current_password: currentPw || undefined,
          new_password: newPw
        })
      })

      const data = await res.json()
      setLoading(false)

      if (!res.ok) {
        setError(data.error || 'Failed to update password')
        return
      }

      setMustChangePassword(false)
      setDone(true)
      setTimeout(() => navigate('/home'), 2200)
    } catch (err) {
      setLoading(false)
      setError('Network or server error: ' + err.message)
    }
  }

  return (
    <AppShell>
      <div className="max-w-[500px] mx-auto space-y-5">
        <div>
          <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#1A0A0A]">
            {forcedFirstLogin ? 'Establish Permanent Password' : 'Change Password'}
          </h2>
          <p className="text-xs mt-0.5 text-[#6B5B5B]">
            {forcedFirstLogin 
              ? 'Required initial password setup for newly provisioned accounts' 
              : 'Update your ISSRMS account security credentials'}
          </p>
        </div>

        {/* First-Time Notice Banner */}
        {forcedFirstLogin && !done && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900 animate-fade-in font-medium">
            <Lock size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">First-Time Login Notice</p>
              <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">
                You are currently signed in with a temporary password. Please establish a permanent password to secure your account.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-[#EDE0D4] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EDE0D4]/70">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#611a17]/10 text-[#611a17]">
              <KeyRound size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A0A0A]">
                {done ? 'Password Updated Successfully' : 'Set New Password'}
              </h3>
              <p className="text-[10px] text-[#9B8B8B]">Account Security</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 font-medium">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!done ? (
            <form onSubmit={handleChange} className="space-y-4 text-xs">
              {!forcedFirstLogin && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#6B5B5B] text-[10px] mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D5C9BE] rounded-lg text-xs outline-none focus:border-[#611a17] focus:ring-1 focus:ring-[#611a17]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#6B5B5B] text-[10px] mb-1.5">
                  New Password (Min. 8 Characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5C9BE] rounded-lg text-xs outline-none focus:border-[#611a17] focus:ring-1 focus:ring-[#611a17]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#6B5B5B] text-[10px] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5C9BE] rounded-lg text-xs outline-none focus:border-[#611a17] focus:ring-1 focus:ring-[#611a17]"
                />
                {newPw && confirmPw && newPw !== confirmPw && (
                  <p className="text-[10px] text-red-600 mt-1 font-semibold">Passwords do not match.</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !newPw || newPw !== confirmPw || newPw.length < 8}
                  className="w-full py-2.5 bg-[#611a17] hover:bg-[#4e1412] disabled:opacity-50 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs shadow-sm"
                >
                  <Shield size={14} />
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>

              <p className="text-[10px] text-[#9B8B8B] text-center">
                Your new password will take effect immediately.
              </p>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Check size={16} className="text-emerald-700" />
                Password Successfully Updated
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Your password has been changed. Redirecting to your dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
