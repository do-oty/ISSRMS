import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Search, Eye, Shield, RefreshCw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SkeletonTableRows } from '../components/Skeleton'

function roleColor(r) {
  if (r === 'Administrator') return 'maroon'
  if (r === 'Registrar') return 'green'
  if (r === 'Canteen Personnel') return 'amber'
  if (r === 'Library Personnel') return 'blue'
  if (r === 'Student/Parent') return 'purple'
  if (r === 'System') return 'gray'
  return 'gray'
}

function Badge({ children, color }) {
  const map = {
    green:  'bg-green-50 text-[#4A7C59] border-green-200',
    red:    'bg-red-50 text-[#991B1B] border-red-200',
    amber:  'bg-amber-50 text-amber-700 border-amber-200',
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gray:   'bg-gray-50 text-[#6B5B5B] border-gray-200',
    gold:   'bg-[#FBF6EE] text-[#A88020] border-[#EDE0D4]',
    maroon: 'bg-maroon-50 text-[#6B1A1A] border-maroon-200',
  }
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[color] || map.gray}`}>{children}</span>
}

function resultColor(r) {
  if (r === 'Success') return 'green'
  if (r === 'Failed' || r === 'Rejected') return 'red'
  if (r === 'Denied') return 'amber'
  if (r === 'Rolled Back') return 'purple'
  return 'gray'
}

export default function AuditLogs() {
  const { token } = useApp()
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('All')
  const [filterModule, setFilterModule] = useState('All')
  const [filterAction, setFilterAction] = useState('All')
  const [filterResult, setFilterResult] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [selectedAudit, setSelectedAudit] = useState(null)

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/audit-logs', {
        headers: {
          'Authorization': 'Bearer ' + (token || localStorage.getItem('issrms_token'))
        }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.logs) {
          setAuditLogs(data.logs)
        }
      }
    } catch (err) {
      console.warn('Failed to load live audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [token])

  const allRoles = ['All', ...new Set(auditLogs.map(a => a.role))]
  const allModules = ['All', ...new Set(auditLogs.map(a => a.module))]
  const allActions = ['All', ...new Set(auditLogs.map(a => a.action))]
  const results = ['All', ...new Set(auditLogs.map(a => a.result).filter(Boolean))]

  const filtered = auditLogs.filter(a => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || a.actor.toLowerCase().includes(q) || a.actorId.toLowerCase().includes(q) || (a.target || '').toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    const matchRole = filterRole === 'All' || a.role === filterRole
    const matchModule = filterModule === 'All' || a.module === filterModule
    const matchAction = filterAction === 'All' || a.action === filterAction
    const matchResult = filterResult === 'All' || a.result === filterResult
    const matchDate = (!dateFrom || a.timestamp >= dateFrom) && (!dateTo || a.timestamp <= dateTo + 'T23:59:59')
    return matchSearch && matchRole && matchModule && matchAction && matchResult && matchDate
  })

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif-sjsm" style={{ color: '#1A0A0A' }}>Audit Logs</h2>
            <p className="text-sm mt-0.5" style={{ color: '#6B5B5B' }}>Immutable system-wide audit trail — Administrator access only</p>
          </div>
          <button 
            onClick={loadAuditLogs}
            disabled={loading}
            className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#6B1A1A] hover:bg-[#FBF6EE]"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh Logs
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-[#EDE0D4] flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
            <input
              placeholder="Search by actor, ID, target, or reference…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="inp w-full pl-8 pr-3 py-2 text-xs font-semibold"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-[10px] text-[#6B5B5B]">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="inp px-2 py-1.5 text-xs" />
            <label className="text-[10px] text-[#6B5B5B]">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="inp px-2 py-1.5 text-xs" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
            {allRoles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
          </select>
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
            {allModules.map(m => <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>)}
          </select>
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
            {allActions.map(a => <option key={a} value={a}>{a === 'All' ? 'All Actions' : a}</option>)}
          </select>
          <select value={filterResult} onChange={e => setFilterResult(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
            {results.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#EDE0D4] shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: '#FBF6EE', borderBottom: '1px solid #EDE0D4' }}>
                {['Timestamp', 'Actor', 'Role', 'Module', 'Action', 'Target / Ref', 'Amount', 'Result', 'Reason / Notes', 'Details'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-[#6B5B5B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0D4]">
              {loading ? (
                <SkeletonTableRows rows={8} cols={10} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-[#9B8B8B] font-semibold text-xs">
                    No audit events match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map(a => (
                <tr key={a.id} className="hover:bg-[#FBF6EE] transition-colors">
                  <td className="px-3 py-3 text-[#6B5B5B] whitespace-nowrap">{a.timestamp.replace('T', ' ')}</td>
                  <td className="px-3 py-3 font-semibold text-[#1A0A0A]">{a.actor}</td>
                  <td className="px-3 py-3"><Badge color={roleColor(a.role)}>{a.role}</Badge></td>
                  <td className="px-3 py-3 text-[#6B5B5B]">{a.module}</td>
                  <td className="px-3 py-3 font-semibold text-[#1A0A0A]">{a.action}</td>
                  <td className="px-3 py-3 font-mono text-[10px] text-[#9B8B8B]">{a.target || '—'}</td>
                  <td className="px-3 py-3 font-bold" style={{ color: a.amount != null ? (a.amount >= 0 ? '#4A7C59' : '#991B1B') : '#9B8B8B' }}>
                    {a.amount != null ? `₱ ${a.amount.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-3"><Badge color={resultColor(a.result)}>{a.result}</Badge></td>
                  <td className="px-3 py-3 text-[#6B5B5B] max-w-[160px] truncate">{a.reason || '—'}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => setSelectedAudit(a)} className="p-1.5 rounded-lg text-[#6B1A1A] hover:bg-[#FBF6EE] transition-colors" title="View Details">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAudit(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EDE0D4] animate-fade-in w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-7 py-5 flex items-center justify-between" style={{ background: '#3A0A0A', borderBottom: '3px solid #C8A227' }}>
              <div>
                <h3 className="font-serif-sjsm font-bold text-lg text-white">Audit Event Details</h3>
                <p className="text-[11px] text-white/60 mt-0.5">{selectedAudit.id}</p>
              </div>
              <button onClick={() => setSelectedAudit(null)} className="text-white/50 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <div className="p-7 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-[#9B8B8B]">Audit Event ID</p>
                  <p className="font-mono font-bold text-[#1A0A0A]">{selectedAudit.id}</p>
                </div>
                <Badge color="gold">
                  <Shield size={10} /> System Record
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[#EDE0D4] pt-4">
                {[
                  { label: 'Timestamp', value: selectedAudit.timestamp.replace('T', ' ') },
                  { label: 'Actor', value: selectedAudit.actor },
                  { label: 'Account ID', value: selectedAudit.actorId, mono: true },
                  { label: 'Role', value: selectedAudit.role },
                  { label: 'Module', value: selectedAudit.module },
                  { label: 'Action', value: selectedAudit.action },
                  { label: 'Target Record', value: selectedAudit.target || 'N/A', mono: !!selectedAudit.target },
                  { label: 'Amount', value: selectedAudit.amount != null ? `₱ ${selectedAudit.amount.toFixed(2)}` : 'N/A' },
                  { label: 'Reason', value: selectedAudit.reason || 'N/A' },
                  { label: 'Result', value: selectedAudit.result },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-0.5">{f.label}</p>
                    <p className={`font-semibold text-[#1A0A0A] ${f.mono ? 'font-mono' : ''}`}>{f.value}</p>
                  </div>
                ))}
              </div>
              {selectedAudit.before && (
                <div className="border-t border-[#EDE0D4] pt-4">
                  <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-1">Before</p>
                  <p className="text-xs font-mono bg-[#FBF6EE] p-2 rounded-lg text-[#6B5B5B]">{selectedAudit.before}</p>
                </div>
              )}
              {selectedAudit.after && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#9B8B8B] mb-1">After</p>
                  <p className="text-xs font-mono bg-[#FBF6EE] p-2 rounded-lg text-[#6B5B5B]">{selectedAudit.after}</p>
                </div>
              )}
              <div className="flex justify-end pt-4 border-t border-[#EDE0D4]">
                <button onClick={() => setSelectedAudit(null)} className="btn-primary px-5 py-2.5 text-xs font-bold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
