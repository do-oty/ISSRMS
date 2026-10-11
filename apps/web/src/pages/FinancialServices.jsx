import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import {
  Search, ArrowUpCircle, RotateCcw,
  BookMarked, AlertTriangle, Check, Settings2, RefreshCw
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SkeletonCard, SkeletonTableRows, SkeletonBox } from '../components/Skeleton'

function Badge({ children, color }) {
  const map = {
    green: 'bg-green-50 text-[#4A7C59] border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red:   'bg-red-50 text-[#991B1B] border-red-200',
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    gray:  'bg-gray-50 text-[#6B5B5B] border-gray-200',
    gold:  'bg-[#FBF6EE] text-[#A88020] border-[#EDE0D4]',
  }
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[color] || map.gray}`}>{children}</span>
}

const TAB_COLORS = {
  topup: 'green', settlement: 'blue', credit_limit: 'gold', adjustment: 'amber', reversal: 'red', purchase: 'gray'
}

export default function FinancialServices() {
  const { token } = useApp()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchId, setSearchId] = useState('STU-2026-0891')
  const [lookedUpId, setLookedUpId] = useState('STU-2026-0891')
  const [student, setStudent] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [circulation, setCirculation] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [topUpAmount, setTopUpAmount] = useState('')
  const [showTopUpConfirm, setShowTopUpConfirm] = useState(false)

  const [newCreditLimit, setNewCreditLimit] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [showCreditConfirm, setShowCreditConfirm] = useState(false)

  const [settlementRef, setSettlementRef] = useState('')
  const [settlementNotes, setSettlementNotes] = useState('')
  const [showSettlementConfirm, setShowSettlementConfirm] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const loadStudentData = async (studentId) => {
    if (!studentId) return
    setLoading(true)
    try {
      // 1. Fetch live wallet & identity details
      const wRes = await fetch(`http://localhost:5000/api/v1/canteen/wallet/${encodeURIComponent(studentId)}`)
      if (wRes.ok) {
        const wData = await wRes.json()
        setWallet(wData.wallet)
        setStudent(wData.student || { id: studentId, name: studentId, gradeLevel: 'Grade 10', section: 'St. Francis' })
        setTransactions(wData.transactions || [])
        setLookedUpId(studentId)
      } else {
        setSuccessMsg(`Student account "${studentId}" was not found.`)
        setWallet(null)
        setStudent(null)
        setTransactions([])
        setLookedUpId(null)
      }

      // 2. Fetch circulation fines from MySQL
      const authToken = token || localStorage.getItem('issrms_token')
      if (authToken) {
        const circRes = await fetch('http://localhost:5000/api/v1/library/circulation', {
          headers: { 'Authorization': 'Bearer ' + authToken }
        })
        if (circRes.ok) {
          const circData = await circRes.json()
          if (circData.loans) {
            const studentLoans = circData.loans
              .filter(l => l.studentId?.toUpperCase() === studentId.toUpperCase())
              .map(l => ({
                id: `CIR-${l.id}`,
                title: l.bookTitle,
                borrowDate: l.borrowDate ? String(l.borrowDate).slice(0, 10) : '',
                dueDate: l.dueDate ? String(l.dueDate).slice(0, 10) : '',
                returnDate: l.returnDate ? String(l.returnDate).slice(0, 10) : null,
                fineAssessed: Number(l.fine || 0),
                fineStatus: (l.fineStatus || 'none').toLowerCase(),
                daysOverdue: Math.max(0, Math.floor((Date.now() - new Date(l.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
              }))
            setCirculation(studentLoans)
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load student financial profile:', err)
      setSuccessMsg('Error loading records: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudentData('STU-2026-0891')
  }, [])

  const doLookup = (e) => {
    e.preventDefault()
    if (!searchId.trim()) return
    setSuccessMsg('')
    loadStudentData(searchId.trim().toUpperCase())
  }

  const handleTopUp = async () => {
    const amt = parseFloat(topUpAmount)
    if (isNaN(amt) || amt <= 0 || !lookedUpId) return

    setSubmitting(true)
    try {
      const authToken = token || localStorage.getItem('issrms_token')
      const res = await fetch('http://localhost:5000/api/v1/canteen/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
          student_id: lookedUpId,
          amount: amt,
          reference: `FIN-TOP-${Date.now().toString().slice(-6)}`
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Top-up failed')

      setSuccessMsg(`Top-up of ₱${amt.toFixed(2)} completed successfully. Ref: ${data.reference || data.transaction_code}`)
      setTopUpAmount('')
      setShowTopUpConfirm(false)
      loadStudentData(lookedUpId)
    } catch (err) {
      setSuccessMsg('Top-up failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreditLimitChange = async () => {
    const limit = parseFloat(newCreditLimit)
    if (isNaN(limit) || limit < 0 || !creditReason.trim() || !lookedUpId) return

    setSubmitting(true)
    try {
      const authToken = token || localStorage.getItem('issrms_token')
      const res = await fetch('http://localhost:5000/api/v1/finance/credit-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
          student_id: lookedUpId,
          new_credit_limit: limit,
          reason: creditReason
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update credit limit')

      setSuccessMsg(`Credit limit updated to ₱${limit.toFixed(2)} for ${student.name}.`)
      setNewCreditLimit('')
      setCreditReason('')
      setShowCreditConfirm(false)
      loadStudentData(lookedUpId)
    } catch (err) {
      setSuccessMsg('Update failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSettlement = async () => {
    if (!settlementRef.trim() || !settlementNotes.trim() || !lookedUpId) return

    setSubmitting(true)
    try {
      const authToken = token || localStorage.getItem('issrms_token')
      const res = await fetch('http://localhost:5000/api/v1/finance/settle-to-zero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
          student_id: lookedUpId,
          official_receipt_ref: settlementRef.trim(),
          notes: settlementNotes.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Settlement failed')

      setSuccessMsg(`Settle-to-Zero completed! Outstanding credit of ₱${Number(data.settled_amount || 0).toFixed(2)} cleared. OR: ${settlementRef}`)
      setSettlementRef('')
      setSettlementNotes('')
      setShowSettlementConfirm(false)
      loadStudentData(lookedUpId)
    } catch (err) {
      setSuccessMsg('Settlement failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const creditTrans = transactions.filter(t => t.type === 'purchase' && (Number(t.creditPortion) || 0) > 0)

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif-sjsm" style={{ color: '#1A0A0A' }}>Financial Services</h2>
            <p className="text-sm mt-0.5" style={{ color: '#6B5B5B' }}>Wallet ledger management, credit limits, Settle-to-Zero clearance, and transaction oversight</p>
          </div>
          {lookedUpId && (
            <button 
              onClick={() => loadStudentData(lookedUpId)} 
              disabled={loading}
              className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#6B1A1A] hover:bg-[#FBF6EE]"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh Ledger
            </button>
          )}
        </div>

        {/* Lookup Bar */}
        <form onSubmit={doLookup} className="bg-white rounded-2xl p-5 border border-[#EDE0D4] shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
              <input 
                type="text" 
                value={searchId} 
                onChange={e => setSearchId(e.target.value)}
                placeholder="Enter student ID (e.g. STU-2026-0891)"
                className="inp w-full pl-9 pr-4 py-2.5 text-sm font-mono font-semibold" 
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 text-sm font-bold flex items-center gap-2">
              <Search size={14} /> {loading ? 'Searching…' : 'Look Up Student'}
            </button>
          </div>
          <p className="text-[10px] text-[#9B8B8B] mt-2">Institutional Double-Entry Ledger System</p>
        </form>

        {successMsg && (
          <div className={`p-4 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in ${successMsg.includes('failed') || successMsg.includes('not found') || successMsg.includes('Error') ? 'bg-red-50 text-[#991B1B] border border-red-200' : 'bg-green-50 text-[#4A7C59] border border-green-200'}`}>
            <Check size={14} /> {successMsg}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-[#EDE0D4] animate-pulse space-y-2">
                  <div className="h-3 bg-[#EDE0D4] rounded w-2/3" />
                  <div className="h-5 bg-[#EDE0D4] rounded w-1/2" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#EDE0D4] animate-pulse space-y-3">
              <div className="h-4 bg-[#EDE0D4] rounded w-1/4" />
              <div className="h-24 bg-[#EDE0D4]/50 rounded-xl" />
            </div>
          </div>
        ) : lookedUpId && student && wallet && (<>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Student', value: student.name, sub: lookedUpId, color: '#6B1A1A' },
              { label: 'Cash Balance', value: `₱ ${Number(wallet.balance || 0).toFixed(2)}`, color: '#4A7C59' },
              { label: 'Credit Limit', value: `₱ ${Number(wallet.credit_limit || 0).toFixed(2)}`, color: '#B45309' },
              { label: 'Credit Used', value: `₱ ${Number(wallet.credit_used || 0).toFixed(2)}`, color: '#991B1B' },
              { label: 'Available Credit', value: `₱ ${Number(wallet.available_credit || 0).toFixed(2)}`, color: '#A88020' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#EDE0D4] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B8B8B]">{s.label}</p>
                <p className="text-lg font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                {s.sub && <p className="text-[10px] font-mono text-[#9B8B8B] mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#EDE0D4] gap-4">
            {[
              { key: 'overview', label: 'Wallet Overview' },
              { key: 'topup',    label: 'Cash Top-Up' },
              { key: 'credit',   label: 'Credit Management' },
              { key: 'history',  label: 'Transaction History' },
              { key: 'library',  label: 'Library Dues' },
            ].map(t => (
              <button 
                key={t.key} 
                onClick={() => { setActiveTab(t.key); setSuccessMsg('') }}
                className={`pb-2 text-sm font-semibold transition-colors ${activeTab === t.key ? 'border-b-2 border-[#C8A227] text-[#6B1A1A]' : 'text-[#6B5B5B]'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl p-6 border border-[#EDE0D4] shadow-sm">
              <h3 className="font-serif-sjsm font-bold text-base mb-4 text-[#1A0A0A]">Outstanding Canteen Credit Activity</h3>
              {creditTrans.length === 0 ? (
                <p className="text-xs text-[#9B8B8B] py-6 text-center">No outstanding credit-funded purchases for this student.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: '#FBF6EE', borderBottom: '1px solid #EDE0D4' }}>
                        {['Date', 'Sale Ref', 'Total Amount', 'Cash Paid', 'Credit Incurred', 'Processed By'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-[#6B5B5B]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE0D4]">
                      {creditTrans.map(t => (
                        <tr key={t.ref} className="hover:bg-[#FBF6EE]">
                          <td className="px-3 py-3 text-[#6B5B5B]">{new Date(t.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                          <td className="px-3 py-3 font-mono text-[10px] text-[#9B8B8B]">{t.ref}</td>
                          <td className="px-3 py-3 font-bold">₱ {Number(t.amount || 0).toFixed(2)}</td>
                          <td className="px-3 py-3 text-[#4A7C59] font-bold">₱ {Number(t.cashPortion || 0).toFixed(2)}</td>
                          <td className="px-3 py-3 text-[#991B1B] font-bold">₱ {Number(t.creditPortion || 0).toFixed(2)}</td>
                          <td className="px-3 py-3 text-[#6B5B5B]">{t.operator || 'Canteen Register'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TOP-UP ── */}
          {activeTab === 'topup' && (
            <div className="bg-white rounded-2xl p-6 border border-[#EDE0D4] shadow-sm max-w-lg space-y-4">
              <h3 className="font-serif-sjsm font-bold text-base text-[#1A0A0A]">Cash Wallet Top-Up</h3>
              <p className="text-xs text-[#6B5B5B]">Process an over-the-counter physical cash deposit for <span className="font-bold text-[#1A0A0A]">{student.name}</span></p>
              <div>
                <label className="block text-xs font-bold uppercase text-[#6B5B5B] mb-1.5">Cash Amount (₱)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={topUpAmount} 
                  onChange={e => setTopUpAmount(e.target.value)}
                  className="inp w-full px-4 py-2.5 text-sm font-bold" 
                  placeholder="200.00" 
                />
              </div>
              <button 
                onClick={() => { const a = parseFloat(topUpAmount); if (!isNaN(a) && a > 0) setShowTopUpConfirm(true) }}
                className="btn-primary px-6 py-2.5 text-sm font-bold flex items-center gap-2"
              >
                <ArrowUpCircle size={15} /> Process Top-Up
              </button>
              {showTopUpConfirm && (
                <div className="p-4 rounded-xl bg-[#FBF6EE] border border-[#EDE0D4] space-y-3">
                  <p className="text-xs font-bold text-[#1A0A0A]">Confirm cash top-up of ₱{parseFloat(topUpAmount || 0).toFixed(2)}?</p>
                  <p className="text-[10px] text-[#6B5B5B]">Projected balance: ₱{(Number(wallet.balance) + parseFloat(topUpAmount || 0)).toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button onClick={handleTopUp} disabled={submitting} className="btn-primary px-4 py-2 text-xs font-bold">
                      {submitting ? 'Posting…' : 'Confirm & Post'}
                    </button>
                    <button onClick={() => setShowTopUpConfirm(false)} className="btn-outline px-4 py-2 text-xs font-bold">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CREDIT MANAGEMENT ── */}
          {activeTab === 'credit' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-[#EDE0D4] shadow-sm space-y-4">
                <h3 className="font-serif-sjsm font-bold text-base text-[#1A0A0A]">Manage Credit Limit</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#6B5B5B]">Current Approved Limit:</span>
                  <span className="text-lg font-bold text-[#B45309]">₱ {Number(wallet.credit_limit || 0).toFixed(2)}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5B5B] mb-1.5">New Credit Limit (₱)</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={newCreditLimit} 
                    onChange={e => setNewCreditLimit(e.target.value)}
                    className="inp w-full px-4 py-2.5 text-sm font-bold" 
                    placeholder="500.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5B5B] mb-1.5">Official Reason (required for audit trail)</label>
                  <input 
                    type="text" 
                    value={creditReason} 
                    onChange={e => setCreditReason(e.target.value)}
                    className="inp w-full px-4 py-2.5 text-sm" 
                    placeholder="e.g. Parental approval / Senior High student policy" 
                  />
                </div>
                <button 
                  onClick={() => { const l = parseFloat(newCreditLimit); if (!isNaN(l) && l >= 0 && creditReason.trim()) setShowCreditConfirm(true) }}
                  className="btn-primary px-6 py-2.5 text-sm font-bold flex items-center gap-2"
                >
                  <Settings2 size={15} /> Update Credit Limit
                </button>
                {showCreditConfirm && (
                  <div className="p-4 rounded-xl bg-[#FBF6EE] border border-[#EDE0D4] space-y-2">
                    <p className="text-xs font-bold text-[#1A0A0A]">Authorize new limit of ₱{parseFloat(newCreditLimit || 0).toFixed(2)}?</p>
                    <div className="flex gap-2">
                      <button onClick={handleCreditLimitChange} disabled={submitting} className="btn-primary px-4 py-2 text-xs font-bold">
                        {submitting ? 'Updating…' : 'Yes, Update'}
                      </button>
                      <button onClick={() => setShowCreditConfirm(false)} className="btn-outline px-4 py-2 text-xs font-bold">Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settle-to-Zero Clearance */}
              <div className="bg-white rounded-2xl p-6 border border-[#EDE0D4] shadow-sm space-y-4">
                <h3 className="font-serif-sjsm font-bold text-base text-[#1A0A0A]">Settle-to-Zero Clearance</h3>
                <p className="text-xs text-[#6B5B5B]">Outstanding Credit Balance: <span className="font-bold text-[#991B1B]">₱ {Number(wallet.credit_used || 0).toFixed(2)}</span></p>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5B5B] mb-1.5">Official Receipt (OR) Number</label>
                  <input 
                    type="text" 
                    value={settlementRef} 
                    onChange={e => setSettlementRef(e.target.value)}
                    className="inp w-full px-4 py-2.5 text-sm font-mono" 
                    placeholder="e.g. OR-2026-9041" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5B5B] mb-1.5">Cashier / Registrar Clearance Notes</label>
                  <input 
                    type="text" 
                    value={settlementNotes} 
                    onChange={e => setSettlementNotes(e.target.value)}
                    className="inp w-full px-4 py-2.5 text-sm" 
                    placeholder="Full clearance payment received at Cashier Office"
                  />
                </div>
                <button 
                  onClick={() => { if (settlementRef.trim() && settlementNotes.trim()) setShowSettlementConfirm(true) }}
                  disabled={Number(wallet.credit_used || 0) <= 0}
                  className={`px-6 py-2.5 text-sm font-bold flex items-center gap-2 rounded-lg ${Number(wallet.credit_used || 0) <= 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                >
                  <Check size={15} /> Execute Settle-to-Zero
                </button>
                {showSettlementConfirm && (
                  <div className="p-4 rounded-xl bg-[#FBF6EE] border border-[#EDE0D4] space-y-2">
                    <p className="text-xs font-bold text-[#1A0A0A]">Confirm payment of ₱{Number(wallet.credit_used).toFixed(2)} and reset debt to zero?</p>
                    <div className="flex gap-2">
                      <button onClick={handleSettlement} disabled={submitting} className="btn-primary px-4 py-2 text-xs font-bold">
                        {submitting ? 'Clearing…' : 'Yes, Confirm Settle-to-Zero'}
                      </button>
                      <button onClick={() => setShowSettlementConfirm(false)} className="btn-outline px-4 py-2 text-xs font-bold">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TRANSACTION HISTORY ── */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl border border-[#EDE0D4] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#EDE0D4]">
                <h3 className="font-serif-sjsm font-bold text-base text-[#1A0A0A]">Double-Entry Financial Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: '#FBF6EE', borderBottom: '1px solid #EDE0D4' }}>
                      {['Reference Code', 'Type', 'Amount', 'Date & Time', 'Cashier / Operator', 'Status'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-[#6B5B5B]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE0D4]">
                    {transactions.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-[#9B8B8B] font-semibold text-xs">No transactions recorded for this student.</td></tr>
                    )}
                    {transactions.map(t => (
                      <tr key={t.ref} className="hover:bg-[#FBF6EE]">
                        <td className="px-3 py-3 font-mono text-[10px] text-[#9B8B8B]">{t.ref}</td>
                        <td className="px-3 py-3"><Badge color={TAB_COLORS[t.type] || 'gray'}>{t.type}</Badge></td>
                        <td className="px-3 py-3 font-bold" style={{ color: t.type === 'topup' ? '#4A7C59' : '#1A0A0A' }}>
                          ₱ {Number(t.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-[#6B5B5B]">{new Date(t.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="px-3 py-3 text-[#6B5B5B]">{t.operator || 'System Ledger'}</td>
                        <td className="px-3 py-3"><Badge color="green">Posted</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── LIBRARY DUES ── */}
          {activeTab === 'library' && (
            <div className="bg-white rounded-2xl p-6 border border-[#EDE0D4] shadow-sm space-y-4">
              <h3 className="font-serif-sjsm font-bold text-base text-[#1A0A0A] flex items-center gap-2">
                <BookMarked size={16} /> Library Dues & Clearance Status — {student.name}
              </h3>
              {circulation.length === 0 ? (
                <p className="text-xs text-[#4A7C59] py-4">No active or overdue library circulation loans found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: '#FBF6EE', borderBottom: '1px solid #EDE0D4' }}>
                        {['Book Title', 'Loan Reference', 'Borrow Date', 'Due Date', 'Status', 'Overdue Days', 'Fine Due'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-[#6B5B5B]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE0D4]">
                      {circulation.map(c => (
                        <tr key={c.id} className="hover:bg-[#FBF6EE]">
                          <td className="px-3 py-3 font-semibold text-[#1A0A0A]">{c.title}</td>
                          <td className="px-3 py-3 font-mono text-[10px] text-[#9B8B8B]">{c.id}</td>
                          <td className="px-3 py-3 text-[#6B5B5B]">{c.borrowDate}</td>
                          <td className="px-3 py-3 text-[#6B5B5B]">{c.dueDate}</td>
                          <td className="px-3 py-3">
                            <Badge color={c.returnDate ? 'green' : (c.daysOverdue > 0 ? 'red' : 'blue')}>
                              {c.returnDate ? 'Returned' : (c.daysOverdue > 0 ? 'Overdue' : 'Active')}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 font-bold" style={{ color: c.daysOverdue > 0 ? '#991B1B' : '#6B5B5B' }}>
                            {c.daysOverdue > 0 ? `${c.daysOverdue} days` : '0 days'}
                          </td>
                          <td className="px-3 py-3 font-bold" style={{ color: c.fineAssessed > 0 ? '#991B1B' : '#4A7C59' }}>
                            ₱ {c.fineAssessed.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="p-3 rounded-xl bg-[#FBF6EE] border border-[#EDE0D4] text-xs text-[#6B5B5B] flex items-center gap-2">
                <AlertTriangle size={14} className="text-[#A88020] shrink-0" />
                <span>Overdue fines are governed by Library Circulation rules. All fine payments must be cleared before graduation clearance.</span>
              </div>
            </div>
          )}
        </>)}

        {!lookedUpId && (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#EDE0D4] shadow-sm">
            <Search size={30} className="mx-auto text-[#EDE0D4] mb-3" />
            <p className="font-semibold text-sm text-[#1A0A0A]">Look up a student to begin</p>
            <p className="text-xs text-[#9B8B8B] mt-1">Enter a student ID to view wallet details, top up, manage credit, and review transactions.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
