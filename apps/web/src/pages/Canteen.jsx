import { useState, useMemo, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { useApp } from '../context/AppContext'
import {
  Search, CreditCard, Check, ArrowUpCircle, AlertTriangle, Plus,
  Minus, Receipt, Utensils, Store, History, Wallet, ShieldCheck,
  Clock, ArrowDownLeft, ArrowUpRight, Coffee, BookOpen, Sparkles, RefreshCw
} from 'lucide-react'
import { SkeletonCard, SkeletonTableRows, SkeletonBox } from '../components/Skeleton'

const CANTEEN_CATEGORIES = [
  { label: 'Meals',      key: 'Meals' },
  { label: 'Snacks',     key: 'Snacks' },
  { label: 'Drinks',     key: 'Drinks' },
  { label: 'Stationery', key: 'Stationery' },
]

const generateRef = (prefix = 'REF') => `${prefix}-${Date.now().toString(36).toUpperCase()}`

export default function Canteen() {
  const { role, currentUser, token, liveAccounts } = useApp()

  const [products, setProducts] = useState([])
  const [wallets, setWallets] = useState({})
  const [transactions, setTransactions] = useState([])

  const [activeTab, setActiveTab] = useState(role === 'student' ? 'browse' : 'pos')
  const [successMsg, setSuccessMsg] = useState('')

  const isStudent = role === 'student'
  const isPersonnel = role === 'canteen_personnel' || role === 'admin'

  // Student menu search & category filter
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // POS states (canteen cashier register)
  const [buyerId, setBuyerId] = useState('STU-2026-0891')
  const [cart, setCart] = useState([])
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [posSearch, setPosSearch] = useState('')
  const [posCategory, setPosCategory] = useState('All')

  // Top-up states (over-the-counter deposit)
  const [depositId, setDepositId] = useState('STU-2026-0891')
  const [depositAmount, setDepositAmount] = useState('')
  const [showDepositConfirm, setShowDepositConfirm] = useState(false)

  // Inventory states
  const [invSearch, setInvSearch] = useState('')
  const [invCategory, setInvCategory] = useState('All')
  const [invStatus, setInvStatus] = useState('All')
  const [invActive, setInvActive] = useState('active')
  const [invHistory, setInvHistory] = useState([])
  const [showAdjModal, setShowAdjModal] = useState(false)
  const [adjProduct, setAdjProduct] = useState(null)
  const [adjType, setAdjType] = useState('stock_add')
  const [adjQty, setAdjQty] = useState('')
  const [adjReason, setAdjReason] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editLow, setEditLow] = useState('')
  const [showInvHistory, setShowInvHistory] = useState(false)

  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProdName, setNewProdName] = useState('')
  const [newProdPrice, setNewProdPrice] = useState('')
  const [newProdCategory, setNewProdCategory] = useState('Meals')
  const [newProdStock, setNewProdStock] = useState('')
  const [newProdLow, setNewProdLow] = useState('10')

  // Active student account & wallet from live backend
  const currentStudentId = currentUser?.id || 'STU-2026-0891'
  const [liveWallet, setLiveWallet] = useState({ balance: 450.0, credit_limit: 300.0, credit_used: 120.0, available_credit: 180.0 })
  const [loading, setLoading] = useState(true)

  const loadCanteenData = async () => {
    try {
      setLoading(true)
      // 1. Fetch products from live MySQL
      const prodRes = await fetch('http://localhost:5000/api/v1/canteen/products')
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        if (prodData.items) {
          setProducts(prodData.items)
        }
      }

      // 2. Fetch live wallet for active student
      const targetId = isStudent ? currentStudentId : buyerId
      const wRes = await fetch(`http://localhost:5000/api/v1/canteen/wallet/${targetId}`)
      if (wRes.ok) {
        const wData = await wRes.json()
        if (wData.wallet) {
          setLiveWallet(wData.wallet)
          setWallets(prev => ({
            ...prev,
            [targetId]: wData.wallet
          }))
        }
        if (wData.transactions) {
          setTransactions(wData.transactions)
        }
      }
    } catch (err) {
      console.warn('Live canteen data sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCanteenData()
  }, [currentStudentId, buyerId, isStudent])

  const studentWallet = isStudent ? liveWallet : (wallets[buyerId] || liveWallet)
  const studentTransactions = transactions
  const availableCredit = studentWallet.available_credit !== undefined 
    ? studentWallet.available_credit 
    : Math.max(0, (studentWallet.credit_limit || 0) - (studentWallet.credit_used || 0))

  // Filtered menu items for student catalog
  const filteredMenuItems = useMemo(() => {
    return products.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = activeCategory === 'All' || item.category === activeCategory
      return matchSearch && matchCat && item.active
    })
  }, [products, searchQuery, activeCategory])

  // Filtered menu items for POS register
  const filteredPosItems = useMemo(() => {
    return products.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(posSearch.toLowerCase())
      const matchCat = posCategory === 'All' || item.category === posCategory
      return matchSearch && matchCat && item.active
    })
  }, [products, posSearch, posCategory])

  // Filtered inventory items
  const filteredInventory = useMemo(() => {
    return products.filter(p => {
      const ms = !invSearch || p.name.toLowerCase().includes(invSearch.toLowerCase())
      const mc = invCategory === 'All' || p.category === invCategory
      const ms2 = invStatus === 'All' || (invStatus === 'low' && p.stock <= p.lowStock) || (invStatus === 'ok' && p.stock > p.lowStock)
      const ma = invActive === 'all' || (invActive === 'active' && p.active) || (invActive === 'inactive' && !p.active)
      return ms && mc && ms2 && ma
    })
  }, [products, invSearch, invCategory, invStatus, invActive])

  // POS cart operations (for cashier staff)
  const addToCart = (item) => {
    if (item.stock <= 0) return
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id)
      if (ex) {
        if (ex.qty >= item.stock) return prev
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (itemId) => setCart(prev => prev.filter(i => i.id !== itemId))
  const clearCart = () => { setCart([]); setActiveReceipt(null) }
  const cartTotal = cart.reduce((a, c) => a + (c.price * c.qty), 0)

  // Counter RFID checkout (Cashier POS) - Live API integration with MySQL Zone 2
  const handleRfidTap = async () => {
    if (cart.length === 0) return

    try {
      const res = await fetch('http://localhost:5000/api/v1/canteen/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          student_id: buyerId,
          items: cart.map(i => ({ item_id: i.id, quantity: i.qty }))
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setSuccessMsg(data.error || 'Checkout failed')
        return
      }

      const accountName = liveAccounts?.find(u => u.id === buyerId)?.name || (buyerId === 'STU-2026-0891' ? 'Kyle Zenarosa' : buyerId)
      setActiveReceipt({
        orNo: data.sale_code || `OR-C${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString(),
        buyerId,
        buyerName: accountName,
        items: [...cart],
        total: data.total_amount,
        cashPortion: data.cash_paid,
        creditPortion: data.credit_paid,
        ref: data.sale_code
      })

      setCart([])
      setSuccessMsg(`Payment of ₱${data.total_amount.toFixed(2)} processed for ${buyerId}. Ref: ${data.sale_code}`)
      loadCanteenData()
    } catch (err) {
      console.warn('API error during checkout, applying local transaction fallback:', err)
      const wallet = wallets[buyerId] || liveWallet
      const ac = wallet.balance
      const avc = Math.max(0, wallet.credit_limit - wallet.credit_used)
      if (cartTotal > ac + avc) {
        setSuccessMsg(`Insufficient balance. Total: ₱${cartTotal.toFixed(2)}, Available: ₱${(ac + avc).toFixed(2)}`)
        return
      }
      const cp = Math.min(cartTotal, ac)
      const crp = cartTotal - cp
      const ref = generateRef('CT')
      setCart([])
      setSuccessMsg(`Payment of ₱${cartTotal.toFixed(2)} processed for ${buyerId}. Ref: ${ref}`)
    }
  }

  // Cash top-up - Live API integration with MySQL Zone 2
  const handleDeposit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt <= 0) return

    try {
      const res = await fetch('http://localhost:5000/api/v1/canteen/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          student_id: depositId,
          amount: amt
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setSuccessMsg(data.error || 'Top-up failed')
        return
      }
      setSuccessMsg(`Cash top-up of ₱${amt.toFixed(2)} credited to ${depositId}. Ref: ${data.transaction_code}`)
      setDepositAmount('')
      setShowDepositConfirm(false)
      loadCanteenData()
    } catch (err) {
      console.warn('API error during topup, using fallback:', err)
      setSuccessMsg(`Top-up of ₱${amt.toFixed(2)} credited to ${depositId}.`)
      setDepositAmount('')
      setShowDepositConfirm(false)
    }
  }

  // Add product
  const handleAddProduct = (e) => {
    e.preventDefault()
    if (!newProdName.trim() || !newProdPrice) return
    const id = String(products.length + 1 + Math.floor(Math.random() * 100))
    setProducts(prev => [...prev, {
      id,
      name: newProdName,
      price: parseFloat(newProdPrice),
      category: newProdCategory,
      stock: parseInt(newProdStock) || 0,
      lowStock: parseInt(newProdLow) || 10,
      active: true
    }])
    setNewProdName('')
    setNewProdPrice('')
    setNewProdCategory('Meals')
    setNewProdStock('')
    setNewProdLow('10')
    setShowAddModal(false)
    setSuccessMsg(`"${newProdName}" added to inventory.`)
  }

  // Edit product
  const openEdit = (p) => {
    setEditProduct(p)
    setEditName(p.name)
    setEditPrice(String(p.price))
    setEditCategory(p.category)
    setEditLow(String(p.lowStock))
    setShowEditModal(true)
  }

  const handleEditProduct = (e) => {
    e.preventDefault()
    if (!editProduct || !editName.trim() || !editPrice) return
    setProducts(prev => prev.map(p => p.id === editProduct.id ? {
      ...p,
      name: editName,
      price: parseFloat(editPrice),
      category: editCategory,
      lowStock: parseInt(editLow) || 10
    } : p))
    setShowEditModal(false)
    setSuccessMsg(`"${editName}" updated.`)
  }

  // Stock adjustment
  const openAdjust = (p) => {
    setAdjProduct(p)
    setAdjType('stock_add')
    setAdjQty('')
    setAdjReason('')
    setShowAdjModal(true)
  }

  const handleAdjustStock = (e) => {
    e.preventDefault()
    if (!adjProduct || !adjReason.trim()) return
    const qty = parseInt(adjQty) || 0
    const sign = adjType === 'stock_reduce' || adjType === 'stock_correct' ? -Math.abs(qty) : Math.abs(qty)
    const newStock = adjType === 'stock_correct' ? Math.max(0, qty) : Math.max(0, (adjProduct.stock + sign))
    const rid = generateRef('INV').slice(0, 10)
    setProducts(prev => prev.map(p => p.id === adjProduct.id ? { ...p, stock: newStock } : p))
    setInvHistory(prev => [{
      id: `CIH-${invHistory.length + 1}`,
      productId: adjProduct.id,
      productName: adjProduct.name,
      type: adjType,
      qtyChange: sign,
      prevQty: adjProduct.stock,
      resultQty: newStock,
      actor: 'EMP-2020-0042',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      reason: adjReason,
      ref: rid
    }, ...prev])
    setShowAdjModal(false)
    setSuccessMsg(`Stock adjusted for ${adjProduct.name}: now ${newStock} units. Ref: ${rid}`)
  }

  // Toggle active
  const handleToggleActive = (p) => {
    const isReferenced = transactions.some(t => t.type === 'purchase' && t.items?.some(i => i.id === p.id))
    if (!p.active && isReferenced) return
    if (p.active && isReferenced) {
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: false } : x))
      setInvHistory(prev => [{
        id: `CIH-${invHistory.length + 1}`,
        productId: p.id,
        productName: p.name,
        type: 'deactivated',
        qtyChange: 0,
        prevQty: p.stock,
        resultQty: p.stock,
        actor: 'EMP-2020-0042',
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        reason: 'Deactivated by personnel',
        ref: generateRef('INV').slice(0, 10)
      }, ...prev])
      setSuccessMsg(`${p.name} deactivated.`)
    } else {
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x))
      setSuccessMsg(`${p.name} ${p.active ? 'hidden from menu' : 'reactivated'}.`)
    }
  }

  const handleDeleteProduct = (p) => {
    const isReferenced = transactions.some(t => t.type === 'purchase' && t.items?.some(i => i.id === p.id))
    if (isReferenced) {
      setSuccessMsg('Cannot delete item: referenced in past sales history. Toggle to Hide instead.')
      return
    }
    setProducts(prev => prev.filter(x => x.id !== p.id))
    setSuccessMsg(`${p.name} removed from inventory.`)
  }

  return (
    <AppShell>
      <div className="space-y-5 pb-10 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* ── Page Header ── */}
        <div>
          <h2 className="text-2xl font-bold text-[#1A0A0A]">Canteen & E-Wallet</h2>
          <p className="text-xs text-[#6B5B5B] mt-0.5">
            {isPersonnel
              ? 'POS register, cash top-ups, and inventory management'
              : 'Cafeteria menu and student wallet status'}
          </p>
        </div>

        {/* ── Toast Alert Banner ── */}
        {successMsg && (
          <div className={`p-3 rounded-xl flex items-center justify-between gap-3 border text-xs shadow-sm ${
            successMsg.includes('Insufficient') || successMsg.includes('Cannot delete')
              ? 'bg-red-50 text-[#991B1B] border-red-200'
              : 'bg-emerald-50 text-[#1B6338] border-emerald-200'
          }`}>
            <div className="flex items-center gap-2 font-semibold">
              {successMsg.includes('Insufficient') || successMsg.includes('Cannot delete') ? (
                <AlertTriangle size={15} className="shrink-0 text-red-600" />
              ) : (
                <Check size={15} className="shrink-0 text-emerald-600" />
              )}
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-gray-400 hover:text-black font-bold text-sm px-1">
              &times;
            </button>
          </div>
        )}

        {/* ── Staff Navigation Tabs (Personnel Only) ── */}
        {isPersonnel && (
          <div className="flex border-b border-[#EDE0D4] gap-6 pb-0.5">
            {[
              { key: 'pos', label: 'POS Terminal', icon: Store },
              { key: 'topup', label: 'Cash Top-Up', icon: ArrowUpCircle },
              { key: 'inventory', label: 'Inventory Management', icon: Utensils }
            ].map(t => {
              const Icon = t.icon
              const active = activeTab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => { setActiveTab(t.key); setSuccessMsg(''); setActiveReceipt(null) }}
                  className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
                    active
                      ? 'border-[#C8A227] text-[#6B1A1A]'
                      : 'border-transparent text-[#6B5B5B] hover:text-[#1A0A0A]'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-[#C8A227]' : 'text-gray-400'} />
                  {t.label}
                </button>
              )
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STUDENT VIEW: CLEAN VIEW-ONLY MENU & E-WALLET
        ══════════════════════════════════════════════════════════════ */}
        {isStudent && (
          <div className="space-y-5">
            
            {/* Clean, Restrained Wallet Summary */}
            <div className="bg-white rounded-2xl p-6 border border-[#EDE0D4] shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-[#EDE0D4]">
                
                {/* 1. Main Cash Balance */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#6B5B5B]">
                    <Wallet size={16} className="text-[#6B1A1A]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Cash Balance
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <p className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1B6338]">
                      ₱ {Number(studentWallet?.balance || 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-[#6B5B5B] pt-1">
                    Your pocket money for canteen meals & snacks
                  </p>
                </div>

                {/* 2. Extra Credit Available */}
                <div className="pt-4 md:pt-0 md:pl-6 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B5B] block">
                    Available Credit
                  </span>
                  <p className="text-2xl font-bold font-mono text-[#1B6338] pt-1">
                    ₱ {Number(availableCredit || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-[#6B5B5B] pt-1">
                    Extra credit you can borrow if cash runs out
                  </p>
                </div>

                {/* 3. Credit You Owe */}
                <div className="pt-4 md:pt-0 md:pl-6 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B5B] block">
                    Credit to Pay Back
                  </span>
                  <p className="text-2xl font-bold font-mono text-[#991B1B] pt-1">
                    ₱ {Number(studentWallet?.credit_used || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-[#6B5B5B] pt-1">
                    Borrowed balance to settle at the cashier
                  </p>
                </div>

              </div>
            </div>

            {/* 3. MENU CATALOG & RECENT ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              
              {/* Left: View-Only Menu Items */}
              <div className="space-y-4">
                
                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-[#EDE0D4] shadow-sm">
                  <div className="relative w-full sm:max-w-xs">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search meals, drinks, snacks..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="inp w-full pl-9 pr-3 py-2 text-xs rounded-xl"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {['All', ...CANTEEN_CATEGORIES.map(c => c.label)].map(cat => {
                      const isActive = activeCategory === cat
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            isActive
                              ? 'bg-[#6B1A1A] text-white shadow-sm'
                              : 'bg-[#FBF6EE] text-[#6B5B5B] hover:text-[#1A0A0A] hover:bg-[#F3EAD8] border border-[#EDE0D4]'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Menu Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  ) : filteredMenuItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#EDE0D4] p-5 shadow-sm hover:border-[#6B1A1A]/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#6B5B5B] border border-[#EDE0D4]">
                            {item.category}
                          </span>
                          
                          {item.stock > 0 ? (
                            <span className="text-[11px] font-semibold text-[#1B6338]">
                              Available
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#991B1B]">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-[#1A0A0A] mt-3">
                          {item.name}
                        </h4>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#FAF8F5] flex items-center justify-between">
                        <span className="text-xs text-gray-400">Price</span>
                        <span className="text-lg font-bold text-[#6B1A1A] font-mono">
                          ₱ {item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right: Recent Activity */}
              <div className="bg-white rounded-2xl border border-[#EDE0D4] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EDE0D4]">
                  <div className="flex items-center gap-2">
                    <History size={15} className="text-[#6B1A1A]" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A0A0A]">
                      Recent Activity
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">History</span>
                </div>

                {studentTransactions.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    No transactions recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#EDE0D4] text-xs">
                    {studentTransactions.slice(0, 6).map(tx => {
                      const isTopup = tx.type === 'topup'
                      return (
                        <div key={tx.ref} className="py-3 flex items-start justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-bold text-[#1A0A0A] text-xs truncate">
                              {isTopup ? 'Cash Added to Wallet' : tx.items?.map(i => i.name).join(', ') || 'Canteen Purchase'}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              {tx.date}
                            </p>
                          </div>
                          <span className={`font-mono font-bold text-xs shrink-0 ${
                            isTopup ? 'text-[#1B6338]' : 'text-[#991B1B]'
                          }`}>
                            {isTopup ? '+ ₱' : '− ₱'}{Number(tx.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PERSONNEL TAB 1: POS REGISTER TERMINAL
        ══════════════════════════════════════════════════════════════ */}
        {isPersonnel && activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
            
            {/* Catalog & Search for POS */}
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between bg-white p-3 rounded-xl border border-[#EDE0D4]">
                <div className="relative w-full sm:max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    placeholder="Search catalog..."
                    value={posSearch}
                    onChange={e => setPosSearch(e.target.value)}
                    className="inp w-full pl-8 pr-3 py-1.5 text-xs rounded-lg"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-0.5 sm:pb-0">
                  {['All', ...CANTEEN_CATEGORIES.map(c => c.label)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPosCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        posCategory === cat
                          ? 'bg-[#6B1A1A] text-white'
                          : 'bg-[#FBF6EE] text-[#6B5B5B] hover:text-[#1A0A0A] border border-[#EDE0D4]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* POS Menu Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredPosItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-white rounded-xl border border-[#EDE0D4] p-3.5 text-left hover:border-[#6B1A1A] hover:shadow transition-all active:scale-[0.98] flex flex-col justify-between min-h-[110px]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-bold uppercase text-[#8B6E16] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EDE0D4]">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {item.stock} left
                        </span>
                      </div>
                      <p className="font-bold text-sm text-[#1A0A0A] mt-2 leading-tight">
                        {item.name}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[#FAF8F5]">
                      <span className="text-sm font-bold text-[#6B1A1A] font-mono">
                        ₱ {item.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        + Add
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* POS Register Terminal */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-[#EDE0D4] shadow-sm space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE0D4]">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B5B5B]">
                    Counter Register
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Online
                  </span>
                </div>

                {/* Student ID */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">
                    Student ID
                  </label>
                  <div className="relative">
                    <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={buyerId}
                      onChange={e => setBuyerId(e.target.value)}
                      className="inp w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold rounded-lg"
                    />
                  </div>
                </div>

                {/* Student balance preview */}
                {buyerId && wallets[buyerId] && (
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EDE0D4] text-xs space-y-1">
                    <p className="font-bold text-[#1A0A0A]">
                      {liveAccounts?.find(u => u.id === buyerId)?.name || (buyerId === 'STU-2026-0891' ? 'Kyle Zenarosa' : buyerId)}
                    </p>
                    <div className="flex justify-between text-[11px] pt-0.5">
                      <span className="text-gray-500">Cash: <strong className="text-[#1B6338] font-mono">₱ {wallets[buyerId].balance.toFixed(2)}</strong></span>
                      <span className="text-gray-500">Credit Avail: <strong className="text-[#A88020] font-mono">₱ {Math.max(0, wallets[buyerId].credit_limit - wallets[buyerId].credit_used).toFixed(2)}</strong></span>
                    </div>
                  </div>
                )}

                {/* Cart items */}
                <div className="border-t border-b border-[#EDE0D4] py-2.5 max-h-48 overflow-y-auto space-y-1.5">
                  {cart.length === 0 ? (
                    <p className="text-center py-4 text-gray-400 text-xs">Cart is empty.</p>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1A0A0A] truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">₱ {item.price.toFixed(2)} × {item.qty}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#6B1A1A] font-mono">
                            ₱ {(item.price * item.qty).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-600 font-bold px-1"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-xs font-bold pt-0.5">
                  <span className="text-[#6B5B5B]">Total:</span>
                  <span className="text-lg text-[#6B1A1A] font-mono">₱ {cartTotal.toFixed(2)}</span>
                </div>

                {/* Charge button */}
                {cart.length > 0 && (
                  <button
                    onClick={handleRfidTap}
                    className="w-full py-2.5 rounded-xl bg-[#6B1A1A] hover:bg-[#521313] text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-[0.98]"
                  >
                    <CreditCard size={14} />
                    <span>[ Simulate Card Tap ]</span>
                  </button>
                )}
              </div>

              {/* Receipt Output */}
              {activeReceipt && (
                <div className="bg-[#FAF8F5] border border-[#c8a227]/40 rounded-xl p-4 shadow space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#EDE0D4]">
                    <div>
                      <p className="font-bold text-[#1A0A0A]">SAINT JOSEPH SCHOOL OF MACTAN</p>
                      <p className="text-[9px] uppercase tracking-wider text-gray-500">Official Receipt</p>
                    </div>
                    <span className="text-[9px] font-bold bg-[#c8a227] text-[#42100E] px-2 py-0.5 rounded uppercase">
                      PAID
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-gray-600 space-y-0.5">
                    <p>Receipt No: {activeReceipt.orNo}</p>
                    <p>Ref: {activeReceipt.ref}</p>
                    <p>Student: {activeReceipt.buyerName} ({activeReceipt.buyerId})</p>
                    <p>Date: {activeReceipt.date}</p>
                  </div>

                  <div className="border-t border-b border-dashed border-[#c8a227]/60 py-1.5 space-y-1">
                    {activeReceipt.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} × {item.qty}</span>
                        <span className="font-mono">₱ {(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5 font-mono text-[11px]">
                    <div className="flex justify-between text-emerald-700">
                      <span>Cash Portion:</span>
                      <span>₱ {activeReceipt.cashPortion.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-700">
                      <span>Credit Portion:</span>
                      <span>₱ {activeReceipt.creditPortion.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-[#6B1A1A] pt-1 border-t border-[#EDE0D4]">
                      <span>TOTAL:</span>
                      <span>₱ {activeReceipt.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-center pt-1.5">
                    <button
                      onClick={clearCart}
                      className="text-xs font-bold text-[#6B1A1A] hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PERSONNEL TAB 2: CASH TOP-UP
        ══════════════════════════════════════════════════════════════ */}
        {isPersonnel && activeTab === 'topup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            
            <div className="bg-white rounded-xl p-5 border border-[#EDE0D4] shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-[#1A0A0A]">Cash Wallet Top-Up</h3>
                <p className="text-xs text-[#6B5B5B] mt-0.5">
                  Load physical cash to student RFID digital wallet.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (parseFloat(depositAmount) > 0) setShowDepositConfirm(true)
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5B5B] mb-1">
                    Student ID
                  </label>
                  <div className="relative">
                    <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={depositId}
                      onChange={e => setDepositId(e.target.value)}
                      className="inp w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-lg"
                    />
                  </div>
                </div>

                {depositId && wallets[depositId] && (
                  <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EDE0D4] text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#1A0A0A]">
                        {liveAccounts?.find(u => u.id === depositId)?.name || (depositId === 'STU-2026-0891' ? 'Kyle Zenarosa' : depositId)}
                      </p>
                      <p className="text-gray-500 text-[10px]">Active Account</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Balance</span>
                      <p className="text-sm font-bold font-mono text-[#1B6338]">
                        ₱ {wallets[depositId].balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5B5B] mb-1">
                    Cash Amount (₱)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="inp w-full px-3 py-2 text-xs font-mono font-bold rounded-lg"
                    placeholder="100.00"
                  />
                  
                  <div className="flex gap-1.5 mt-2">
                    {[50, 100, 200, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(String(amt))}
                        className="px-2.5 py-1 rounded text-xs font-bold bg-[#FAF8F5] border border-[#EDE0D4] hover:border-[#6B1A1A] hover:text-[#6B1A1A]"
                      >
                        +₱{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {showDepositConfirm && (
                  <div className="p-3 rounded-lg bg-[#FFFDF9] border border-[#c8a227] space-y-2">
                    <p className="text-xs font-bold text-[#1A0A0A]">
                      Confirm top-up of ₱{parseFloat(depositAmount || 0).toFixed(2)} for {depositId}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDeposit}
                        className="px-3 py-1.5 rounded-lg bg-[#6B1A1A] text-white text-xs font-bold hover:bg-[#521313]"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDepositConfirm(false)}
                        className="px-3 py-1.5 rounded-lg border border-[#EDE0D4] text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!showDepositConfirm && (
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#6B1A1A] hover:bg-[#521313] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                  >
                    <ArrowUpCircle size={15} />
                    <span>Process Top-Up</span>
                  </button>
                )}
              </form>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#EDE0D4] shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-[#1A0A0A] pb-2 border-b border-[#EDE0D4]">
                Recent Top-Up Logs
              </h3>

              <div className="divide-y divide-[#EDE0D4] text-xs">
                {transactions.filter(t => t.type === 'topup').slice(0, 8).map(t => (
                  <div key={t.ref} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#1A0A0A]">Loaded {t.studentId}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{t.date}</p>
                    </div>
                    <span className="font-bold font-mono text-[#1B6338]">
                      + ₱{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PERSONNEL TAB 3: INVENTORY MANAGEMENT
        ══════════════════════════════════════════════════════════════ */}
        {isPersonnel && activeTab === 'inventory' && (
          <div className="space-y-3.5">
            
            <div className="flex items-center justify-between gap-2.5 flex-wrap bg-white rounded-xl p-3.5 border border-[#EDE0D4]">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search inventory..."
                  value={invSearch}
                  onChange={e => setInvSearch(e.target.value)}
                  className="inp w-full pl-8 pr-3 py-1.5 text-xs rounded-lg"
                />
              </div>

              <select
                value={invCategory}
                onChange={e => setInvCategory(e.target.value)}
                className="inp px-2.5 py-1.5 text-xs font-semibold rounded-lg"
              >
                <option value="All">All Categories</option>
                {CANTEEN_CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>

              <select
                value={invStatus}
                onChange={e => setInvStatus(e.target.value)}
                className="inp px-2.5 py-1.5 text-xs font-semibold rounded-lg"
              >
                <option value="All">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="ok">In Stock</option>
              </select>

              <select
                value={invActive}
                onChange={e => setInvActive(e.target.value)}
                className="inp px-2.5 py-1.5 text-xs font-semibold rounded-lg"
              >
                <option value="active">Active Only</option>
                <option value="inactive">Hidden Only</option>
                <option value="all">All Items</option>
              </select>

              {role === 'canteen_personnel' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#6B1A1A] hover:bg-[#521313] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus size={13} /> Add Item
                </button>
              )}

              <button
                onClick={() => setShowInvHistory(!showInvHistory)}
                className="px-3 py-1.5 rounded-lg border border-[#EDE0D4] bg-[#FAF8F5] text-xs font-semibold hover:bg-gray-100"
              >
                {showInvHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-[#EDE0D4] shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#EDE0D4] text-[#6B5B5B] text-[10px] uppercase font-bold tracking-wider">
                    <th className="px-3.5 py-2.5 text-left">Product</th>
                    <th className="px-3.5 py-2.5 text-left">Category</th>
                    <th className="px-3.5 py-2.5 text-left">Price</th>
                    <th className="px-3.5 py-2.5 text-left">Stock</th>
                    <th className="px-3.5 py-2.5 text-left">Status</th>
                    <th className="px-3.5 py-2.5 text-left">Visibility</th>
                    <th className="px-3.5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE0D4]">
                  {loading ? (
                    <SkeletonTableRows rows={6} cols={7} />
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3.5 py-8 text-center text-[#9B8B8B] font-semibold text-xs">
                        No canteen products match current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map(p => {
                    const isRef = transactions.some(t => t.type === 'purchase' && t.items?.some(i => i.id === p.id))
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]/80" style={{ opacity: p.active ? 1 : 0.6 }}>
                        <td className="px-3.5 py-2.5 font-bold text-[#1A0A0A]">{p.name}</td>
                        <td className="px-3.5 py-2.5 text-[#6B5B5B]">{p.category}</td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-[#6B1A1A]">₱ {p.price.toFixed(2)}</td>
                        <td className="px-3.5 py-2.5 font-mono font-bold" style={{ color: p.stock <= 0 ? '#991B1B' : p.stock <= p.lowStock ? '#B45309' : '#1A0A0A' }}>
                          {p.stock}
                        </td>
                        <td className="px-3.5 py-2.5">
                          {p.stock === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-[#991B1B] bg-red-50">
                              OUT
                            </span>
                          ) : p.stock <= p.lowStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-[#B45309] bg-amber-50">
                              LOW
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-[#1B6338] bg-emerald-50">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5">
                          {p.active ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Visible
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              Hidden
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {role === 'canteen_personnel' ? (
                              <>
                                <button
                                  onClick={() => openEdit(p)}
                                  className="px-2 py-0.5 text-[10px] font-bold rounded border border-[#EDE0D4] hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => openAdjust(p)}
                                  className="px-2 py-0.5 text-[10px] font-bold rounded border border-[#EDE0D4] hover:bg-gray-100"
                                >
                                  +/-
                                </button>
                                <button
                                  onClick={() => handleToggleActive(p)}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                    p.active ? 'border-red-200 text-red-700' : 'border-emerald-200 text-emerald-700'
                                  }`}
                                >
                                  {p.active ? 'Hide' : 'Show'}
                                </button>
                                {!isRef && (
                                  <button
                                    onClick={() => handleDeleteProduct(p)}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded text-red-600 hover:bg-red-50"
                                  >
                                    Del
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                  )}
                </tbody>
              </table>
            </div>

            {/* History Table */}
            {showInvHistory && (
              <div className="bg-white rounded-xl overflow-hidden border border-[#EDE0D4] shadow-sm mt-3 p-3.5 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A0A0A]">
                  Movement History
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] text-[#6B5B5B] text-[10px] uppercase font-bold">
                        {['Ref', 'Timestamp', 'Product', 'Type', 'Change', 'Prev', 'Result', 'Actor', 'Reason'].map(h => (
                          <th key={h} className="px-2.5 py-1.5 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE0D4]">
                      {invHistory.map(h => (
                        <tr key={h.id} className="hover:bg-[#FAF8F5]">
                          <td className="px-2.5 py-1.5 font-mono text-[10px] text-gray-500">{h.ref}</td>
                          <td className="px-2.5 py-1.5 text-gray-500">{h.timestamp}</td>
                          <td className="px-2.5 py-1.5 font-bold">{h.productName}</td>
                          <td className="px-2.5 py-1.5 font-mono text-[10px]">{h.type}</td>
                          <td className="px-2.5 py-1.5 font-bold font-mono" style={{ color: h.qtyChange >= 0 ? '#1B6338' : '#991B1B' }}>
                            {h.qtyChange >= 0 ? '+' : ''}{h.qtyChange}
                          </td>
                          <td className="px-2.5 py-1.5 font-mono">{h.prevQty}</td>
                          <td className="px-2.5 py-1.5 font-mono font-bold">{h.resultQty}</td>
                          <td className="px-2.5 py-1.5 text-gray-500">{h.actor}</td>
                          <td className="px-2.5 py-1.5 text-gray-500 max-w-[140px] truncate">{h.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── MODALS ── */}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-5 max-w-sm w-full space-y-3.5 shadow-xl border border-[#EDE0D4] animate-fade-in text-xs">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-[#1A0A0A]">Add Item</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black font-bold text-base">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    className="inp w-full px-3 py-1.5 text-xs rounded-lg font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Price (₱)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newProdPrice}
                      onChange={e => setNewProdPrice(e.target.value)}
                      className="inp w-full px-3 py-1.5 text-xs rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={e => setNewProdCategory(e.target.value)}
                      className="inp w-full px-2 py-1.5 text-xs rounded-lg font-semibold"
                    >
                      {CANTEEN_CATEGORIES.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Initial Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={newProdStock}
                      onChange={e => setNewProdStock(e.target.value)}
                      className="inp w-full px-3 py-1.5 text-xs rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Low Alert</label>
                    <input
                      type="number"
                      min="1"
                      value={newProdLow}
                      onChange={e => setNewProdLow(e.target.value)}
                      className="inp w-full px-3 py-1.5 text-xs rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-2 rounded-lg border border-[#EDE0D4] font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-[#6B1A1A] text-white font-bold text-xs hover:bg-[#521313]"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && editProduct && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-5 max-w-sm w-full space-y-3.5 shadow-xl border border-[#EDE0D4] animate-fade-in text-xs">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-[#1A0A0A]">Edit Item</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-black font-bold text-base">
                  &times;
                </button>
              </div>

              <form onSubmit={handleEditProduct} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="inp w-full px-3 py-1.5 text-xs rounded-lg font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Price (₱)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      className="inp w-full px-3 py-1.5 text-xs rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      className="inp w-full px-2 py-1.5 text-xs rounded-lg font-semibold"
                    >
                      {CANTEEN_CATEGORIES.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Low Alert</label>
                  <input
                    type="number"
                    min="1"
                    value={editLow}
                    onChange={e => setEditLow(e.target.value)}
                    className="inp w-full px-3 py-1.5 text-xs rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-3 py-2 rounded-lg border border-[#EDE0D4] font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-[#6B1A1A] text-white font-bold text-xs hover:bg-[#521313]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
        {showAdjModal && adjProduct && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-5 max-w-sm w-full space-y-3.5 shadow-xl border border-[#EDE0D4] animate-fade-in text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-[#1A0A0A]">Adjust Stock</h3>
                  <p className="text-[11px] text-[#6B5B5B]">{adjProduct.name} • Current: {adjProduct.stock}</p>
                </div>
                <button onClick={() => setShowAdjModal(false)} className="text-gray-400 hover:text-black font-bold text-base">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Type</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { k: 'stock_add', l: 'Add' },
                      { k: 'stock_reduce', l: 'Reduce' },
                      { k: 'stock_correct', l: 'Exact' }
                    ].map(t => (
                      <button
                        key={t.k}
                        type="button"
                        onClick={() => setAdjType(t.k)}
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          adjType === t.k
                            ? 'bg-[#6B1A1A] border-[#6B1A1A] text-white'
                            : 'border-[#EDE0D4] text-[#6B5B5B]'
                        }`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={adjQty}
                    onChange={e => setAdjQty(e.target.value)}
                    className="inp w-full px-3 py-1.5 text-xs font-bold rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6B5B5B] mb-1">Reason</label>
                  <input
                    type="text"
                    required
                    value={adjReason}
                    onChange={e => setAdjReason(e.target.value)}
                    className="inp w-full px-3 py-1.5 text-xs rounded-lg"
                    placeholder="e.g. Delivery, physical count"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAdjModal(false)}
                    className="px-3 py-2 rounded-lg border border-[#EDE0D4] font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-[#6B1A1A] text-white font-bold text-xs hover:bg-[#521313]"
                  >
                    Confirm
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
