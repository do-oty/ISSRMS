import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../context/AppContext'
import {
  Search, BookOpen, LayoutGrid, List, Check, CreditCard, Plus,
  AlertTriangle, User, Filter, RefreshCw
} from 'lucide-react'
import { SkeletonCard, SkeletonTableRows, SkeletonBox } from '../components/Skeleton'

const generateRef = (prefix = 'REF') => `${prefix}-${Date.now().toString(36).toUpperCase()}`

function Badge({ children, color }) {
  const map = {
    green: 'bg-green-50 text-[#4A7C59] border-green-200',
    red:   'bg-red-50 text-[#991B1B] border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    gray:  'bg-gray-50 text-[#6B5B5B] border-gray-200',
    gold:  'bg-[#FBF6EE] text-[#A88020] border-[#EDE0D4]',
  }
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[color] || map.gray}`}>{children}</span>
}

function getBookCoverUrl(book) {
  if (book.coverUrl) return book.coverUrl
  if (book.isbn && book.isbn !== 'N/A') {
    const cleanIsbn = book.isbn.replace(/[^0-9X]/gi, '')
    if (cleanIsbn) return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`
  }
  return null
}

function BookCard({ book, onClick, view }) {
  const { title, author, category, available } = book
  const coverUrl = getBookCoverUrl(book)

  if (view === 'list') return (
    <div onClick={onClick} className="book-card flex items-center gap-4 p-4 bg-white rounded-xl border border-[#EDE0D4] hover:shadow-md transition-shadow cursor-pointer animate-fade-in group">
      <div className="w-12 h-16 rounded-lg shrink-0 flex items-center justify-center bg-[#FBF6EE] overflow-hidden border border-[#EDE0D4]/60">
        {coverUrl ? (
          <img 
            src={coverUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <div className={`${coverUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
          <BookOpen size={20} style={{ color: '#6B1A1A' }} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#1A0A0A] truncate">{title}</p>
        <p className="text-xs text-[#6B5B5B] truncate">{author}</p>
        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[#A88020] bg-yellow-50 px-2 py-0.5 rounded mt-1">{category}</span>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${available ? 'bg-green-50 text-[#4A7C59]' : 'bg-red-50 text-[#991B1B]'}`}>
        {available ? 'Available' : 'Loaned Out'}
      </span>
    </div>
  )

  return (
    <div onClick={onClick} className="book-card bg-white rounded-2xl overflow-hidden cursor-pointer border border-[#EDE0D4] hover:border-[#6B1A1A] hover:shadow-md transition-all flex flex-col justify-between animate-fade-in group"
      style={{ boxShadow: '0 2px 8px rgba(107,26,26,0.02)' }}>
      <div>
        <div className="h-44 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#FBF6EE] to-[#EDE0D4]">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
          ) : null}
          <div className={`${coverUrl ? 'hidden' : 'flex'} flex-col items-center justify-center p-4 text-center`}>
            <BookOpen size={34} style={{ color: '#6B1A1A', opacity: 0.35 }} />
            <span className="text-[10px] font-bold text-[#6B1A1A]/50 mt-1 uppercase tracking-wider">{category}</span>
          </div>
        </div>
        <div className="p-3.5 space-y-1.5">
          <span className="text-[9px] font-bold text-[#A88020] bg-[#FBF6EE] px-2 py-0.5 rounded uppercase">{category}</span>
          <p className="font-semibold text-xs text-[#1A0A0A] leading-tight line-clamp-2 min-h-[32px]">{title}</p>
          <p className="text-[11px] text-[#6B5B5B] truncate">{author}</p>
        </div>
      </div>
      <div className="p-3.5 pt-0 flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${available ? 'bg-green-50 text-[#4A7C59]' : 'bg-red-50 text-[#991B1B]'}`}>
          {available ? 'Available' : 'Loaned Out'}
        </span>
      </div>
    </div>
  )
}

export default function Library() {
  const { role, token, libraryCatalogCache, setLibraryCatalogCache } = useApp()
  const isStudent = role === 'student'
  const isPersonnel = role === 'library_personnel' || role === 'admin'

  const [view, setView] = useState('grid')
  const [activeTab, setActiveTab] = useState(isPersonnel ? 'catalog' : 'catalog')
  const [catalog, setCatalog] = useState(() => (libraryCatalogCache && libraryCatalogCache.length > 0) ? libraryCatalogCache : [])
  const [circulation, setCirculation] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (libraryCatalogCache && libraryCatalogCache.length > 0 && catalog.length === 0) {
      setCatalog(libraryCatalogCache)
    }
  }, [libraryCatalogCache])

  const loadLibraryData = async () => {
    setLoading(true)
    try {
      const catRes = await fetch('http://localhost:5000/api/v1/library/catalog')
      if (catRes.ok) {
        const catData = await catRes.json()
        if (catData.books) {
          const mapped = catData.books.map(b => ({
            ...b,
            available: b.available > 0,
            copiesAvailable: b.available
          }))
          setCatalog(mapped)
          setLibraryCatalogCache?.(mapped)
        }
      }

      const authToken = token || localStorage.getItem('issrms_token')
      if (authToken) {
        const circRes = await fetch('http://localhost:5000/api/v1/library/circulation', {
          headers: { 'Authorization': 'Bearer ' + authToken }
        })
        if (circRes.ok) {
          const circData = await circRes.json()
          if (circData.loans) {
            setCirculation(circData.loans.map(l => ({
              id: `CIR-${l.id}`,
              rawId: l.id,
              bookId: l.book_id,
              studentId: l.studentId,
              title: l.bookTitle,
              isbn: l.isbn,
              status: l.status,
              borrowDate: l.borrowDate ? String(l.borrowDate).slice(0, 10) : '',
              dueDate: l.dueDate ? String(l.dueDate).slice(0, 10) : '',
              returnDate: l.returnDate ? String(l.returnDate).slice(0, 10) : null,
              fineAssessed: Number(l.fine || 0),
              fineStatus: (l.fineStatus || 'none').toLowerCase()
            })))
          }
        }
      }
    } catch (err) {
      console.warn('Live library sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLibraryData()
  }, [token])

  // Catalog filters
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [availabilityFilter, setAvailabilityFilter] = useState('All')

  // Borrowing states
  const [borrowStudentId, setBorrowStudentId] = useState('STU-2026-0891')
  const [selectedBook, setSelectedBook] = useState('')
  const [bookSearchQuery, setBookSearchQuery] = useState('')
  const [borrowDays, setBorrowDays] = useState('14')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Return states
  const [returnFilter, setReturnFilter] = useState('')

  const [fineSearch, setFineSearch] = useState('')

  // Fine management states
  const [showFineModal, setShowFineModal] = useState(false)
  const [fineAction, setFineAction] = useState(null)
  const [fineTarget, setFineTarget] = useState(null)
  const [fineAmount, setFineAmount] = useState('')
  const [fineReason, setFineReason] = useState('')

  // Book detail modal
  const [selectedBookDetail, setSelectedBookDetail] = useState(null)
  const [activeSlide, setActiveSlide] = useState(0)

  // Inventory search
  const [invSearchQuery, setInvSearchQuery] = useState('')
  const [invCategoryFilter, setInvCategoryFilter] = useState('All')
  const [invAvailFilter, setInvAvailFilter] = useState('All')
  const [invActive, setInvActive] = useState('active')

  // Add book modal & Online API lookup
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [newBookTitle, setNewBookTitle] = useState('')
  const [newBookAuthor, setNewBookAuthor] = useState('')
  const [newBookCategory, setNewBookCategory] = useState('Science & Physics')
  const [newBookIsbn, setNewBookIsbn] = useState('')
  const [newBookShelf, setNewBookShelf] = useState('Shelf A-01')
  const [newBookCopies, setNewBookCopies] = useState('5')
  const [newBookCoverUrl, setNewBookCoverUrl] = useState('')
  const [newBookSynopsis, setNewBookSynopsis] = useState('')
  const [isSearchingApi, setIsSearchingApi] = useState(false)
  const [apiSearchMsg, setApiSearchMsg] = useState('')

  // Multi-Pass Online Book Lookup with Synopsis Extraction
  const handleLookupIsbn = async () => {
    const clean = newBookIsbn.replace(/[^0-9X]/gi, '')
    if (!clean) {
      setApiSearchMsg('Please enter an ISBN (e.g. 9780132350884 or 9780134685991)')
      return
    }

    setIsSearchingApi(true)
    setApiSearchMsg('Searching Pass 1: Open Library Detailed Edition Database...')

    try {
      // Pass 1: Open Library Books Details API (fetches synopsis, publisher, pages, cover)
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=details`)
      const data = await res.json()
      const bookData = data[`ISBN:${clean}`]

      if (bookData?.details?.title) {
        const details = bookData.details
        setNewBookTitle(details.title)
        if (details.authors?.length > 0) {
          setNewBookAuthor(details.authors.map(a => a.name).join(', '))
        }
        
        // Extract synopsis / description
        let synopsis = ''
        if (typeof details.description === 'string') {
          synopsis = details.description
        } else if (details.description?.value) {
          synopsis = details.description.value
        } else if (details.notes) {
          synopsis = typeof details.notes === 'string' ? details.notes : details.notes.value
        }
        if (synopsis) setNewBookSynopsis(synopsis.trim())

        // Cover resolution
        if (details.covers?.length > 0) {
          setNewBookCoverUrl(`https://covers.openlibrary.org/b/id/${details.covers[0]}-L.jpg`)
        } else {
          setNewBookCoverUrl(`https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`)
        }

        setApiSearchMsg(`✓ Found via Open Library: "${details.title}"${synopsis ? ' (Synopsis loaded)' : ''}`)
        setIsSearchingApi(false)
        return
      }

      // Pass 2: Open Library Search Index API
      setApiSearchMsg('Searching Pass 2: Open Library Catalog Index...')
      const sRes = await fetch(`https://openlibrary.org/search.json?isbn=${clean}&limit=1`)
      const sData = await sRes.json()
      if (sData.docs && sData.docs.length > 0) {
        const doc = sData.docs[0]
        setNewBookTitle(doc.title)
        if (doc.author_name) setNewBookAuthor(doc.author_name.join(', '))
        if (doc.first_sentence) {
          setNewBookSynopsis(Array.isArray(doc.first_sentence) ? doc.first_sentence.join(' ') : doc.first_sentence)
        }
        if (doc.cover_i) {
          setNewBookCoverUrl(`https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`)
        } else {
          setNewBookCoverUrl(`https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`)
        }
        setApiSearchMsg(`✓ Found via Catalog Index: "${doc.title}"`)
        setIsSearchingApi(false)
        return
      }

      // Pass 3: Google Books Volume API (often has rich descriptions)
      setApiSearchMsg('Searching Pass 3: Google Books Global Repository...')
      const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`)
      const gData = await gRes.json()
      if (gData.items && gData.items.length > 0) {
        const volume = gData.items[0].volumeInfo
        setNewBookTitle(volume.title || '')
        if (volume.authors) setNewBookAuthor(volume.authors.join(', '))
        if (volume.description) setNewBookSynopsis(volume.description.trim())
        if (volume.imageLinks?.thumbnail) {
          const secureThumb = volume.imageLinks.thumbnail.replace('http://', 'https://')
          setNewBookCoverUrl(secureThumb)
        } else {
          setNewBookCoverUrl(`https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`)
        }
        setApiSearchMsg(`✓ Found via Google Books: "${volume.title}"${volume.description ? ' (Synopsis loaded)' : ''}`)
        setIsSearchingApi(false)
        return
      }

      setApiSearchMsg('No online records found after 3-pass search. You can enter details manually.')
    } catch (err) {
      setApiSearchMsg('Lookup service temporarily unreachable. You may enter details manually.')
    } finally {
      setIsSearchingApi(false)
    }
  }

  // Inventory management
  const [invHistory, setInvHistory] = useState([])
  const [showInvHistory, setShowInvHistory] = useState(false)
  const [showLibEditModal, setShowLibEditModal] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [eTitle, setETitle] = useState('')
  const [eAuthor, setEAuthor] = useState('')
  const [eCategory, setECategory] = useState('')
  const [eShelf, setEShelf] = useState('')
  const [eCondition, setECondition] = useState('')
  const [showLibAdjModal, setShowLibAdjModal] = useState(false)
  const [adjBook, setAdjBook] = useState(null)
  const [libAdjType, setLibAdjType] = useState('copy_add')
  const [libAdjQty, setLibAdjQty] = useState('')
  const [libAdjReason, setLibAdjReason] = useState('')

  const studentId = 'STU-2026-0891'
  const studentCirculation = circulation.filter(c => c.studentId === studentId)

  const filteredCatalog = catalog.filter(book => {
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory
    const matchesAvailability = availabilityFilter === 'All' ||
      (availabilityFilter === 'Available' && book.available) ||
      (availabilityFilter === 'Loaned' && !book.available)
    return matchesCategory && matchesAvailability
  })

  const getCatCount = (cat) => cat === 'All' ? catalog.length : catalog.filter(b => b.category === cat).length

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!selectedBook || !borrowStudentId) return
    const book = catalog.find(b => b.title === selectedBook)
    if (!book || !book.available) { setSuccessMsg('Book is not available.'); return }

    try {
      const res = await fetch('http://localhost:5000/api/v1/library/issue-loan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          student_id: borrowStudentId,
          book_id: book.id
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setSuccessMsg(data.error || 'Failed to issue loan.')
        return
      }

      setSuccessMsg(`Book loan issued: "${book.title}" to ${borrowStudentId}.`)
      setSelectedBook('')
      setBookSearchQuery('')
      loadLibraryData()
    } catch (err) {
      console.warn('API error during loan checkout:', err)
      setSuccessMsg('Loan issuance failed: ' + err.message)
    }
  }

  const handleReturn = async (cirId) => {
    const cir = circulation.find(c => c.id === cirId)
    if (cir && cir.fineStatus === 'unpaid') {
      setSuccessMsg('Return blocked — outstanding fine of ₱' + cir.fineAssessed.toFixed(2) + ' must be settled first.')
      return
    }

    try {
      const targetCircId = cir?.rawId || parseInt(String(cirId).replace(/[^0-9]/g, ''))
      const res = await fetch('http://localhost:5000/api/v1/library/return-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          circulation_id: targetCircId
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setSuccessMsg(data.error || 'Failed to process return.')
        return
      }

      setSuccessMsg('Book returned successfully.')
      loadLibraryData()
    } catch (err) {
      console.warn('API error during return, using fallback:', err)
      setCirculation(prev => prev.map(c => {
        if (c.id !== cirId) return c
        const now = new Date()
        const dueDate = new Date(c.dueDate)
        const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        return { ...c, status: 'Returned', returnDate: now.toISOString().slice(0, 10), daysOverdue, fineAssessed: daysOverdue > 0 ? 50.00 : 0, fineStatus: daysOverdue > 0 ? 'unpaid' : 'none', fineReason: daysOverdue > 0 ? `Returned ${daysOverdue} days past due date` : null }
      }))
      setCatalog(prev => prev.map(b => b.id === cir.bookId ? { ...b, copiesAvailable: b.copiesAvailable + 1, available: true } : b))
      setSuccessMsg('Book returned successfully.')
    }
  }

  const openFineModal = (action, cir) => {
    setFineAction(action)
    setFineTarget(cir)
    setFineAmount(action === 'assess' ? '50.00' : action === 'adjust' ? String(cir.fineAssessed) : String(cir.fineAssessed))
    setFineReason('')
    setShowFineModal(true)
  }

  const handleFineAction = () => {
    if (!fineTarget || !fineReason.trim()) return
    const amt = parseFloat(fineAmount) || 0
    setCirculation(prev => prev.map(c => {
      if (c.id !== fineTarget.id) return c
      if (fineAction === 'assess') return { ...c, fineAssessed: amt, fineStatus: amt > 0 ? 'unpaid' : 'none', fineReason }
      if (fineAction === 'adjust') return { ...c, fineAssessed: amt, fineStatus: amt > 0 ? 'unpaid' : 'none', fineReason }
      if (fineAction === 'reduce') return { ...c, fineAssessed: Math.max(0, (c.fineAssessed || 0) - amt), fineStatus: Math.max(0, (c.fineAssessed || 0) - amt) > 0 ? 'unpaid' : 'none', fineReason }
      if (fineAction === 'waive') return { ...c, fineAssessed: 0, fineStatus: 'none', fineReason }
      if (fineAction === 'settle') return { ...c, fineAssessed: 0, fineStatus: 'paid', fineReason }
      return c
    }))
    setSuccessMsg(`Fine ${fineAction === 'assess' ? 'assessed' : fineAction === 'adjust' ? 'adjusted' : fineAction === 'reduce' ? 'reduced' : fineAction === 'waive' ? 'waived' : 'settled'}: ₱${amt.toFixed(2)} for ${fineTarget.title}`)
    setShowFineModal(false)
  }

  const handleAddBook = (e) => {
    e.preventDefault()
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return
    const id = String(catalog.length + 1 + Math.floor(Math.random() * 100))
    const copies = parseInt(newBookCopies) || 1
    const cleanIsbn = newBookIsbn.replace(/[^0-9X]/gi, '')
    const finalCover = newBookCoverUrl || (cleanIsbn ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg` : null)

    setCatalog(prev => [...prev, {
      id, title: newBookTitle, author: newBookAuthor, category: newBookCategory,
      available: copies > 0, isbn: newBookIsbn || 'N/A', published: String(new Date().getFullYear()),
      pages: 300, shelf: newBookShelf, totalCopies: copies, copiesAvailable: copies,
      active: true, condition: 'Good', coverUrl: finalCover,
      synopsis: newBookSynopsis || null
    }])
    setSuccessMsg(`"${newBookTitle}" added to catalog with cover art & synopsis.`)
    setNewBookTitle(''); setNewBookAuthor(''); setNewBookCategory('Science & Physics')
    setNewBookIsbn(''); setNewBookShelf('Shelf A-01'); setNewBookCopies('5')
    setNewBookCoverUrl(''); setNewBookSynopsis('')
    setApiSearchMsg('')
    setShowAddBookModal(false)
  }

  const openLibEdit = (b) => { setEditBook(b); setETitle(b.title); setEAuthor(b.author); setECategory(b.category); setEShelf(b.shelf); setECondition(b.condition||'Good'); setShowLibEditModal(true) }
  const handleLibEdit = (e) => {
    e.preventDefault()
    if (!editBook || !eTitle.trim()) return
    setCatalog(prev => prev.map(b => b.id === editBook.id ? { ...b, title: eTitle, author: eAuthor, category: eCategory, shelf: eShelf, condition: eCondition } : b))
    setShowLibEditModal(false); setSuccessMsg('Catalog entry updated.')
  }

  const openLibAdjust = (b) => { setAdjBook(b); setLibAdjType('copy_add'); setLibAdjQty(''); setLibAdjReason(''); setShowLibAdjModal(true) }
  const handleLibAdjust = (e) => {
    e.preventDefault()
    if (!adjBook || !libAdjReason.trim()) return
    const qty = parseInt(libAdjQty) || 0
    const sign = libAdjType==='copy_add'?Math.abs(qty):libAdjType==='copy_remove'?-Math.abs(qty):(parseInt(libAdjQty)-adjBook.totalCopies)
    const newTotal = Math.max(0, adjBook.totalCopies+sign)
    const newAvail = Math.min(Math.max(0, adjBook.copiesAvailable+sign), newTotal)
    const rid = generateRef('LIB-INV').slice(0,10)
    setCatalog(prev => prev.map(b => b.id===adjBook.id?{...b,totalCopies:newTotal,copiesAvailable:newAvail,available:newAvail>0}:b))
    setInvHistory(prev=>[{id:`LIH-${invHistory.length+1}`,bookId:adjBook.id,title:adjBook.title,type:libAdjType,qtyChange:sign,prevQty:adjBook.totalCopies,resultQty:newTotal,actor:'EMP-2018-0119',timestamp:new Date().toISOString().slice(0,19),reason:libAdjReason,ref:rid},...prev])
    setShowLibAdjModal(false); setSuccessMsg(`Inventory adjusted. Ref: ${rid}`)
  }

  const handleLibToggleActive = (b) => {
    const isRef = circulation.some(c=>c.bookId===b.id)
    if (!b.active && isRef) return
    if (b.active && isRef) {
      setCatalog(prev=>prev.map(x=>x.id===b.id?{...x,active:false}:x))
      setInvHistory(prev=>[{id:`LIH-${invHistory.length+1}`,bookId:b.id,title:b.title,type:'deactivated',qtyChange:0,prevQty:b.totalCopies,resultQty:b.totalCopies,actor:'EMP-2018-0119',timestamp:new Date().toISOString().slice(0,19),reason:'Deactivated by personnel',ref:generateRef('LIB-INV').slice(0,10)},...prev])
      setSuccessMsg(`${b.title} deactivated.`)
    } else {
      setCatalog(prev=>prev.map(x=>x.id===b.id?{...x,active:!x.active}:x))
      setSuccessMsg(`${b.title} ${b.active?'deactivated':'reactivated'}.`)
    }
  }

  const handleLibDelete = (b) => {
    const isRef = circulation.some(c=>c.bookId===b.id)
    if (isRef) { setSuccessMsg('Cannot delete — referenced by circulation records. Deactivate instead.'); return }
    setCatalog(prev=>prev.filter(x=>x.id!==b.id))
    setSuccessMsg(`${b.title} deleted.`)
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif-sjsm" style={{ color: '#1A0A0A' }}>Library Portal</h2>
            <p className="text-sm mt-0.5" style={{ color: '#6B5B5B' }}>
              {isPersonnel ? 'Catalog, borrowing, returns, inventory, and fine management'
               : isStudent ? 'Browse catalog, view borrowings, and check fine status'
               : 'Library overview'}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border text-xs animate-fade-in ${successMsg.includes('not available') ? 'bg-red-50 text-[#991B1B] border-red-200' : 'bg-green-50 text-[#4A7C59] border-green-200'}`}>
            <Check size={16} /> <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#EDE0D4] gap-4 mb-4">
          <button onClick={() => setActiveTab('catalog')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'catalog' ? 'border-b-2 border-[#C8A227] text-[#6B1A1A]' : 'text-[#6B5B5B]'}`}>
            Browse Catalog
          </button>
          {isStudent && (
            <button onClick={() => setActiveTab('myborrows')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'myborrows' ? 'border-b-2 border-[#C8A227] text-[#6B1A1A]' : 'text-[#6B5B5B]'}`}>
              My Borrowed Books ({studentCirculation.filter(c => c.status === 'Active' || c.status === 'Overdue').length})
            </button>
          )}
          {isPersonnel && (
            <>
              <button onClick={() => setActiveTab('circulation')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'circulation' ? 'border-b-2 border-[#C8A227] text-[#6B1A1A]' : 'text-[#6B5B5B]'}`}>
                Circulation
              </button>
              <button onClick={() => setActiveTab('inventory')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'inventory' ? 'border-b-2 border-[#C8A227] text-[#6B1A1A]' : 'text-[#6B5B5B]'}`}>
                Inventory
              </button>
              <button onClick={() => setActiveTab('fines')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'fines' ? 'border-b-2 border-[#C8A227] text-[#6B1A1A]' : 'text-[#6B5B5B]'}`}>
                Fine Management
              </button>
            </>
          )}
        </div>

        {/* ── CATALOG ─────────────────────────────── */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 animate-fade-in">
            <div className="bg-white rounded-2xl p-5 border border-[#EDE0D4] space-y-6 h-fit shadow-sm">
              <div>
                <div className="flex items-center gap-2 text-[#6B1A1A] font-bold text-xs uppercase tracking-wider mb-3">
                  <Filter size={14} /><span>Categories</span>
                </div>
                <div className="space-y-1 text-xs">
                  {['All', 'Science & Physics', 'Chemistry & Biology', 'World History', 'Mathematics', 'Literature'].map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center justify-between w-full text-left py-2 px-2.5 rounded-lg transition-colors font-medium ${selectedCategory === cat ? 'bg-[#FBF6EE] text-[#6B1A1A] font-bold' : 'text-[#6B5B5B] hover:bg-[#FAF8F5]'}`}>
                      <span>{cat === 'All' ? 'All Genres' : cat}</span>
                      <span className="text-[9px] text-[#9B8B8B] bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">{getCatCount(cat)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-[#EDE0D4] pt-5">
                <h4 className="font-serif-sjsm font-bold text-xs uppercase tracking-wider text-[#6B5B5B] mb-3">Availability</h4>
                {[{ val: 'All', label: 'Show All Books' }, { val: 'Available', label: 'Available Only' }, { val: 'Loaned', label: 'On Loan / Borrowed' }].map((opt) => (
                  <label key={opt.val} className="flex items-center gap-2 cursor-pointer text-xs text-[#6B5B5B] py-1">
                    <input type="radio" name="availability" checked={availabilityFilter === opt.val} onChange={() => setAvailabilityFilter(opt.val)} className="text-[#6B1A1A]" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white rounded-2xl p-4 border border-[#EDE0D4]">
                <div className="relative max-w-xs flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
                  <input placeholder="Search catalog…" className="inp w-full pl-9 pr-3 py-2 text-xs" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-[#EDE0D4] p-0.5">
                    <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-[#FBF6EE] text-[#6B1A1A]' : 'text-[#9B8B8B]'}`}><LayoutGrid size={15} /></button>
                    <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-[#FBF6EE] text-[#6B1A1A]' : 'text-[#9B8B8B]'}`}><List size={15} /></button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#EDE0D4] p-4 animate-pulse space-y-3">
                      <div className="h-44 bg-[#EDE0D4]/70 rounded-xl w-full" />
                      <div className="h-3.5 bg-[#EDE0D4]/80 rounded w-3/4" />
                      <div className="h-2.5 bg-[#EDE0D4]/60 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : view === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCatalog.map(book => (
                    <BookCard key={book.id} book={book} onClick={() => { setSelectedBookDetail(book); setActiveSlide(0) }} view="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCatalog.map(book => (
                    <BookCard key={book.id} book={book} onClick={() => { setSelectedBookDetail(book); setActiveSlide(0) }} view="list" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STUDENT MY BORROWED BOOKS ───────────── */}
        {activeTab === 'myborrows' && (
          <div className="space-y-5">
            {studentCirculation.filter(c => c.status === 'Active' || c.status === 'Overdue').map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-[#EDE0D4] space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 text-white text-[9px] font-bold px-3 py-1 font-sans uppercase"
                  style={{ background: c.status === 'Overdue' ? '#991B1B' : '#4A7C59' }}>
                  {c.status === 'Overdue' ? 'OVERDUE' : 'ACTIVE'}
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#A88020] bg-[#FBF6EE] px-2 py-0.5 rounded uppercase">{c.fineReason || 'In Circulation'}</span>
                  <h4 className="font-bold text-sm text-[#1A0A0A] mt-2">{c.title}</h4>
                </div>
                <div className="border-t border-[#EDE0D4] pt-3.5 grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-[10px] font-bold text-[#9B8B8B] uppercase">Checkout Date</p><p className="font-semibold text-[#1A0A0A]">{c.borrowDate}</p></div>
                  <div><p className="text-[10px] font-bold text-[#9B8B8B] uppercase">Due Date</p><p className="font-semibold text-[#6B1A1A]">{c.dueDate}</p></div>
                </div>
                {c.fineStatus === 'unpaid' && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-2.5 flex items-center gap-2 text-[10px] text-[#991B1B] font-bold">
                    <AlertTriangle size={12} /><span>Fine: ₱{c.fineAssessed.toFixed(2)} — Refer to Library Personnel for resolution.</span>
                  </div>
                )}
                {c.fineStatus === 'none' && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-2.5 flex items-center gap-2 text-[10px] text-[#4A7C59] font-bold">
                    <Check size={12} /><span>No fines.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── CIRCULATION (Personnel) ─────────────── */}
        {activeTab === 'circulation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#6B5B5B]">Borrowing Register</h3>
                <form onSubmit={handleCheckout} className="bg-white rounded-2xl p-5 space-y-4 border border-[#EDE0D4] shadow-sm">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1.5">Student / Staff ID</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
                      <input type="text" required value={borrowStudentId} onChange={e => setBorrowStudentId(e.target.value)}
                        className="inp w-full pl-9 pr-3 py-2 text-xs font-mono font-bold" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1.5">Select Book</label>
                    <input type="text" placeholder="Search by title or author…" value={bookSearchQuery || selectedBook}
                      onFocus={() => setIsDropdownOpen(true)} onChange={e => { setBookSearchQuery(e.target.value); setSelectedBook(e.target.value); setIsDropdownOpen(true) }}
                      className="inp w-full pl-4 pr-8 py-2 text-xs font-semibold" />
                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-[#EDE0D4] rounded-xl shadow-lg z-20 divide-y divide-[#EDE0D4]/40">
                          {catalog.filter(b => b.title.toLowerCase().includes((bookSearchQuery || '').toLowerCase())).map(b => (
                            <button key={b.id} type="button" onClick={() => { setSelectedBook(b.title); setBookSearchQuery(b.title); setIsDropdownOpen(false) }}
                              className={`w-full text-left px-3.5 py-2 hover:bg-[#FBF6EE] text-xs transition-colors ${selectedBook === b.title ? 'bg-[#FBF6EE] font-bold text-[#6B1A1A]' : 'text-[#1A0A0A]'}`}>
                              <span className="font-semibold block truncate">{b.title}</span>
                              <span className="text-[10px] text-[#6B5B5B]">by {b.author}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1.5">Borrow Period</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ val: '7', label: '7 Days' }, { val: '14', label: '14 Days' }, { val: '30', label: '30 Days' }].map(d => (
                        <button key={d.val} type="button" onClick={() => setBorrowDays(d.val)}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${borrowDays === d.val ? 'bg-[#6B1A1A] border-[#6B1A1A] text-white' : 'border-[#EDE0D4] text-[#6B5B5B] hover:border-[#6B1A1A]'}`}>{d.label}</button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2" style={{ background: '#6B1A1A', color: '#fff' }}>
                    <CreditCard size={14} /> Tap ID Card to Borrow
                  </button>
                </form>
              </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-[#6B5B5B]">Active Checkouts</h3>
                    <div className="relative max-w-xs">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
                      <input placeholder="Search by title or student…" value={returnFilter} onChange={e => setReturnFilter(e.target.value)}
                        className="inp w-full pl-9 pr-3 py-2 text-xs" />
                    </div>
                  </div>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#EDE0D4] shadow-sm">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: '#FBF6EE', borderBottom: '1px solid #EDE0D4' }}>
                        {['Book', 'Borrower', 'Checkout', 'Due', 'Status', 'Action'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase text-[#6B5B5B]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE0D4]">
                      {loading ? (
                        <SkeletonTableRows rows={5} cols={6} />
                      ) : circulation.filter(c => (c.status === 'Active' || c.status === 'Overdue') && (!returnFilter || c.title.toLowerCase().includes(returnFilter.toLowerCase()) || c.studentId.includes(returnFilter))).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-[#9B8B8B] font-semibold text-xs">
                            No active checkouts found.
                          </td>
                        </tr>
                      ) : (
                        circulation.filter(c => (c.status === 'Active' || c.status === 'Overdue') && (!returnFilter || c.title.toLowerCase().includes(returnFilter.toLowerCase()) || c.studentId.includes(returnFilter))).map(c => (
                        <tr key={c.id} className="hover:bg-[#FBF6EE]">
                          <td className="px-4 py-3 font-semibold text-[#1A0A0A]">{c.title}</td>
                          <td className="px-4 py-3">{c.studentId}</td>
                          <td className="px-4 py-3 text-[#6B5B5B]">{c.borrowDate}</td>
                          <td className="px-4 py-3 font-semibold">{c.dueDate}</td>
                          <td className="px-4 py-3"><Badge color={c.status === 'Overdue' ? 'red' : 'green'}>{c.status}</Badge></td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleReturn(c.id)} className="text-[#6B1A1A] hover:underline font-bold text-[10px]">Return</button>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── INVENTORY ───────────────────────────── */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap bg-white rounded-2xl p-4 border border-[#EDE0D4]">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
                <input placeholder="Search inventory…" value={invSearchQuery} onChange={e => setInvSearchQuery(e.target.value)}
                  className="inp w-full pl-9 pr-3 py-2 text-xs" />
              </div>
              <select value={invCategoryFilter} onChange={e => setInvCategoryFilter(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
                <option value="All">All Genres</option>
                {['Science & Physics','Chemistry & Biology','World History','Mathematics','Literature'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={invAvailFilter} onChange={e => setInvAvailFilter(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
                <option value="All">All Availability</option><option value="Available">Has Copies</option><option value="Empty">No Copies</option>
              </select>
              <select value={invActive} onChange={e => setInvActive(e.target.value)} className="inp px-3 py-2 text-xs font-semibold">
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="all">All Status</option>
              </select>
              {role === 'library_personnel' && <button onClick={() => setShowAddBookModal(true)} className="btn-primary flex items-center gap-1.5 px-3 py-2 text-xs font-bold"><Plus size={13} /> Add Book</button>}
              <button onClick={()=>setShowInvHistory(!showInvHistory)} className="btn-outline px-3 py-2 text-xs font-semibold">{showInvHistory?'Hide':'Show'} History</button>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden border border-[#EDE0D4] shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#FBF6EE', borderBottom: '1px solid #EDE0D4' }}>
                    {['Accession No', 'Title', 'Author', 'Genre', 'Copy #', 'Status', 'Shelf', 'Condition', ''].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-[#6B5B5B]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE0D4]">
                  {catalog.filter(b => {
                    const ms = !invSearchQuery || b.title.toLowerCase().includes(invSearchQuery.toLowerCase()) || b.author.toLowerCase().includes(invSearchQuery.toLowerCase())
                    const mc = invCategoryFilter === 'All' || b.category === invCategoryFilter
                    const ma = invAvailFilter === 'All' || (invAvailFilter === 'Available' && b.copiesAvailable > 0) || (invAvailFilter === 'Empty' && b.copiesAvailable === 0)
                    const mi = invActive === 'all' || (invActive === 'active' && b.active) || (invActive === 'inactive' && !b.active)
                    return ms && mc && ma && mi
                  }).flatMap(book => {
                    const isRef = circulation.some(c=>c.bookId===book.id)
                    return Array.from({length: book.totalCopies}, (_, i) => {
                      const copyNum = i + 1
                      const isLoaned = i >= book.copiesAvailable
                      const accNum = `ACC-${String(book.id).padStart(4,'0')}-2026-C${String(copyNum).padStart(2,'0')}`
                      const status = book.condition === 'Lost' ? 'Lost' : book.condition === 'Damaged' ? 'Damaged' : isLoaned ? 'Loaned Out' : 'Available'
                      const sc = status === 'Available' ? 'text-[#4A7C59]' : status === 'Loaned Out' ? 'text-[#B45309]' : 'text-[#991B1B]'
                      return (
                        <tr key={`${book.id}-${copyNum}`} className="hover:bg-[#FBF6EE]" style={{opacity:book.active?1:0.5}}>
                          <td className="px-3 py-2 font-mono text-[10px] text-[#9B8B8B]">{accNum}</td>
                          <td className="px-3 py-2 font-semibold text-[#1A0A0A]">{book.title}</td>
                          <td className="px-3 py-2 text-[#6B5B5B]">{book.author}</td>
                          <td className="px-3 py-2 text-[#6B5B5B]">{book.category}</td>
                          <td className="px-3 py-2 font-bold text-center">#{copyNum}</td>
                          <td className="px-3 py-2"><span className={`text-[10px] font-bold ${sc}`}>{status}</span></td>
                          <td className="px-3 py-2 font-mono text-[10px] text-[#A88020]">{book.shelf}</td>
                          <td className="px-3 py-2 text-[10px] text-[#6B5B5B]">{book.condition||'Good'}</td>
                          <td className="px-3 py-2">
                            {role === 'library_personnel' ? (<div className="flex gap-1">
                              <button onClick={()=>openLibEdit(book)} className="btn-outline px-2 py-1 text-[9px] font-bold">Edit</button>
                              <button onClick={()=>openLibAdjust(book)} className="btn-outline px-2 py-1 text-[9px] font-bold">+/-</button>
                              <button onClick={()=>handleLibToggleActive(book)} className={`px-2 py-1 text-[9px] font-bold rounded-lg border ${book.active?'border-red-200 text-[#991B1B]':'border-green-200 text-[#4A7C59]'}`}>{book.active?'Deact.':'Activate'}</button>
                              {!isRef&&<button onClick={()=>handleLibDelete(book)} className="px-2 py-1 text-[9px] font-bold rounded-lg border border-red-200 text-[#991B1B]">Del</button>}
                            </div>) : <span className="text-[9px] text-[#9B8B8B]">—</span>}
                          </td>
                        </tr>
                      )
                    })
                  })}
                </tbody>
              </table>
            </div>
            {showInvHistory && (
              <div className="bg-white rounded-2xl overflow-hidden border border-[#EDE0D4] shadow-sm mt-4">
                <div className="px-5 py-3 border-b border-[#EDE0D4]"><h3 className="font-bold text-sm text-[#1A0A0A]">Inventory Movement History</h3></div>
                <table className="w-full text-xs">
                  <thead><tr style={{background:'#FBF6EE'}}>{['Ref','Timestamp','Title','Type','Qty Change','Prev','Result','Actor','Reason'].map(h=>(<th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase text-[#6B5B5B]">{h}</th>))}</tr></thead>
                  <tbody className="divide-y divide-[#EDE0D4]">
                    {invHistory.map(h=>(<tr key={h.id} className="hover:bg-[#FBF6EE]"><td className="px-3 py-2 font-mono text-[10px] text-[#9B8B8B]">{h.ref}</td><td className="px-3 py-2 text-[#6B5B5B]">{h.timestamp}</td><td className="px-3 py-2 font-semibold">{h.title}</td><td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FBF6EE] text-[#6B5B5B]">{h.type}</span></td><td className="px-3 py-2 font-bold" style={{color:h.qtyChange>=0?'#4A7C59':'#991B1B'}}>{h.qtyChange>=0?'+':''}{h.qtyChange}</td><td className="px-3 py-2">{h.prevQty}</td><td className="px-3 py-2 font-bold">{h.resultQty}</td><td className="px-3 py-2 text-[#6B5B5B]">{h.actor}</td><td className="px-3 py-2 text-[#6B5B5B] max-w-[160px] truncate">{h.reason}</td></tr>))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── FINE MANAGEMENT ─────────────────────── */}


        {/* ── FINE MANAGEMENT ─────────────────────── */}
        {activeTab === 'fines' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-[#EDE0D4] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#1A0A0A]">Fine Management</h3>
                <div className="relative max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B8B]" />
                  <input placeholder="Search by title or student…" value={fineSearch} onChange={e => setFineSearch(e.target.value)}
                    className="inp w-full pl-9 pr-3 py-2 text-xs" />
                </div>
              </div>
              <p className="text-[10px] text-[#6B5B5B] mb-3">Library fines remain entirely within the Library Management Module.</p>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#FBF6EE', borderBottom: '1px solid #EDE0D4' }}>
                    {['Title', 'Student', 'Circ Ref', 'Fine', 'Status', 'Reason', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase text-[#6B5B5B]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE0D4]">
                  {circulation.filter(c => c.fineStatus !== 'none' && (!fineSearch || c.title.toLowerCase().includes(fineSearch.toLowerCase()) || c.studentId.includes(fineSearch))).map(c => (
                    <tr key={c.id} className="hover:bg-[#FBF6EE]">
                      <td className="px-4 py-3 font-semibold text-[#1A0A0A]">{c.title}</td>
                      <td className="px-4 py-3">{c.studentId}</td>
                      <td className="px-4 py-3 font-mono text-[#9B8B8B]">{c.id}</td>
                      <td className="px-4 py-3 font-bold text-[#991B1B]">₱ {c.fineAssessed.toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge color="red">{c.fineStatus}</Badge></td>
                      <td className="px-4 py-3 text-[#6B5B5B] max-w-[160px] truncate">{c.fineReason || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openFineModal('adjust', c)} className="btn-outline px-2 py-1 text-[9px] font-bold">Adjust</button>
                          <button onClick={() => openFineModal('reduce', c)} className="btn-outline px-2 py-1 text-[9px] font-bold">Reduce</button>
                          <button onClick={() => openFineModal('waive', c)} className="btn-outline px-2 py-1 text-[9px] font-bold">Waive</button>
                          <button onClick={() => openFineModal('settle', c)} className="btn-primary px-2 py-1 text-[9px] font-bold text-white">Settle</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FINE MODAL ──────────────────────────── */}
        {showFineModal && fineTarget && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#EDE0D4] animate-fade-in w-full max-w-lg overflow-hidden">
              <div className="px-7 py-5 flex items-center justify-between" style={{ background: '#3A0A0A', borderBottom: '3px solid #C8A227' }}>
                <div>
                  <h3 className="font-serif-sjsm font-bold text-lg text-white capitalize">{fineAction} Library Fine</h3>
                  <p className="text-[11px] text-white/60 mt-0.5">{fineTarget.title} — {fineTarget.studentId}</p>
                </div>
                <button onClick={() => setShowFineModal(false)} className="text-white/50 hover:text-white text-xl font-bold">&times;</button>
              </div>
              <div className="p-7 space-y-5">
                {(fineAction === 'adjust' || fineAction === 'reduce' || fineAction === 'assess') && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#6B5B5B] mb-2">Fine Amount (₱)</label>
                    <input type="number" min="0" value={fineAmount} onChange={e => setFineAmount(e.target.value)}
                      className="inp w-full px-4 py-3 text-sm font-bold" />
                  </div>
                )}
                {fineAction === 'waive' && (
                  <div className="p-4 rounded-xl bg-[#FBF6EE] text-xs text-[#6B5B5B]">
                    You are waiving the fine of <span className="font-bold text-[#991B1B]">₱ {fineTarget.fineAssessed.toFixed(2)}</span>.
                  </div>
                )}
                {fineAction === 'settle' && (
                  <div className="p-4 rounded-xl bg-[#FBF6EE] text-xs text-[#6B5B5B]">
                    You are settling the fine of <span className="font-bold text-[#991B1B]">₱ {fineTarget.fineAssessed.toFixed(2)}</span>. This records the fine as paid within the Library module only.
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6B5B5B] mb-2">Audit Reason (required)</label>
                  <input type="text" value={fineReason} onChange={e => setFineReason(e.target.value)}
                    className="inp w-full px-4 py-3 text-sm" placeholder="Reason for this action…" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button onClick={() => setShowFineModal(false)} className="btn-outline py-3 text-sm font-bold">Cancel</button>
                  <button onClick={handleFineAction} className="btn-primary py-3 text-sm font-bold text-white" style={{ background: '#6B1A1A' }}>
                    Confirm {fineAction}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOK DETAIL MODAL ───────────────────── */}
        {selectedBookDetail && (() => {
          const detailCoverUrl = getBookCoverUrl(selectedBookDetail)
          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedBookDetail(null)}>
              <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#EDE0D4] overflow-hidden shadow-2xl animate-scale-up grid grid-cols-1 md:grid-cols-[340px_1fr]" onClick={e => e.stopPropagation()}>
                
                {/* Full-Bleed Book Cover Left Pane */}
                <div className="relative bg-[#1A0A0A] border-r border-[#EDE0D4] flex flex-col items-center justify-center min-h-[460px] overflow-hidden group select-none">
                  
                  {/* Subtle Blurred Ambient Backdrop of the cover for depth */}
                  {detailCoverUrl && (
                    <img 
                      src={detailCoverUrl} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none" 
                    />
                  )}

                  {/* Animated Skeleton Loading State */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-pulse bg-[#251210] z-0">
                    <div className="w-16 h-16 rounded-full bg-white/10 mb-4 flex items-center justify-center">
                      <BookOpen size={30} className="text-[#c8a227]/70" />
                    </div>
                    <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-white/10 rounded" />
                    <p className="text-[11px] text-[#c8a227]/60 font-semibold mt-4">Loading Official Cover Art...</p>
                  </div>

                  {/* Full-Bleed High-Res Cover Image */}
                  {detailCoverUrl ? (
                    <img 
                      src={detailCoverUrl} 
                      alt={selectedBookDetail.title} 
                      className="relative z-10 w-full h-full object-contain md:object-cover max-h-[560px] shadow-2xl transition-transform duration-500 group-hover:scale-102"
                      onLoad={(e) => {
                        e.target.style.opacity = '1'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease-in' }}
                    />
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center text-white/70">
                      <BookOpen size={48} className="text-[#c8a227] mb-3" />
                      <p className="font-bold text-sm text-white">{selectedBookDetail.title}</p>
                      <p className="text-xs text-white/60 mt-1">by {selectedBookDetail.author}</p>
                    </div>
                  )}

                  {/* ISBN Overlay Badge (Bottom Left) */}
                  <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-mono text-white/90 shadow-md">
                    ISBN: {selectedBookDetail.isbn || 'Unregistered'}
                  </div>
                </div>

                {/* Book Information Panel */}
                <div className="p-8 flex flex-col justify-between relative">
                  <button onClick={() => setSelectedBookDetail(null)} className="hidden md:block absolute top-5 right-5 p-2 rounded-full bg-[#FBF6EE] text-[#6B5B5B] hover:text-black transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-bold text-[#A88020] bg-[#FBF6EE] px-2.5 py-1 rounded uppercase tracking-wider">
                        {selectedBookDetail.category}
                      </span>
                      <h3 className="font-bold text-xl md:text-2xl text-[#1A0A0A] font-serif-sjsm mt-2 leading-tight">
                        {selectedBookDetail.title}
                      </h3>
                      <p className="text-sm text-[#6B5B5B] mt-1.5 font-medium">by {selectedBookDetail.author}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-[#EDE0D4] py-5 text-xs">
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE0D4]/60">
                        <span className="text-[#9B8B8B] block text-[10px] uppercase font-bold mb-0.5">Shelf Location</span>
                        <span className="text-[#1A0A0A] font-bold text-sm">{selectedBookDetail.shelf}</span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE0D4]/60">
                        <span className="text-[#9B8B8B] block text-[10px] uppercase font-bold mb-0.5">Circulation Availability</span>
                        <span className="text-[#1A0A0A] font-bold text-sm">
                          {selectedBookDetail.copiesAvailable} / {selectedBookDetail.totalCopies} Available
                        </span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE0D4]/60">
                        <span className="text-[#9B8B8B] block text-[10px] uppercase font-bold mb-0.5">Physical Condition</span>
                        <span className="text-[#1A0A0A] font-semibold">{selectedBookDetail.condition || 'Good'}</span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE0D4]/60">
                        <span className="text-[#9B8B8B] block text-[10px] uppercase font-bold mb-0.5">Publication Year</span>
                        <span className="text-[#1A0A0A] font-semibold">{selectedBookDetail.published} ({selectedBookDetail.pages} pages)</span>
                      </div>
                    </div>

                    {/* Synopsis & Summary Section */}
                    {selectedBookDetail.synopsis && (
                      <div className="space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EDE0D4]/70">
                        <span className="text-[#9B8B8B] block text-[10px] uppercase font-bold tracking-wider">
                          Book Synopsis & Description
                        </span>
                        <p className="text-xs text-[#4a3b3b] leading-relaxed max-h-36 overflow-y-auto pr-1">
                          {selectedBookDetail.synopsis}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${selectedBookDetail.available ? 'bg-green-50 text-[#4A7C59] border border-green-200' : 'bg-red-50 text-[#991B1B] border border-red-200'}`}>
                      {selectedBookDetail.available ? 'Available for Checkout' : 'Currently Loaned Out'}
                    </span>
                    <button onClick={() => setSelectedBookDetail(null)} className="btn-primary text-xs px-6 py-2.5 font-bold shadow-sm">
                      Close Window
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Add Book Modal with Online API Lookup */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#EDE0D4] animate-fade-in text-xs">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif-sjsm font-bold text-base text-[#1A0A0A]">Add Book to Catalog</h3>
                <p className="text-[11px] text-[#6B5B5B]">Register book via ISBN online lookup or manual entry</p>
              </div>
              <button onClick={()=>setShowAddBookModal(false)} className="text-gray-400 hover:text-black font-bold text-base">&times;</button>
            </div>

            {/* ISBN Online Lookup Strip */}
            <div className="p-3 bg-[#FBF6EE] rounded-xl border border-[#EDE0D4] space-y-2">
              <label className="block text-[10px] font-bold uppercase text-[#6B5B5B]">
                Online ISBN Auto-Fetch (Open Library API)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newBookIsbn} 
                  onChange={e => setNewBookIsbn(e.target.value)} 
                  placeholder="e.g. 9780132350884 or 9780131495463"
                  className="inp flex-1 px-3 py-2 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleLookupIsbn}
                  disabled={isSearchingApi}
                  className="px-3 py-2 bg-[#611a17] text-white font-bold rounded-lg hover:bg-[#4e1412] text-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  {isSearchingApi ? 'Looking up...' : 'Lookup Online'}
                </button>
              </div>
              {apiSearchMsg && (
                <p className={`text-[10px] font-medium ${apiSearchMsg.startsWith('✓') ? 'text-emerald-700 font-bold' : 'text-amber-800'}`}>
                  {apiSearchMsg}
                </p>
              )}
            </div>

            {/* Cover Preview If Available */}
            {newBookCoverUrl && (
              <div className="flex items-center gap-3 p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                <img src={newBookCoverUrl} alt="Cover preview" className="w-10 h-14 object-cover rounded shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[11px] text-stone-800 truncate">Online Cover Detected</p>
                  <p className="text-[10px] text-stone-500">Thumbnail will be attached to catalog record</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAddBook} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Title</label>
                <input type="text" required value={newBookTitle} onChange={e=>setNewBookTitle(e.target.value)} className="inp w-full px-3 py-2 text-xs font-semibold" placeholder="Book title"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Author</label>
                <input type="text" required value={newBookAuthor} onChange={e=>setNewBookAuthor(e.target.value)} className="inp w-full px-3 py-2 text-xs" placeholder="Author name"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Category</label>
                  <select value={newBookCategory} onChange={e=>setNewBookCategory(e.target.value)} className="inp w-full px-2 py-2 text-xs font-semibold">
                    {['Science & Physics','Chemistry & Biology','World History','Mathematics','Literature'].map(c=>(<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Shelf Location</label>
                  <input type="text" value={newBookShelf} onChange={e=>setNewBookShelf(e.target.value)} className="inp w-full px-3 py-2 text-xs" placeholder="Shelf A-01"/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">
                  Synopsis / Description (Optional or Auto-Fetched)
                </label>
                <textarea 
                  rows={3}
                  value={newBookSynopsis} 
                  onChange={e=>setNewBookSynopsis(e.target.value)} 
                  className="inp w-full px-3 py-2 text-xs leading-relaxed" 
                  placeholder="Summary of the book content…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={()=>setShowAddBookModal(false)} className="btn-outline py-2.5 text-xs font-bold">Cancel</button>
                <button type="submit" className="btn-primary py-2.5 text-xs font-bold text-white" style={{background:'#6B1A1A'}}>Add to Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Library Edit Modal */}
      {showLibEditModal && editBook && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#EDE0D4] animate-fade-in text-xs">
            <div className="flex justify-between items-start"><div><h3 className="font-serif-sjsm font-bold text-base text-[#1A0A0A]">Edit Catalog Entry</h3></div><button onClick={()=>setShowLibEditModal(false)} className="text-gray-400 hover:text-black font-bold text-base">&times;</button></div>
            <form onSubmit={handleLibEdit} className="space-y-3.5">
              <div><label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Title</label><input type="text" required value={eTitle} onChange={e=>setETitle(e.target.value)} className="inp w-full px-3 py-2 text-xs font-semibold"/></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Author</label><input type="text" required value={eAuthor} onChange={e=>setEAuthor(e.target.value)} className="inp w-full px-3 py-2 text-xs"/></div><div><label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Genre</label><select value={eCategory} onChange={e=>setECategory(e.target.value)} className="inp w-full px-2 py-2 text-xs font-semibold">{['Science & Physics','Chemistry & Biology','World History','Mathematics','Literature'].map(c=><option key={c} value={c}>{c}</option>)}</select></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Shelf</label><input type="text" value={eShelf} onChange={e=>setEShelf(e.target.value)} className="inp w-full px-3 py-2 text-xs"/></div><div><label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Condition</label><select value={eCondition} onChange={e=>setECondition(e.target.value)} className="inp w-full px-2 py-2 text-xs font-semibold">{['Good','Damaged','Lost'].map(c=><option key={c} value={c}>{c}</option>)}</select></div></div>
              <div className="grid grid-cols-2 gap-3 pt-2"><button type="button" onClick={()=>setShowLibEditModal(false)} className="btn-outline py-2.5 text-xs font-bold">Cancel</button><button type="submit" className="btn-primary py-2.5 text-xs font-bold text-white" style={{background:'#6B1A1A'}}>Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Library Adjust Stock Modal */}
      {showLibAdjModal && adjBook && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#EDE0D4] animate-fade-in text-xs">
            <div className="flex justify-between items-start"><div><h3 className="font-serif-sjsm font-bold text-base text-[#1A0A0A]">Adjust Copies — {adjBook.title}</h3><p className="text-[11px] text-[#6B5B5B]">Total: {adjBook.totalCopies} · Available: {adjBook.copiesAvailable}</p></div><button onClick={()=>setShowLibAdjModal(false)} className="text-gray-400 hover:text-black font-bold text-base">&times;</button></div>
            <form onSubmit={handleLibAdjust} className="space-y-3.5">
              <div><label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Adjustment Type</label><div className="grid grid-cols-3 gap-2">{[{k:'copy_add',l:'Add'},{k:'copy_remove',l:'Remove'},{k:'copy_correct',l:'Set Exact'}].map(t=><button key={t.k} type="button" onClick={()=>setLibAdjType(t.k)} className={`py-2 rounded-lg border text-xs font-bold ${libAdjType===t.k?'bg-[#6B1A1A] border-[#6B1A1A] text-white':'border-[#EDE0D4] text-[#6B5B5B]'}`}>{t.l}</button>)}</div></div>
              <div><label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Quantity</label><input type="number" required min="1" value={libAdjQty} onChange={e=>setLibAdjQty(e.target.value)} className="inp w-full px-3 py-2 text-xs font-bold"/></div>
              <div className="p-2 rounded-lg bg-[#FBF6EE] text-[10px]"><div className="flex justify-between"><span>Previous:</span><span className="font-bold">{adjBook.totalCopies}</span></div><div className="flex justify-between"><span>Result:</span><span className="font-bold">{Math.max(0,libAdjType==='copy_correct'?parseInt(libAdjQty||0):adjBook.totalCopies+(libAdjType==='copy_remove'?-Math.abs(parseInt(libAdjQty||0)):Math.abs(parseInt(libAdjQty||0))))}</span></div></div>
              <div><label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Reason (required)</label><input type="text" required value={libAdjReason} onChange={e=>setLibAdjReason(e.target.value)} className="inp w-full px-3 py-2 text-xs" placeholder="e.g. New copies from publisher"/></div>
              <div className="grid grid-cols-2 gap-3 pt-2"><button type="button" onClick={()=>setShowLibAdjModal(false)} className="btn-outline py-2.5 text-xs font-bold">Cancel</button><button type="submit" className="btn-primary py-2.5 text-xs font-bold text-white" style={{background:'#6B1A1A'}}>Confirm</button></div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
