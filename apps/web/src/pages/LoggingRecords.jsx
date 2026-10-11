import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../context/AppContext'
import { Search, RefreshCw } from 'lucide-react'
import { SkeletonTableRows } from '../components/Skeleton'

const LOG_TYPES = ['All Types', 'Gate Entry', 'Gate Exit', 'Library Entry', 'Library Exit']
const LOCATIONS = ['All Locations', 'Gate 1', 'Gate 2', 'Library']

export default function LoggingRecords() {
  const { role, token } = useApp()
  const isStudent = role === 'student'
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('All Types')
  const [filterLocation, setFilterLocation] = useState('All Locations')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/institutional/logs', {
        headers: {
          'Authorization': 'Bearer ' + (token || localStorage.getItem('issrms_token'))
        }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.logs) {
          setRecords(data.logs)
        }
      }
    } catch (err) {
      console.warn('Failed to load live institutional logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [token])

  const filtered = records.filter(r => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || (r.name && r.name.toLowerCase().includes(q)) || (r.studentId && r.studentId.toLowerCase().includes(q))
    const matchType = filterType === 'All Types' || r.type === filterType
    const matchLocation = filterLocation === 'All Locations' || r.location === filterLocation
    const matchDate = (!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo)
    return matchSearch && matchType && matchLocation && matchDate
  })

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif-sjsm" style={{ color: '#1A0A0A' }}>
              {isStudent ? 'My Logging Records' : 'Institutional Logging Records'}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: '#6B5B5B' }}>
              {isStudent ? 'Gate entry, gate exit, library entry, and library exit records' : 'Student gate entry, gate exit, library entry, and library exit records'}
            </p>
          </div>
          <button 
            onClick={loadLogs}
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
              placeholder={isStudent ? "Search my logs…" : "Search by student name or ID…"}
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
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
            {LOG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#EDE0D4] shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: '#FBF6EE', borderBottom: '1px solid #EDE0D4' }}>
                {!isStudent && <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#6B5B5B]">Student</th>}
                {!isStudent && <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#6B5B5B]">ID Number</th>}
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#6B5B5B]">Log Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#6B5B5B]">Location</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#6B5B5B]">Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#6B5B5B]">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0D4]">
              {loading ? (
                <SkeletonTableRows rows={8} cols={isStudent ? 4 : 6} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isStudent ? 4 : 6} className="px-4 py-12 text-center text-[#9B8B8B] font-semibold text-xs">
                    No logging records match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[#FBF6EE] transition-colors">
                    {!isStudent && <td className="px-4 py-3 font-semibold text-[#1A0A0A]">{r.name}</td>}
                    {!isStudent && <td className="px-4 py-3 font-mono text-[#9B8B8B]">{r.studentId}</td>}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.type === 'Gate Entry' ? 'bg-green-50 text-[#4A7C59] border-green-200' :
                        r.type === 'Gate Exit' ? 'bg-red-50 text-[#991B1B] border-red-200' :
                        r.type === 'Library Entry' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>{r.type}</span>
                    </td>
                    <td className="px-4 py-3 text-[#6B5B5B]">{r.location}</td>
                    <td className="px-4 py-3 text-[#6B5B5B]">{r.date}</td>
                    <td className="px-4 py-3 font-bold text-[#1A0A0A]">{r.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
