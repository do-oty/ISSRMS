import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import sjsmCrest from '../assets/sjsm_crest_real.png'
import sjsmCampusPhoto from '../assets/sjsm_campus_real.jpg'
import { useApp } from '../context/AppContext'

const QUICK_DEMO_ACCOUNTS = [
  { label: 'Admin', id: '22100277', pw: 'admin123' },
  { label: 'Registrar', id: 'EMP-2012-0051', pw: 'reg123' },
  { label: 'Canteen', id: 'EMP-2020-0042', pw: 'canteen123' },
  { label: 'Library', id: 'EMP-2018-0119', pw: 'library123' },
  { label: 'Student', id: 'STU-2026-0891', pw: 'student123' },
]

export default function Login() {
  const [showPw, setShowPw] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [shaking, setShaking] = useState(false)
  const idRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useApp()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    const cleanId = loginId.trim()
    const result = await login(cleanId, password)

    setLoading(false)

    if (result.success) {
      if (result.must_change_password) {
        navigate('/password-reset', { state: { forcedFirstLogin: true, id_number: cleanId } })
      } else {
        navigate('/home')
      }
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.')
      triggerShake()
    }
  }

  const fillDemo = (id, pw) => {
    setLoginId(id)
    setPassword(pw)
    setErrorMessage('')
  }

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 450)
  }

  const [forgotStep, setForgotStep] = useState(1) // 1: Enter ID, 2: Enter 6-digit OTP, 3: Set New Password, 4: Success
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', ''])
  const [forgotNewPw, setForgotNewPw] = useState('')
  const [forgotConfirmPw, setForgotConfirmPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [forgotMaskedPhone, setForgotMaskedPhone] = useState('')
  const [forgotDemoOtp, setForgotDemoOtp] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('')
  const otpInputRefs = useRef([])

  // Calculate password strength
  const getPasswordStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: 'bg-gray-200' }
    let score = 0
    if (pw.length >= 8) score += 1
    if (pw.length >= 12) score += 1
    if (/[A-Z]/.test(pw)) score += 1
    if (/[0-9]/.test(pw)) score += 1
    if (/[^A-Za-z0-9]/.test(pw)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' }
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' }
    if (score === 3 || score === 4) return { score: 3, label: 'Good', color: 'bg-blue-600', text: 'text-blue-600' }
    return { score: 4, label: 'Strong', color: 'bg-emerald-600', text: 'text-emerald-600' }
  }

  const handleOtpBoxChange = (idx, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '')
    const newBoxes = [...otpBoxes]
    if (cleaned.length > 1) {
      // Pasted multiple digits
      const digits = cleaned.slice(0, 6).split('')
      digits.forEach((d, i) => {
        if (idx + i < 6) newBoxes[idx + i] = d
      })
      setOtpBoxes(newBoxes)
      const nextIdx = Math.min(idx + digits.length, 5)
      otpInputRefs.current[nextIdx]?.focus()
      return
    }

    newBoxes[idx] = cleaned
    setOtpBoxes(newBoxes)
    if (cleaned && idx < 5) {
      otpInputRefs.current[idx + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpBoxes[idx] && idx > 0) {
      otpInputRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newBoxes = [...otpBoxes]
    pasted.split('').forEach((char, i) => {
      newBoxes[i] = char
    })
    setOtpBoxes(newBoxes)
    const nextIdx = Math.min(pasted.length, 5)
    otpInputRefs.current[nextIdx]?.focus()
  }

  const autoFillOtp = (code) => {
    if (!code) return
    const digits = code.slice(0, 6).split('')
    const newBoxes = ['', '', '', '', '', '']
    digits.forEach((d, i) => { newBoxes[i] = d })
    setOtpBoxes(newBoxes)
    otpInputRefs.current[5]?.focus()
  }

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault()
    const cleanId = loginId.trim()
    if (!cleanId) {
      setForgotError('Please enter your identification number first.')
      triggerShake()
      return
    }

    setForgotLoading(true)
    setForgotError('')

    try {
      const apiUrl = window.location.port === '5173' ? 'http://localhost:5000/api/v1/auth/forgot-password/request' : '/api/v1/auth/forgot-password/request'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: cleanId })
      })
      const text = await res.text()
      let data = {}
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error('Server returned unexpected response. Please ensure backend is running.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Unable to request password recovery.')
      }

      setForgotMaskedPhone(data.masked_phone || '0931••••340')
      setForgotDemoOtp(data.demo_otp || '')
      setOtpBoxes(['', '', '', '', '', ''])
      setForgotStep(2)
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150)
    } catch (err) {
      setForgotError(err.message)
      triggerShake()
    } finally {
      setForgotLoading(false)
    }
  }

  // Stage 1 Verification: Only validates the 6-digit OTP code to advance to the new password step
  const handleConfirmOtpCode = async (e) => {
    if (e) e.preventDefault()
    setForgotError('')
    const fullCode = otpBoxes.join('').trim()
    if (fullCode.length !== 6) {
      setForgotError('Please complete the 6-digit verification code.')
      triggerShake()
      return
    }

    setForgotLoading(true)

    try {
      const apiUrl = window.location.port === '5173' ? 'http://localhost:5000/api/v1/auth/forgot-password/verify' : '/api/v1/auth/forgot-password/verify'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_number: loginId.trim(),
          otp: fullCode
        })
      })
      const text = await res.text()
      let data = {}
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error('Server returned unexpected response during verification.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired verification code.')
      }

      // Code successfully validated! Advance to New Password step
      setForgotStep(3)
      setForgotNewPw('')
      setForgotConfirmPw('')
    } catch (err) {
      setForgotError(err.message)
      triggerShake()
    } finally {
      setForgotLoading(false)
    }
  }

  // Stage 2: Submit New Password with Verified OTP
  const handleSubmitNewPassword = async (e) => {
    if (e) e.preventDefault()
    setForgotError('')

    if (forgotNewPw.length < 8) {
      setForgotError('New password must be at least 8 characters long.')
      triggerShake()
      return
    }
    if (forgotNewPw !== forgotConfirmPw) {
      setForgotError('Passwords do not match.')
      triggerShake()
      return
    }

    setForgotLoading(true)

    try {
      const fullCode = otpBoxes.join('').trim()
      const apiUrl = window.location.port === '5173' ? 'http://localhost:5000/api/v1/auth/forgot-password/verify' : '/api/v1/auth/forgot-password/verify'
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_number: loginId.trim(),
          otp: fullCode,
          new_password: forgotNewPw
        })
      })
      const text = await res.text()
      let data = {}
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error('Server returned unexpected response during password update.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.')
      }

      setForgotSuccessMsg(data.message || 'Password successfully reset.')
      setForgotStep(4)
    } catch (err) {
      setForgotError(err.message)
      triggerShake()
    } finally {
      setForgotLoading(false)
    }
  }

  const resetForgotState = () => {
    setShowForgot(false)
    setForgotStep(1)
    setForgotError('')
    setOtpBoxes(['', '', '', '', '', ''])
    setForgotNewPw('')
    setForgotConfirmPw('')
    setForgotMaskedPhone('')
    setForgotDemoOtp('')
    setForgotSuccessMsg('')
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fdfaf4] font-['Inter',sans-serif] select-none overflow-x-hidden">
      
      {/* ── Left Hero Panel (52% Width on Desktop: Rich Maroon & Campus Vignette) ── */}
      <div 
        className="relative w-full lg:w-[52%] shrink-0 min-h-[520px] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#530e0c]"
      >
        {/* sjsm1 1: Campus Photo Overlay with Controlled Vignette */}
        <img
          src={sjsmCampusPhoto}
          alt="Saint Joseph's School of Mactan Campus"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
          style={{
            opacity: 0.28,
            mixBlendMode: 'overlay',
            objectPosition: 'center 20%'
          }}
        />

        {/* Cinematic Lighting Gradient & Radial Vignette */}
        <div 
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(97, 26, 23, 0.45) 0%, rgba(56, 9, 7, 0.88) 100%)'
          }}
        />

        {/* Ambient Warm Golden Orb */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-[#c8a227]/10 blur-3xl pointer-events-none z-[1]" />

        {/* Top spacer for breathing room */}
        <div className="w-full h-12 lg:h-[15vh] relative z-10" />

        {/* ── Center Branding Block ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 lg:px-16 my-auto">
          {/* Crest Logo with Ambient Glow */}
          <div className="relative mb-5 group">
            <div className="absolute inset-0 rounded-full bg-[#c8a227]/20 blur-xl transform group-hover:scale-110 transition-transform duration-300" />
            <img 
              src={sjsmCrest} 
              alt="Saint Joseph's School of Mactan Crest" 
              className="relative w-36 h-36 lg:w-44 lg:h-44 object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-300" 
            />
          </div>

          {/* School Name: Plus Jakarta Sans, 26px, Bold w700, #ffffff */}
          <h1 
            className="font-['Plus_Jakarta_Sans',sans-serif] text-white text-2xl lg:text-[28px] font-bold leading-tight text-center uppercase tracking-normal drop-shadow-md"
          >
            Saint Joseph’s School of Mactan, Inc.
          </h1>

          {/* System Subtitle: Primary Gold (#c8a227 matching AppShell header), tucked tight */}
          <p 
            className="font-['Inter',sans-serif] text-[#c8a227] text-xs lg:text-[12.5px] font-bold text-center uppercase tracking-wider mt-0.5 max-w-lg leading-snug drop-shadow-sm"
          >
            Integrated Student Services & Resource Management System
          </p>
        </div>

        {/* ── Bottom Tagline Block ── */}
        <div className="relative z-10 flex flex-col items-center text-center pb-8 lg:pb-10 px-8 mt-auto">
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-white text-[13px] font-bold italic tracking-wider uppercase text-center leading-normal drop-shadow">
            Sa SJSM @✌️ ka dito!
          </p>
          <p className="font-['Inter',sans-serif] text-white/70 text-[12px] font-extralight text-center mt-1.5 tracking-normal">
            © 2026 Saint Joseph School of Mactan, Inc. · ISSRMS
          </p>
        </div>

        {/* ── 3-Strip Gold Border on Right (7px each) ── */}
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 z-20 pointer-events-none">
          <div className="w-[7px] h-full bg-[#c8a227]" />
          <div className="w-[7px] h-full bg-[#f7dc85]" />
          <div className="w-[7px] h-full bg-[#f8e9b9]" />
        </div>
      </div>

      {/* ── Right Authentication Panel (48% Width on Desktop: Focused & Centered) ── */}
      <div className="w-full lg:w-[48%] min-h-[520px] lg:min-h-screen flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 bg-[#fdfaf4]">
        
        {/* Mobile Header Brand Fallback */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <img src={sjsmCrest} alt="SJSM Crest" className="w-12 h-12 object-contain" />
          <div>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-[#000000]">Saint Joseph’s School of Mactan</h2>
            <p className="text-[11px] font-bold text-[#c8a227]">ISSRMS PORTAL</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[420px]">
          {!showForgot ? (
            <div>
              {/* Header Block */}
              <div className="mb-6">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[26px] font-bold text-[#000000] leading-tight">
                  Welcome back
                </h2>
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-normal text-[#6b5b5b] mt-1 leading-normal">
                  Sign in to your ISSRMS account with your institutional credentials
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-fade-in font-medium">
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Authentication Failed</p>
                    <p className="mt-0.5 text-red-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSignIn}>
                
                {/* Field 1: Identification Number / Username */}
                <div className={shaking ? 'shake' : ''}>
                  <label className="block font-['Inter',sans-serif] text-[14px] font-semibold text-[#1A0A0A] leading-tight mb-2">
                    Identification Number / Username
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      ref={idRef}
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="e.g. 22100277 or STU-2026-0891"
                      required
                      className="w-full h-[50px] px-4 bg-white border border-[#D5C9BE] hover:border-[#6b5b5b] rounded-[10px] font-['Inter',sans-serif] text-[14px] text-[#000000] placeholder-[#9b8b8b] shadow-sm focus:outline-none focus:border-[#611a17] focus:ring-2 focus:ring-[#611a17]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div className="mt-4">
                  <label className="block font-['Inter',sans-serif] text-[14px] font-semibold text-[#1A0A0A] leading-tight mb-2">
                    Password
                  </label>
                  
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-[50px] px-4 pr-12 bg-white border border-[#D5C9BE] hover:border-[#6b5b5b] rounded-[10px] font-['Inter',sans-serif] text-[14px] text-[#000000] placeholder-[#9b8b8b] shadow-sm focus:outline-none focus:border-[#611a17] focus:ring-2 focus:ring-[#611a17]/15 transition-all"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b5b5b] hover:text-[#611a17] transition-colors p-1 cursor-pointer"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={18} className="stroke-[1.6]" /> : <Eye size={18} className="stroke-[1.6]" />}
                    </button>
                  </div>
                </div>

                {/* Row 3: Remember me & Forgot password? */}
                <div className="flex items-center justify-between mt-3.5">
                  <label className="flex items-center gap-2 font-['Inter',sans-serif] text-[13px] font-normal text-[#6b5b5b] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-[4px] border border-[#D5C9BE] text-[#611a17] focus:ring-[#611a17] cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setForgotStep(1); setForgotError('') }}
                    className="font-['Inter',sans-serif] text-[13px] font-semibold text-[#611a17] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Row 4: Submit Button */}
                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[50px] bg-[#611a17] hover:bg-[#4e1412] active:scale-[0.99] text-white font-['Inter',sans-serif] text-[14px] font-bold rounded-[10px] shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center disabled:opacity-75"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in to ISSRMS'
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Fill Demo Roles (For seamless demonstration) */}
              <div className="mt-7 pt-4 border-t border-[#EDE0D4]">
                <p className="text-[11px] font-bold text-[#6b5b5b] uppercase tracking-wider mb-2 text-center">
                  Quick Demo Sign-In
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {QUICK_DEMO_ACCOUNTS.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => fillDemo(acc.id, acc.pw)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-[#EDE0D4] bg-[#FAF8F5] hover:bg-[#c8a227]/15 hover:border-[#c8a227] text-[#1A0A0A] transition-all cursor-pointer"
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <button
                type="button"
                onClick={resetForgotState}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#611a17] mb-5 hover:underline cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>

              <div className="mb-5">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-[#000000]">
                  {forgotStep === 4 ? 'Password Reset Complete' : forgotStep === 3 ? 'Set New Password' : 'Forgot Password'}
                </h2>
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#6b5b5b] mt-1 leading-relaxed">
                  {forgotStep === 1 && 'Enter your identification number to receive a 6-digit SMS verification code to your registered mobile contact.'}
                  {forgotStep === 2 && `We sent a 6-digit code to ${forgotMaskedPhone}. Enter the code below to verify your identity.`}
                  {forgotStep === 3 && 'Your identity has been verified. Establish your new permanent password below.'}
                  {forgotStep === 4 && 'Your password has been securely updated. You can now log in with your new credentials.'}
                </p>
              </div>

              {forgotError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4 font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* Step 1: Request OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className={shaking ? 'shake' : ''}>
                    <label className="block text-[13px] font-semibold text-[#1A0A0A] mb-1.5">
                      Identification Number / Username
                    </label>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="e.g. STU-2026-0891 or 22100277"
                      required
                      className="w-full h-[50px] px-4 bg-white border border-[#D5C9BE] rounded-[10px] text-[14px] text-[#000000] focus:outline-none focus:border-[#611a17] focus:ring-2 focus:ring-[#611a17]/15"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full h-[50px] bg-[#611a17] text-white font-['Inter',sans-serif] font-bold text-[14px] rounded-[10px] hover:bg-[#4e1412] transition-colors cursor-pointer flex items-center justify-center disabled:opacity-75"
                  >
                    {forgotLoading ? 'Sending SMS Code...' : 'Send Recovery Code via SMS'}
                  </button>
                </form>
              )}

              {/* Step 2: Enter 6-Digit OTP in Separate Boxes */}
              {forgotStep === 2 && (
                <form onSubmit={handleConfirmOtpCode} className="space-y-5">
                  {forgotDemoOtp && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
                      <span>SMS Demo Code: <strong className="font-mono text-sm tracking-wider">{forgotDemoOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => autoFillOtp(forgotDemoOtp)}
                        className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded text-[11px] font-bold text-amber-900 cursor-pointer transition-colors"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-[13px] font-semibold text-[#1A0A0A] mb-2 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    
                    {/* 6 Separate Digit Boxes */}
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                      {otpBoxes.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpBoxChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          className="w-12 h-14 sm:w-13 sm:h-14 text-center text-xl font-bold font-mono bg-white border border-[#D5C9BE] focus:border-[#611a17] focus:ring-2 focus:ring-[#611a17]/20 rounded-xl shadow-sm outline-none transition-all text-[#1A0A0A]"
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-[#6b5b5b] text-center mt-2.5">
                      Code valid for 10 minutes. Check your messages or carrier preview.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="w-1/3 h-[50px] border border-[#D5C9BE] text-[#6b5b5b] font-bold text-[13px] rounded-[10px] hover:bg-stone-50 cursor-pointer"
                    >
                      Resend
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading || otpBoxes.join('').length !== 6}
                      className="w-2/3 h-[50px] bg-[#611a17] text-white font-bold text-[14px] rounded-[10px] hover:bg-[#4e1412] transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
                    >
                      {forgotLoading ? 'Verifying Code...' : 'Verify Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Set New Password with Real-Time Strength Meter (Only appears after successful OTP) */}
              {forgotStep === 3 && (
                <form onSubmit={handleSubmitNewPassword} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                    <span>Identity confirmed via SMS OTP. Set your new password.</span>
                  </div>

                  {/* New Password Input */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1A0A0A] mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={forgotNewPw}
                        onChange={(e) => setForgotNewPw(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        className="w-full h-[50px] px-4 pr-11 bg-white border border-[#D5C9BE] rounded-[10px] text-[14px] text-[#000000] focus:outline-none focus:border-[#611a17] focus:ring-2 focus:ring-[#611a17]/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b5b5b] hover:text-[#611a17] cursor-pointer"
                      >
                        {showNewPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {forgotNewPw && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#6b5b5b]">Strength:</span>
                          <span className={`font-bold ${getPasswordStrength(forgotNewPw).text}`}>
                            {getPasswordStrength(forgotNewPw).label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((level) => {
                            const strength = getPasswordStrength(forgotNewPw)
                            return (
                              <div
                                key={level}
                                className={`rounded-full transition-all duration-200 ${
                                  strength.score >= level ? strength.color : 'bg-gray-200'
                                }`}
                              />
                            )
                          })}
                        </div>
                        <p className="text-[10px] text-[#8a7a7a] mt-1">
                          Use 8+ characters, mixed uppercase, numbers, and symbols.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1A0A0A] mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={forgotConfirmPw}
                        onChange={(e) => setForgotConfirmPw(e.target.value)}
                        placeholder="Re-enter your new password"
                        required
                        className="w-full h-[50px] px-4 pr-11 bg-white border border-[#D5C9BE] rounded-[10px] text-[14px] text-[#000000] focus:outline-none focus:border-[#611a17] focus:ring-2 focus:ring-[#611a17]/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b5b5b] hover:text-[#611a17] cursor-pointer"
                      >
                        {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {forgotNewPw && forgotConfirmPw && forgotNewPw !== forgotConfirmPw && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">Passwords do not match.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotNewPw || forgotNewPw !== forgotConfirmPw}
                    className="w-full h-[50px] bg-[#611a17] text-white font-bold text-[14px] rounded-[10px] hover:bg-[#4e1412] transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50 mt-2"
                  >
                    {forgotLoading ? 'Updating Password...' : 'Save & Reset Password'}
                  </button>
                </form>
              )}

              {/* Step 4: Success Screen */}
              {forgotStep === 4 && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4 text-emerald-900">
                  <div className="flex items-center gap-2.5 font-bold text-emerald-900 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-700" />
                    {forgotSuccessMsg || 'Password successfully updated!'}
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Your password has been securely updated. You can now return to the login screen and sign in.
                  </p>
                  <button
                    type="button"
                    onClick={resetForgotState}
                    className="w-full h-[46px] bg-[#611a17] text-white font-bold text-xs rounded-lg hover:bg-[#4e1412] transition-colors cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
