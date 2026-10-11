import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Pin, Plus, Edit3, Power, Search, RefreshCw, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SkeletonCard } from '../components/Skeleton'

const catStyle = {
  Academic:       { bg: 'rgba(107,26,26,0.08)', text: '#6B1A1A' },
  Administrative: { bg: 'rgba(107,26,26,0.05)', text: '#4A1010' },
  Event:          { bg: 'rgba(200,162,39,0.14)', text: '#A88020' },
  General:        { bg: 'rgba(74,124,89,0.10)', text: '#4A7C59' }
}

export default function Announcements() {
  const { role, token } = useApp()
  const isAdmin = role === 'admin'

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formCategory, setFormCategory] = useState('Academic')
  const [formPinned, setFormPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/announcements')
      if (res.ok) {
        const data = await res.json()
        if (data.announcements) {
          setAnnouncements(data.announcements.map(a => ({
            id: a.id,
            category: a.category || 'Administrative',
            title: a.title,
            body: a.content,
            date: a.date || 'Recently',
            pinned: Boolean(a.isPinned),
            active: a.status === 'Active',
            author: a.author || 'Administrator'
          })))
        }
      }
    } catch (err) {
      console.warn('Failed to load live announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const filtered = announcements
    .filter(a => {
      const ms = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.body.toLowerCase().includes(searchQuery.toLowerCase())
      const mc = catFilter === 'All' || a.category === catFilter
      const mst = statusFilter === 'all' || (statusFilter === 'active' && a.active) || (statusFilter === 'inactive' && !a.active)
      return ms && mc && mst
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  const openCreate = () => {
    setFormTitle('')
    setFormBody('')
    setFormCategory('Academic')
    setFormPinned(false)
    setStatusMsg('')
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formTitle.trim() || !formBody.trim()) return

    setSubmitting(true)
    setStatusMsg('')
    try {
      const authToken = token || localStorage.getItem('issrms_token')
      const res = await fetch('http://localhost:5000/api/v1/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          content: formBody.trim(),
          category: formCategory,
          is_pinned: formPinned
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to publish announcement')

      setStatusMsg('Announcement successfully published!')
      setShowModal(false)
      loadAnnouncements()
    } catch (err) {
      setStatusMsg('Publishing error: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (id) => {
    try {
      const authToken = token || localStorage.getItem('issrms_token')
      const res = await fetch(`http://localhost:5000/api/v1/announcements/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + authToken
        }
      })
      if (res.ok) {
        loadAnnouncements()
      }
    } catch (err) {
      console.warn('Failed to toggle status:', err)
    }
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif-sjsm" style={{ color: '#1A0A0A' }}>Institutional Announcements</h2>
            <p className="text-sm mt-0.5" style={{ color: '#6B5B5B' }}>Official campus circulars, academic notices, and student bulletins</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={loadAnnouncements}
              disabled={loading}
              className="btn-outline flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#6B1A1A] hover:bg-[#FBF6EE]"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            {isAdmin && (
              <button 
                onClick={openCreate} 
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-bold shadow-sm"
              >
                <Plus size={15} /> New Announcement
              </button>
            )}
          </div>
        </div>

        {statusMsg && (
          <div className={`p-4 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in ${statusMsg.includes('error') ? 'bg-red-50 text-[#991B1B] border border-red-200' : 'bg-green-50 text-[#4A7C59] border border-green-200'}`}>
            <Check size={14} /> {statusMsg}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
            <input 
              placeholder="Search announcements…" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="inp w-full pl-8 pr-3 py-2 text-xs font-semibold" 
            />
          </div>
          <div className="flex gap-1.5">
            {['All', 'Academic', 'Event', 'Administrative'].map(c => (
              <button 
                key={c} 
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${catFilter === c ? 'bg-[#6B1A1A] text-white border-[#6B1A1A]' : 'border-[#EDE0D4] text-[#6B5B5B] bg-white hover:border-[#6B1A1A]'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
            <option value="active">Active Only</option>
            <option value="inactive">Archived Only</option>
            <option value="all">All Statuses</option>
          </select>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            {/* Pinned Announcements */}
            {filtered.filter(a => a.pinned).map(ann => {
          const c = catStyle[ann.category] || catStyle.Administrative
          return (
            <div 
              key={ann.id} 
              className="ann-card bg-white rounded-2xl p-5 border-2 border-[#C8A227] shadow-[0_2px_14px_rgba(200,162,39,0.14)] transition-all"
              style={{ opacity: ann.active ? 1 : 0.6 }}
            >
              <div className="flex items-center gap-1.5 mb-3 text-[11px] font-bold" style={{ color: '#A88020' }}>
                <Pin size={11} className="fill-[#C8A227]" /> PINNED ANNOUNCEMENT
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>{ann.category}</span>
                    <span className="text-[10px] text-[#9B8B8B]">{ann.date}</span>
                    <span className="text-[10px] text-[#6B5B5B] font-semibold">Posted by {ann.author}</span>
                    {!ann.active && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-[#991B1B] border-red-200">Archived</span>}
                  </div>
                  <h3 className="font-bold text-sm text-[#1A0A0A]">{ann.title}</h3>
                  <p className="text-xs text-[#6B5B5B] leading-relaxed whitespace-pre-wrap">{ann.body}</p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => toggleActive(ann.id)} 
                      className="p-2 rounded-lg hover:bg-[#FBF6EE] transition-colors"
                      style={{ color: ann.active ? '#4A7C59' : '#9B8B8B' }} 
                      title={ann.active ? 'Archive Announcement' : 'Reactivate Announcement'}
                    >
                      <Power size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Non-Pinned Announcements in Dedicated Scrollbar Container */}
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 scrollbar-thin">
          {filtered.filter(a => !a.pinned).length === 0 && filtered.filter(a => a.pinned).length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#EDE0D4] shadow-sm">
              <p className="font-semibold text-sm text-[#1A0A0A]">No announcements found</p>
              <p className="text-xs text-[#9B8B8B] mt-1">There are no bulletins matching the current filter criteria.</p>
            </div>
          )}
          {filtered.filter(a => !a.pinned).map(ann => {
            const c = catStyle[ann.category] || catStyle.Administrative
            return (
              <div 
                key={ann.id} 
                className="ann-card bg-white rounded-2xl p-5 border border-[#EDE0D4] shadow-sm transition-all"
                style={{ opacity: ann.active ? 1 : 0.6 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>{ann.category}</span>
                      <span className="text-[10px] text-[#9B8B8B]">{ann.date}</span>
                      <span className="text-[10px] text-[#6B5B5B] font-semibold">Posted by {ann.author}</span>
                      {!ann.active && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-50 text-[#991B1B] border-red-200">Archived</span>}
                    </div>
                    <h3 className="font-bold text-sm text-[#1A0A0A]">{ann.title}</h3>
                    <p className="text-xs text-[#6B5B5B] leading-relaxed whitespace-pre-wrap">{ann.body}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => toggleActive(ann.id)} 
                        className="p-2 rounded-lg hover:bg-[#FBF6EE] transition-colors"
                        style={{ color: ann.active ? '#4A7C59' : '#9B8B8B' }} 
                        title={ann.active ? 'Archive Announcement' : 'Reactivate Announcement'}
                      >
                        <Power size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        </>
        )}

        {/* Create Modal - Restricted to Administrator */}
        {showModal && isAdmin && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#EDE0D4] animate-fade-in w-full max-w-lg overflow-hidden">
              <div className="px-7 py-5 flex items-center justify-between" style={{ background: '#3A0A0A', borderBottom: '3px solid #C8A227' }}>
                <div>
                  <h3 className="font-serif-sjsm font-bold text-lg text-white">Publish Official Announcement</h3>
                  <p className="text-[11px] text-white/60 mt-0.5">Saint Joseph School of Mactan — Administrator Access Only</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white text-xl font-bold">&times;</button>
              </div>
              <form onSubmit={handleSave} className="p-7 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6B5B5B] mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Academic', 'Event', 'Administrative'].map(cat => (
                      <button 
                        key={cat} 
                        type="button" 
                        onClick={() => setFormCategory(cat)}
                        className={`py-2 rounded-lg border text-xs font-bold transition-colors ${formCategory === cat ? 'bg-[#6B1A1A] border-[#6B1A1A] text-white' : 'border-[#EDE0D4] text-[#6B5B5B] hover:border-[#6B1A1A]'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6B5B5B] mb-2">Title</label>
                  <input 
                    type="text" 
                    required 
                    value={formTitle} 
                    onChange={e => setFormTitle(e.target.value)} 
                    className="inp w-full px-4 py-2.5 text-sm font-semibold" 
                    placeholder="Official Bulletin Title…" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6B5B5B] mb-2">Content</label>
                  <textarea 
                    required 
                    value={formBody} 
                    onChange={e => setFormBody(e.target.value)} 
                    rows={4} 
                    className="inp w-full px-4 py-2.5 text-sm resize-none" 
                    placeholder="Full announcement body for students and personnel…" 
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formPinned} 
                    onChange={e => setFormPinned(e.target.checked)} 
                    className="rounded text-[#6B1A1A]" 
                  />
                  <span className="text-xs font-semibold text-[#6B5B5B]">Pin this bulletin to the top of Home and Announcements</span>
                </label>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline py-2.5 text-xs font-bold">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary py-2.5 text-xs font-bold text-white" style={{ background: '#6B1A1A' }}>
                    {submitting ? 'Publishing…' : 'Publish Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
