import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { 
  Megaphone, Pin, Plus, X, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, Clock, Award, CheckCircle2, ExternalLink, Settings2, Trash2
} from 'lucide-react'
import { getAvatarUrl, getInitials } from '../utils/avatar'

function getCategoryBadge(cat) {
  if (cat === 'Academic') {
    return 'bg-[#611a17]/10 text-[#611a17] border border-[#611a17]/25'
  }
  if (cat === 'Event') {
    return 'bg-[#c8a227]/15 text-[#916b08] border border-[#c8a227]/30'
  }
  if (cat === 'Administrative') {
    return 'bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/25'
  }
  return 'bg-emerald-50 text-emerald-800 border border-emerald-200'
}

function getGreetingName(fullName) {
  if (!fullName) return 'User'
  const clean = fullName.replace(/^(Dr\.|Dr|Ms\.|Ms|Mr\.|Mr|Mrs\.|Mrs|Bro\.|Bro|Fr\.|Fr|Rev\.|Engr\.|Atty\.|Sister|Brother)\s+/i, '').trim()
  return clean.split(' ')[0] || 'User'
}

function MiniCalendar({ events = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)) // October 2026

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const days = []
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push({ day: d, isCurrentMonth: true })
  }
  const remaining = 35 - days.length
  for (let d = 1; d <= (remaining > 0 ? remaining : 0); d++) {
    days.push({ day: d, isCurrentMonth: false })
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // Dynamically calculate if date d has an active scheduled event in currentMonth
  const isEventDay = (d) => {
    const curDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return events.some(e => {
      const start = e.startDate
      const end = e.endDate || e.startDate
      return curDateStr >= start && curDateStr <= end
    })
  }
  const isToday = (d) => year === 2026 && month === 9 && d === 11

  return (
    <div className="w-full bg-white rounded-2xl border border-[#EDE0D4] p-5 shadow-sm space-y-3">
      {/* Month & Nav Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold text-[#1A0A0A]">
            {monthNames[month]} {year}
          </h4>
          <p className="text-[10px] text-[#A88020] font-semibold">Academic Term Calendar</p>
        </div>
        <div className="flex items-center gap-1">
          <button 
            type="button" 
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg hover:bg-[#FBF6EE] flex items-center justify-center text-[#6B5B5B] hover:text-[#611a17] transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft size={14} />
          </button>
          <button 
            type="button" 
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg hover:bg-[#FBF6EE] flex items-center justify-center text-[#6B5B5B] hover:text-[#611a17] transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 text-center font-bold text-[10px] text-[#9B8B8B] uppercase">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, idx) => (
          <span key={idx} className="py-1">{w}</span>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((item, idx) => {
          const hasEvent = item.isCurrentMonth && isEventDay(item.day)
          const today = item.isCurrentMonth && isToday(item.day)
          return (
            <div
              key={idx}
              className={`relative h-8 flex flex-col items-center justify-center rounded-lg text-xs transition-colors cursor-pointer select-none ${
                !item.isCurrentMonth ? 'text-[#D5C7C7]' :
                today ? 'bg-[#611a17] text-white font-bold shadow-sm' :
                hasEvent ? 'bg-[#c8a227]/15 text-[#1A0A0A] font-bold hover:bg-[#c8a227]/25' :
                'text-[#1A0A0A] hover:bg-[#FBF6EE]'
              }`}
            >
              <span>{item.day}</span>
            </div>
          )
        })}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#EDE0D4] text-[10px] text-[#6B5B5B]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#611a17]" />
          <span>Today (Oct 11)</span>
        </div>
        <div className="text-[10px] text-[#A88020] font-semibold">
          Academic Year 2026–2027
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { role, currentUser, token } = useApp()
  const [selectedCat, setSelectedCat] = useState('All')
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  // Academic Events Management State
  const [events, setEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventCategory, setEventCategory] = useState('Academic')
  const [eventStartDate, setEventStartDate] = useState('2026-10-15')
  const [eventEndDate, setEventEndDate] = useState('2026-10-20')
  const [submittingEvent, setSubmittingEvent] = useState(false)

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:5000/api/v1/announcements')
      if (res.ok) {
        const data = await res.json()
        if (data.announcements && data.announcements.length > 0) {
          setAnnouncements(data.announcements)
        }
      }
    } catch (err) {
      console.warn('Failed to load live announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/events')
      if (res.ok) {
        const data = await res.json()
        if (data.events) {
          setEvents(data.events)
        }
      }
    } catch (err) {
      console.warn('Failed to load events:', err)
    }
  }

  useEffect(() => {
    loadAnnouncements()
    loadEvents()
  }, [])

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!eventTitle.trim() || !eventStartDate) return

    setSubmittingEvent(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          category: eventCategory,
          start_date: eventStartDate,
          end_date: eventEndDate || eventStartDate
        })
      })

      if (res.ok) {
        setShowEventModal(false)
        setEventTitle('')
        setEventDescription('')
        setEventCategory('Academic')
        loadEvents()
      }
    } catch (err) {
      console.warn('Failed to schedule event:', err)
    } finally {
      setSubmittingEvent(false)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event from the calendar?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/v1/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      if (res.ok) {
        loadEvents()
      }
    } catch (err) {
      console.warn('Failed to delete event:', err)
    }
  }

  const filteredAnnouncements = announcements.filter(a => {
    if (selectedCat === 'All') return true
    return a.category?.toLowerCase() === selectedCat.toLowerCase()
  })

  const pinnedPost = filteredAnnouncements.find(a => a.isPinned) || announcements.find(a => a.isPinned)
  const normalPosts = filteredAnnouncements.filter(a => a.id !== pinnedPost?.id)

  return (
    <AppShell>
      <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] select-none">
        
        {/* ── Dynamic Greeting Bar (Clean name greeting) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[24px] font-bold text-[#000000] leading-tight">
              Peace and all good, {getGreetingName(currentUser?.name)} ✌️ 
            </h1>
            <p className="text-[15px] font-normal text-[#6b5b5b] mt-1">
              Here’s what’s happening at Saint Joseph School of Mactan.
            </p>
          </div>

          {/* Administrator Action Bar: Manage Announcements Link */}
          {role === 'admin' && (
            <Link
              to="/announcements"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#611a17] hover:bg-[#4e1412] text-white font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Megaphone size={16} />
              <span>Manage Announcements</span>
            </Link>
          )}
        </div>

        {/* ── Two Column Layout (Left: Announcements | Right: Calendar & Events) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[778px_404px] gap-8 justify-between items-start">
          
          {/* ── LEFT COLUMN: Announcements ── */}
          <div className="w-full space-y-5">
            
            {/* Header row: Title + Distinct Category Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-[#530e0b]" />
                  <span className="text-[15px] font-bold text-[#000000]">
                    Announcements
                  </span>
                </div>
                {role === 'admin' && (
                  <Link 
                    to="/announcements" 
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#611a17] hover:underline bg-[#611a17]/5 px-2 py-0.5 rounded-md"
                  >
                    <span>Manage</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
              </div>

              {/* Distinctive Colorful Filter Pills */}
              <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif] text-[12px] font-bold">
                <button
                  onClick={() => setSelectedCat('All')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCat === 'All' 
                      ? 'bg-[#4c110e] text-white shadow-sm' 
                      : 'bg-white text-[#6b5b5b] border border-[#EDE0D4] hover:border-[#4c110e]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCat('Academic')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCat === 'Academic' 
                      ? 'bg-[#611a17] text-white shadow-sm' 
                      : 'bg-[#611a17]/5 text-[#611a17] border border-[#611a17]/25 hover:bg-[#611a17]/15'
                  }`}
                >
                  Academic
                </button>
                <button
                  onClick={() => setSelectedCat('Event')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCat === 'Event' 
                      ? 'bg-[#c8a227] text-white shadow-sm' 
                      : 'bg-[#c8a227]/10 text-[#916b08] border border-[#c8a227]/30 hover:bg-[#c8a227]/20'
                  }`}
                >
                  Event
                </button>
                <button
                  onClick={() => setSelectedCat('Administrative')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCat === 'Administrative' 
                      ? 'bg-[#1e3a8a] text-white shadow-sm' 
                      : 'bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/25 hover:bg-[#1e3a8a]/15'
                  }`}
                >
                  Administrative
                </button>
              </div>
            </div>

            {/* ── Skeleton Loading State ── */}
            {loading ? (
              <div className="space-y-4">
                <div className="w-full bg-white rounded-2xl p-6 border border-[#EDE0D4] animate-pulse space-y-4">
                  <div className="h-4 bg-[#EDE0D4] rounded w-32" />
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-[#EDE0D4] shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-[#EDE0D4] rounded w-3/4" />
                      <div className="h-3 bg-[#EDE0D4]/70 rounded w-full" />
                      <div className="h-3 bg-[#EDE0D4]/70 rounded w-5/6" />
                    </div>
                  </div>
                </div>
                <div className="w-full bg-white rounded-2xl p-5 border border-[#EDE0D4] animate-pulse flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#EDE0D4] shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-[#EDE0D4] rounded w-1/2" />
                    <div className="h-3 bg-[#EDE0D4]/70 rounded w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ── Pinned Announcement Card (Loaded from live MySQL) ── */}
                {pinnedPost && (
                  <div className="w-full bg-white rounded-2xl p-6 border-2 border-[#c8a227] shadow-[0_2px_8px_rgba(200,162,39,0.12)] space-y-4">
                <div className="flex items-center gap-2 text-[#c8a227] font-['Inter',sans-serif] text-[12px] font-bold">
                  <Pin size={14} className="fill-[#c8a227]" />
                  <span>PINNED ANNOUNCEMENT</span>
                </div>

                <div className="flex items-start gap-5">
                  <div className="flex flex-col items-center shrink-0 text-center">
                    <div className="w-[88px] h-[88px] rounded-full ring-[2px] ring-[#c8a227] bg-[#FAF8F5] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      <img 
                        src={getAvatarUrl(pinnedPost.author, pinnedPost.role || 'admin')} 
                        alt={pinnedPost.author} 
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <span className="hidden w-full h-full bg-[#42100E] text-[#c8a227] items-center justify-center font-bold text-xl rounded-full">
                        {getInitials(pinnedPost.author || 'Joel')}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-center max-w-[105px]">
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] font-bold text-[#000000]">
                        {pinnedPost.author}
                      </p>
                      <p className="font-['Inter',sans-serif] text-[8px] font-semibold text-[#8C2A2A] mt-0.5">
                        {pinnedPost.role || 'Administrator'}
                      </p>
                      <p className="font-['Inter',sans-serif] text-[8px] font-normal text-[#9b8b8b] mt-0.5 whitespace-nowrap">
                        {pinnedPost.date}
                      </p>
                    </div>

                    <div className={`mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${getCategoryBadge(pinnedPost.category)}`}>
                      {pinnedPost.category}
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-bold text-[#000000] leading-snug">
                      {pinnedPost.title}
                    </h3>
                    <p className="font-['Inter',sans-serif] text-[12px] font-normal text-[#6b5b5b] leading-[1.6] whitespace-pre-wrap">
                      {pinnedPost.content}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Regular Announcements Feed (Scrollable Container with own scrollbar) ── */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
              {normalPosts.length === 0 ? (
                <div className="w-full bg-white rounded-2xl border border-[#EDE0D4] p-8 text-center text-xs text-[#9b8b8b]">
                  No additional announcements matching current filter.
                </div>
              ) : (
                normalPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="w-full bg-white rounded-2xl border border-[#EDE0D4] p-5 shadow-sm hover:border-[#611a17]/30 transition-all flex items-start gap-4"
                  >
                    <div className="flex flex-col items-center shrink-0 text-center w-[95px]">
                      <div className="w-[52px] h-[52px] rounded-full ring-1 ring-[#EDE0D4] bg-[#FAF8F5] p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        <img 
                          src={getAvatarUrl(post.author, post.role || 'admin')} 
                          alt={post.author} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="mt-1.5 text-center w-full">
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[9px] font-bold text-[#000000] leading-tight">
                          {post.author}
                        </p>
                        <p className="font-['Inter',sans-serif] text-[8px] font-semibold text-[#8C2A2A] mt-0.5 leading-tight">
                          {post.role || 'Personnel'}
                        </p>
                        <p className="font-['Inter',sans-serif] text-[8px] font-normal text-[#9b8b8b] mt-0.5">
                          {post.date}
                        </p>
                      </div>
                      <div className={`mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wide uppercase ${getCategoryBadge(post.category)}`}>
                        {post.category}
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-bold text-[#000000] leading-snug">
                        {post.title}
                      </h4>
                      <p className="font-['Inter',sans-serif] text-[12px] font-normal text-[#6b5b5b] leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            </>
            )}
          </div>

          {/* ── RIGHT COLUMN: Calendar, Schedule & Upcoming Events ── */}
          <div className="w-full space-y-5">
            
            {/* Header: Calendar */}
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className="text-[#530e0b]" />
              <span className="text-[15px] font-bold text-[#000000]">
                Academic Calendar
              </span>
            </div>

            {/* Interactive Mini Calendar Widget (Driven by live database events) */}
            <MiniCalendar events={events} />

            {/* Header: Upcoming Events + Admin Add Event Action */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#530e0b]" />
                <span className="text-[15px] font-bold text-[#000000]">
                  Upcoming Events & Deadlines
                </span>
              </div>
              {role === 'admin' && (
                <button
                  onClick={() => setShowEventModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#611a17] hover:underline bg-[#611a17]/5 px-2 py-0.5 rounded-md cursor-pointer"
                >
                  <Plus size={11} />
                  <span>Add Event</span>
                </button>
              )}
            </div>

            {/* Event List Cards (Dynamically Loaded from MySQL) */}
            <div className="w-full bg-white rounded-2xl border border-[#EDE0D4] p-5 shadow-sm space-y-3">
              {events.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#9b8b8b]">
                  No upcoming events scheduled.
                </div>
              ) : (
                events.map(ev => {
                  const badgeStyle = 
                    ev.category === 'Academic' ? 'bg-[#611a17]/10 text-[#611a17] border-[#611a17]/20' :
                    ev.category === 'Campus Life' ? 'bg-[#c8a227]/15 text-[#916b08] border-[#c8a227]/30' :
                    ev.category === 'Finance' ? 'bg-[#1e3a8a]/10 text-[#1e3a8a] border-[#1e3a8a]/20' :
                    'bg-emerald-50 text-emerald-800 border-emerald-200';

                  const dateLabel = ev.startDate === ev.endDate || !ev.endDate
                    ? ev.startDate
                    : `${ev.startDate} – ${ev.endDate}`;

                  return (
                    <div 
                      key={ev.id} 
                      className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EDE0D4] hover:border-[#611a17]/30 transition-colors group relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                          {dateLabel}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#A88020] font-bold">{ev.category}</span>
                          {role === 'admin' && (
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity p-0.5"
                              title="Delete Event"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-bold text-[#1A0A0A]">{ev.title}</p>
                      {ev.description && (
                        <p className="text-[11px] text-[#6b5b5b] mt-0.5 leading-snug">{ev.description}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* ── Administrator Event Scheduling Modal ── */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#EDE0D4] shadow-2xl w-full max-w-md p-6 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE0D4]">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-[#611a17]" />
                  <h3 className="font-bold text-base text-[#1A0A0A]">
                    Schedule Academic Event
                  </h3>
                </div>
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1A0A0A] block mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Fair & Exhibit"
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    className="inp w-full p-2.5 rounded-xl border border-[#EDE0D4]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1A0A0A] block mb-1">Category</label>
                    <select
                      value={eventCategory}
                      onChange={e => setEventCategory(e.target.value)}
                      className="inp w-full p-2.5 rounded-xl border border-[#EDE0D4]"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Campus Life">Campus Life</option>
                      <option value="Finance">Finance</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-[#1A0A0A] block mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={eventStartDate}
                      onChange={e => setEventStartDate(e.target.value)}
                      className="inp w-full p-2.5 rounded-xl border border-[#EDE0D4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1A0A0A] block mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={e => setEventEndDate(e.target.value)}
                    className="inp w-full p-2.5 rounded-xl border border-[#EDE0D4]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A0A0A] block mb-1">Description / Location</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details, venues, or instructions for students..."
                    value={eventDescription}
                    onChange={e => setEventDescription(e.target.value)}
                    className="inp w-full p-2.5 rounded-xl border border-[#EDE0D4]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#EDE0D4]">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#EDE0D4] font-bold text-[#6B5B5B] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEvent}
                    className="px-5 py-2 rounded-xl bg-[#611a17] hover:bg-[#4e1412] text-white font-bold disabled:opacity-50"
                  >
                    {submittingEvent ? 'Saving...' : 'Save to Calendar'}
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
