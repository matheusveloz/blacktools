'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, BarChart3, Video, Clock, User as UserIcon, Search, ExternalLink, MessageSquare, Bug, Lightbulb, CreditCard, Sparkles, HelpCircle, Trash2, CheckSquare, Square, RefreshCw, Mic, Infinity, DollarSign, Calendar, Image, Target, Plus, Facebook, Tag, Eye, EyeOff, Edit2, Save, X } from 'lucide-react'
import { GENERATION_TYPE_CONFIG, API_COSTS } from '@/lib/constants'

interface MaintenanceSettings {
  enabled: boolean
  message: string
}

interface Stats {
  totalUsers: number
  activeSubscriptions: number
  totalGenerations: number
}

interface AdminUser {
  id: string
  email: string
  full_name: string
  subscription_plan: string | null
  subscription_status: string
  credits: number
  credits_extras: number
  created_at: string
}

interface Generation {
  id: string
  user_id: string
  type: string
  status: string
  created_at: string
  metadata: any
  user_email?: string
  result_url?: string
  cost?: number
}

interface Feedback {
  id: string
  user_id: string
  user_email: string
  category: string
  message: string
  status: string
  admin_notes: string | null
  created_at: string
  updated_at: string
}

const FEEDBACK_CATEGORIES = [
  { id: 'all', label: 'All', icon: MessageSquare },
  { id: 'bug', label: 'Bugs', icon: Bug },
  { id: 'improvement', label: 'Improvements', icon: Lightbulb },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'feature', label: 'Features', icon: Sparkles },
  { id: 'other', label: 'Other', icon: HelpCircle },
]

// Custom Banana icon for Nano Banana 2
const BananaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5" />
    <path d="M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11 3 11 3c1 0 4 0 6 2s3.5 4.5 3 8c-.5 3.5-3 6.5-6.5 8-3.5 1.5-7 1-9.85.11" />
  </svg>
)

// Get icon for generation type
const getTypeIcon = (type: string) => {
  const normalizedType = type.toLowerCase()
  switch (normalizedType) {
    case 'sora2':
      return <Video className="w-3.5 h-3.5" />
    case 'veo3':
      return <Sparkles className="w-3.5 h-3.5" />
    case 'lipsync':
      return <Mic className="w-3.5 h-3.5" />
    case 'infinitetalk':
      return <Infinity className="w-3.5 h-3.5" />
    case 'avatar':
    case 'nanobanana2':
      return <BananaIcon className="w-3.5 h-3.5" />
    default:
      return <Image className="w-3.5 h-3.5" />
  }
}

// Get display name for generation type
const getTypeName = (type: string): string => {
  const config = GENERATION_TYPE_CONFIG[type.toLowerCase()]
  return config?.name || type
}

// Get color for generation type
const getTypeColor = (type: string): string => {
  const config = GENERATION_TYPE_CONFIG[type.toLowerCase()]
  return config?.color || '#6b7280'
}

// Cost period options
const COST_PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7days', label: 'Last 7 Days' },
  { id: 'last30days', label: 'Last 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
]

interface CostsData {
  period: string
  startDate: string
  endDate: string
  totalCost: number
  totalGenerations: number
  costsByType: Record<string, { count: number; cost: number }>
  rates: Record<string, number>
}

interface Pixel {
  id: string
  type: 'facebook' | 'gtm'
  pixel_id: string
  access_token: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({
    enabled: false,
    message: 'We are under maintenance. We will be back soon!'
  })
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalGenerations: 0
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userGenerations, setUserGenerations] = useState<Generation[]>([])
  const [latestGenerations, setLatestGenerations] = useState<Generation[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingGenerations, setLoadingGenerations] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')

  // User cost tracking state
  const [userCostPeriod, setUserCostPeriod] = useState('thisMonth')
  const [userCustomStart, setUserCustomStart] = useState('')
  const [userCustomEnd, setUserCustomEnd] = useState('')
  const [userTotalCost, setUserTotalCost] = useState(0)
  const [userCompletedCount, setUserCompletedCount] = useState(0)

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({})
  const [selectedFeedbackCategory, setSelectedFeedbackCategory] = useState('all')
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<Set<string>>(new Set())
  const [deletingFeedback, setDeletingFeedback] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Costs state
  const [costsData, setCostsData] = useState<CostsData | null>(null)
  const [loadingCosts, setLoadingCosts] = useState(false)
  const [selectedCostPeriod, setSelectedCostPeriod] = useState('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Pixels state
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [loadingPixels, setLoadingPixels] = useState(false)
  const [showAddPixel, setShowAddPixel] = useState(false)
  const [newPixelType, setNewPixelType] = useState<'facebook' | 'gtm'>('facebook')
  const [newPixelId, setNewPixelId] = useState('')
  const [newAccessToken, setNewAccessToken] = useState('')
  const [savingPixel, setSavingPixel] = useState(false)
  const [editingPixel, setEditingPixel] = useState<string | null>(null)
  const [editPixelId, setEditPixelId] = useState('')
  const [editAccessToken, setEditAccessToken] = useState('')
  const [showTokens, setShowTokens] = useState<Set<string>>(new Set())

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single<{ is_admin: number }>()

      if (profile?.is_admin !== 1) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      setLoading(false)

      fetchMaintenance()
      fetchStats()
      fetchLatestGenerations()
    }

    checkAdmin()
  }, [router])

  // Fetch users when Users tab is opened
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers()
    }
  }, [activeTab, users.length])

  // Fetch feedback when Feedback tab is opened
  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback(selectedFeedbackCategory)
    }
  }, [activeTab, selectedFeedbackCategory])

  // Fetch costs when Costs tab is opened or period changes
  useEffect(() => {
    if (activeTab === 'costs') {
      if (selectedCostPeriod === 'custom') {
        if (customStartDate && customEndDate) {
          fetchCosts(selectedCostPeriod, customStartDate, customEndDate)
        }
      } else {
        fetchCosts(selectedCostPeriod)
      }
    }
  }, [activeTab, selectedCostPeriod, customStartDate, customEndDate])

  // Fetch pixels when Pixels tab is opened
  useEffect(() => {
    if (activeTab === 'pixels' && pixels.length === 0) {
      fetchPixels()
    }
  }, [activeTab, pixels.length])

  // Fetch user generations when user is selected or period changes
  useEffect(() => {
    if (selectedUserId) {
      if (userCostPeriod === 'custom') {
        if (userCustomStart && userCustomEnd) {
          fetchUserGenerations(selectedUserId, userCostPeriod, userCustomStart, userCustomEnd)
        }
      } else {
        fetchUserGenerations(selectedUserId, userCostPeriod)
      }
    }
  }, [selectedUserId, userCostPeriod, userCustomStart, userCustomEnd])

  const fetchMaintenance = async () => {
    const res = await fetch('/api/admin/maintenance')
    if (res.ok) {
      const data = await res.json()
      setMaintenance(data)
    }
  }

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats')
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchLatestGenerations = async () => {
    try {
      const res = await fetch('/api/admin/generations?latest=true')
      if (res.ok) {
        const data = await res.json()
        setLatestGenerations(data.generations || [])
      }
    } catch (error) {
      console.error('Failed to fetch latest generations:', error)
    }
  }

  const fetchUserGenerations = async (userId: string, period = 'thisMonth', start?: string, end?: string) => {
    setLoadingGenerations(true)
    try {
      let url = `/api/admin/generations?userId=${userId}&period=${period}`
      if (period === 'custom' && start && end) {
        url += `&start=${start}&end=${end}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setUserGenerations(data.generations || [])
        setUserTotalCost(data.totalCost || 0)
        setUserCompletedCount(data.completedCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user generations:', error)
    } finally {
      setLoadingGenerations(false)
    }
  }

  const fetchFeedback = async (category: string) => {
    setLoadingFeedback(true)
    try {
      const res = await fetch(`/api/admin/feedback?category=${category}`)
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data.feedbacks || [])
        setFeedbackCounts(data.counts || {})
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setLoadingFeedback(false)
    }
  }

  const fetchCosts = async (period: string, start?: string, end?: string) => {
    setLoadingCosts(true)
    try {
      let url = `/api/admin/costs?period=${period}`
      if (period === 'custom' && start && end) {
        url += `&start=${start}&end=${end}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setCostsData(data)
      }
    } catch (error) {
      console.error('Failed to fetch costs:', error)
    } finally {
      setLoadingCosts(false)
    }
  }

  const fetchPixels = async () => {
    setLoadingPixels(true)
    try {
      const res = await fetch('/api/admin/pixels')
      if (res.ok) {
        const data = await res.json()
        setPixels(data.pixels || [])
      }
    } catch (error) {
      console.error('Failed to fetch pixels:', error)
    } finally {
      setLoadingPixels(false)
    }
  }

  const createPixel = async () => {
    if (!newPixelId) {
      showToast('Pixel ID is required')
      return
    }
    if (newPixelType === 'facebook' && !newAccessToken) {
      showToast('Access Token is required for Facebook')
      return
    }

    setSavingPixel(true)
    try {
      const res = await fetch('/api/admin/pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newPixelType,
          pixel_id: newPixelId,
          access_token: newPixelType === 'facebook' ? newAccessToken : null,
        }),
      })
      if (res.ok) {
        showToast('Pixel added')
        setShowAddPixel(false)
        setNewPixelId('')
        setNewAccessToken('')
        fetchPixels()
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to add pixel')
      }
    } catch (error) {
      console.error('Failed to create pixel:', error)
      showToast('Failed to add pixel')
    } finally {
      setSavingPixel(false)
    }
  }

  const updatePixel = async (id: string) => {
    setSavingPixel(true)
    try {
      const updates: Record<string, unknown> = {}
      if (editPixelId) updates.pixel_id = editPixelId
      if (editAccessToken && !editAccessToken.startsWith('••••')) {
        updates.access_token = editAccessToken
      }

      const res = await fetch('/api/admin/pixels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (res.ok) {
        showToast('Pixel updated')
        setEditingPixel(null)
        setEditPixelId('')
        setEditAccessToken('')
        fetchPixels()
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Failed to update pixel:', error)
    } finally {
      setSavingPixel(false)
    }
  }

  const togglePixelActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/pixels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentActive }),
      })
      if (res.ok) {
        setPixels(prev => prev.map(p =>
          p.id === id ? { ...p, is_active: !currentActive } : p
        ))
        showToast(currentActive ? 'Pixel disabled' : 'Pixel enabled')
      }
    } catch (error) {
      console.error('Failed to toggle pixel:', error)
    }
  }

  const deletePixel = async (id: string) => {
    if (!confirm('Delete this pixel?')) return

    try {
      const res = await fetch(`/api/admin/pixels?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setPixels(prev => prev.filter(p => p.id !== id))
        showToast('Pixel deleted')
      }
    } catch (error) {
      console.error('Failed to delete pixel:', error)
    }
  }

  const startEditPixel = (pixel: Pixel) => {
    setEditingPixel(pixel.id)
    setEditPixelId(pixel.pixel_id)
    setEditAccessToken(pixel.access_token || '')
  }

  const cancelEditPixel = () => {
    setEditingPixel(null)
    setEditPixelId('')
    setEditAccessToken('')
  }

  const toggleShowToken = (id: string) => {
    setShowTokens(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const updateFeedbackStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        // Update local state
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f))
        if (selectedFeedback?.id === id) {
          setSelectedFeedback(prev => prev ? { ...prev, status } : null)
        }
        showToast('Status updated')
      }
    } catch (error) {
      console.error('Failed to update feedback:', error)
    }
  }

  const toggleFeedbackSelection = (id: string) => {
    setSelectedFeedbackIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleSelectAllFeedback = () => {
    if (selectedFeedbackIds.size === feedbacks.length) {
      setSelectedFeedbackIds(new Set())
    } else {
      setSelectedFeedbackIds(new Set(feedbacks.map(f => f.id)))
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Always refresh stats
      await fetchStats()

      // Refresh data based on active tab
      switch (activeTab) {
        case 'overview':
          await Promise.all([fetchMaintenance(), fetchLatestGenerations()])
          break
        case 'users':
          await fetchUsers()
          if (selectedUserId) {
            await fetchUserGenerations(selectedUserId)
          }
          break
        case 'feedback':
          await fetchFeedback(selectedFeedbackCategory)
          break
        case 'costs':
          if (selectedCostPeriod === 'custom') {
            if (customStartDate && customEndDate) {
              await fetchCosts(selectedCostPeriod, customStartDate, customEndDate)
            }
          } else {
            await fetchCosts(selectedCostPeriod)
          }
          break
        case 'pixels':
          await fetchPixels()
          break
      }
      showToast('Refreshed')
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const deleteFeedback = async (ids: string[]) => {
    if (ids.length === 0) return
    if (!confirm(`Delete ${ids.length} feedback${ids.length > 1 ? 's' : ''}?`)) return

    setDeletingFeedback(true)
    try {
      const res = await fetch(`/api/admin/feedback?ids=${ids.join(',')}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        // Update local state
        setFeedbacks(prev => prev.filter(f => !ids.includes(f.id)))
        setSelectedFeedbackIds(new Set())
        if (selectedFeedback && ids.includes(selectedFeedback.id)) {
          setSelectedFeedback(null)
        }
        // Update counts
        setFeedbackCounts(prev => {
          const newCounts = { ...prev }
          newCounts.all = Math.max(0, (newCounts.all || 0) - ids.length)
          return newCounts
        })
        showToast(`Deleted ${ids.length} feedback${ids.length > 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error)
    } finally {
      setDeletingFeedback(false)
    }
  }

  const toggleMaintenance = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled: !maintenance.enabled,
        message: maintenance.message
      })
    })

    if (res.ok) {
      setMaintenance(prev => ({ ...prev, enabled: !prev.enabled }))
      showToast(maintenance.enabled ? 'Maintenance OFF' : 'Maintenance ON')
    }
    setSaving(false)
  }

  const saveMessage = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maintenance)
    })
    if (res.ok) showToast('Saved')
    setSaving(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {toast && (
            <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
              {toast}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Active Subs</p>
            </div>
            <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">Total Gens</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalGenerations}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
            <p className={`text-2xl font-bold ${maintenance.enabled ? 'text-yellow-500' : 'text-green-500'}`}>
              {maintenance.enabled ? 'Maintenance' : 'Online'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users & Generations</TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback
              {feedbackCounts.all > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full">
                  {feedbackCounts.all}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pixels" className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Pixels
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Maintenance Mode */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-medium">Maintenance Mode</h2>
                    <p className="text-xs text-muted-foreground">Block all non-admin users</p>
                  </div>
                  <button
                    onClick={toggleMaintenance}
                    disabled={saving}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      maintenance.enabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        maintenance.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={maintenance.message}
                    onChange={(e) => setMaintenance(prev => ({ ...prev, message: e.target.value }))}
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs"
                    placeholder="Maintenance message..."
                  />
                  <button
                    onClick={saveMessage}
                    disabled={saving}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Latest Generations */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="font-medium mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Latest Generations
                </h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {latestGenerations.slice(0, 10).map((gen) => (
                    <div key={gen.id} className="flex items-center justify-between text-xs p-2 bg-background rounded border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{gen.user_email || gen.user_id.slice(0, 8)}</p>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span style={{ color: getTypeColor(gen.type) }}>{getTypeIcon(gen.type)}</span>
                          <span>{getTypeName(gen.type)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {gen.result_url && (
                          <a
                            href={gen.result_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-colors"
                            title="View creation"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            gen.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            gen.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {gen.status}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDate(gen.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Users List */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Users ({users.length})
                </h2>
                {/* Search Input */}
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 pl-7 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[550px] overflow-y-auto">
                    {users
                      .filter(user => user.email.toLowerCase().includes(searchEmail.toLowerCase()))
                      .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full text-left p-2 rounded text-xs hover:bg-background transition-colors ${
                          selectedUserId === user.id ? 'bg-primary/20 border border-primary' : 'border border-transparent'
                        }`}
                      >
                        <p className="font-medium truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            user.subscription_status === 'active' ? 'bg-green-500/20 text-green-500' :
                            user.subscription_status === 'trialing' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {user.subscription_plan || 'free'}
                          </span>
                          <span className="text-muted-foreground">
                            {user.credits + user.credits_extras} cr
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Details & Generations */}
              <div className="col-span-2 bg-card border border-border rounded-lg p-4">
                {selectedUserId ? (
                  <>
                    <div className="mb-4">
                      {(() => {
                        const user = users.find(u => u.id === selectedUserId)
                        if (!user) return null
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <UserIcon className="w-8 h-8 text-muted-foreground" />
                              <div>
                                <h3 className="font-medium">{user.full_name || user.email}</h3>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div className="bg-background p-2 rounded">
                                <p className="text-muted-foreground">Plan</p>
                                <p className="font-medium capitalize">{user.subscription_plan || 'Free'}</p>
                              </div>
                              <div className="bg-background p-2 rounded">
                                <p className="text-muted-foreground">Credits</p>
                                <p className="font-medium">{user.credits} + {user.credits_extras}</p>
                              </div>
                              <div className="bg-background p-2 rounded">
                                <p className="text-muted-foreground">Status</p>
                                <p className="font-medium capitalize">{user.subscription_status}</p>
                              </div>
                              <div className="bg-green-500/10 p-2 rounded border border-green-500/30">
                                <p className="text-green-500 text-[10px]">API Cost</p>
                                <p className="font-bold text-green-500">${userTotalCost.toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Period Filter */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">Period:</span>
                              {COST_PERIODS.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => setUserCostPeriod(p.id)}
                                  className={`px-2 py-1 rounded text-[10px] transition-colors ${
                                    userCostPeriod === p.id
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted hover:bg-muted-foreground/20'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>

                            {/* Custom Date Range */}
                            {userCostPeriod === 'custom' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="date"
                                  value={userCustomStart}
                                  onChange={(e) => setUserCustomStart(e.target.value)}
                                  className="bg-background border border-border rounded px-2 py-1 text-xs"
                                />
                                <span className="text-xs text-muted-foreground">to</span>
                                <input
                                  type="date"
                                  value={userCustomEnd}
                                  onChange={(e) => setUserCustomEnd(e.target.value)}
                                  className="bg-background border border-border rounded px-2 py-1 text-xs"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>

                    <div className="border-t border-border pt-4">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Generations ({userGenerations.length})
                      </h3>
                      {loadingGenerations ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : userGenerations.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {userGenerations.map((gen) => (
                            <div key={gen.id} className="p-3 bg-background rounded border border-border text-xs">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <span style={{ color: getTypeColor(gen.type) }}>{getTypeIcon(gen.type)}</span>
                                  <span className="font-medium">{getTypeName(gen.type)}</span>
                                  {gen.cost !== undefined && gen.cost > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-500 font-medium">
                                      ${gen.cost.toFixed(4)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {gen.result_url && (
                                    <a
                                      href={gen.result_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      View
                                    </a>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                                    gen.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                    gen.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                                    'bg-yellow-500/20 text-yellow-500'
                                  }`}>
                                    {gen.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-muted-foreground text-[10px] mb-1">
                                {formatDate(gen.created_at)}
                              </p>
                              {gen.metadata?.prompt && (
                                <p className="text-muted-foreground truncate">{gen.metadata.prompt}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8 text-sm">
                          No generations yet
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">Select a user to view details</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {/* Period Selector */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Period
                </h2>
                <div className="space-y-1">
                  {COST_PERIODS.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedCostPeriod(period.id)}
                      className={`w-full text-left p-2 rounded text-xs transition-colors ${
                        selectedCostPeriod === period.id
                          ? 'bg-primary/20 border border-primary'
                          : 'hover:bg-background border border-transparent'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range */}
                {selectedCostPeriod === 'custom' && (
                  <div className="mt-4 space-y-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full mt-1 bg-background border border-border rounded px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full mt-1 bg-background border border-border rounded px-2 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* API Rates */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-xs font-medium mb-2">API Rates (USD)</h3>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nano Banana 2</span>
                      <span>${API_COSTS.nanobanana2}/img</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sora 2</span>
                      <span>${API_COSTS.sora2}/video</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Veo 3 Fast</span>
                      <span>${API_COSTS.veo3_fast}/video</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Veo 3 High</span>
                      <span>${API_COSTS.veo3_high}/video</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LipSync</span>
                      <span>${API_COSTS.lipsync}/sec</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Infinite Talk</span>
                      <span>${API_COSTS.infinitetalk}/sec</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Costs Summary */}
              <div className="col-span-3 space-y-4">
                {/* Total Cost Card */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      {loadingCosts ? (
                        <div className="h-10 w-32 animate-pulse bg-muted rounded mt-1" />
                      ) : (
                        <p className="text-4xl font-bold text-green-500">
                          ${costsData?.totalCost?.toFixed(2) || '0.00'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Generations</p>
                      {loadingCosts ? (
                        <div className="h-10 w-20 animate-pulse bg-muted rounded mt-1" />
                      ) : (
                        <p className="text-4xl font-bold">
                          {costsData?.totalGenerations || 0}
                        </p>
                      )}
                    </div>
                  </div>
                  {costsData && (
                    <p className="text-xs text-muted-foreground mt-4">
                      {new Date(costsData.startDate).toLocaleDateString()} - {new Date(costsData.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Costs by Type */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h2 className="font-medium mb-4">Costs by Type</h2>
                  {loadingCosts ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : costsData ? (
                    <div className="grid grid-cols-3 gap-4">
                      {/* Nano Banana 2 */}
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#22c55e]"><BananaIcon className="w-4 h-4" /></span>
                          <span className="font-medium text-sm">Nano Banana 2</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{costsData.costsByType.nanobanana2?.count || 0} images</span>
                          <span className="font-medium">${costsData.costsByType.nanobanana2?.cost?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>

                      {/* Sora 2 */}
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#8b5cf6]"><Video className="w-4 h-4" /></span>
                          <span className="font-medium text-sm">Sora 2</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{costsData.costsByType.sora2?.count || 0} videos</span>
                          <span className="font-medium">${costsData.costsByType.sora2?.cost?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>

                      {/* Veo 3 Fast */}
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#f97316]"><Sparkles className="w-4 h-4" /></span>
                          <span className="font-medium text-sm">Veo 3 Fast</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{costsData.costsByType.veo3_fast?.count || 0} videos</span>
                          <span className="font-medium">${costsData.costsByType.veo3_fast?.cost?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>

                      {/* Veo 3 High */}
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#f97316]"><Sparkles className="w-4 h-4" /></span>
                          <span className="font-medium text-sm">Veo 3 High</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{costsData.costsByType.veo3_high?.count || 0} videos</span>
                          <span className="font-medium">${costsData.costsByType.veo3_high?.cost?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>

                      {/* LipSync */}
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#3b82f6]"><Mic className="w-4 h-4" /></span>
                          <span className="font-medium text-sm">LipSync</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{costsData.costsByType.lipsync?.count || 0} videos</span>
                          <span className="font-medium">${costsData.costsByType.lipsync?.cost?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>

                      {/* Infinite Talk */}
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#06b6d4]"><Infinity className="w-4 h-4" /></span>
                          <span className="font-medium text-sm">Infinite Talk</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{costsData.costsByType.infinitetalk?.count || 0} videos</span>
                          <span className="font-medium">${costsData.costsByType.infinitetalk?.cost?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8 text-sm">
                      Select a period to view costs
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {/* Categories Sidebar */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Categories
                </h2>
                <div className="space-y-1">
                  {FEEDBACK_CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    const count = feedbackCounts[cat.id] || 0
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedFeedbackCategory(cat.id)}
                        className={`w-full flex items-center justify-between p-2 rounded text-xs transition-colors ${
                          selectedFeedbackCategory === cat.id
                            ? 'bg-primary/20 border border-primary'
                            : 'hover:bg-background border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          count > 0 ? 'bg-muted-foreground/20' : 'bg-transparent text-muted-foreground'
                        }`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Feedback List */}
              <div className="col-span-2 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium">
                    {FEEDBACK_CATEGORIES.find(c => c.id === selectedFeedbackCategory)?.label || 'All'} Feedback
                  </h2>
                  <div className="flex items-center gap-2">
                    {feedbacks.length > 0 && (
                      <>
                        <button
                          onClick={toggleSelectAllFeedback}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-muted hover:bg-muted-foreground/20 transition-colors"
                        >
                          {selectedFeedbackIds.size === feedbacks.length ? (
                            <CheckSquare className="w-3 h-3" />
                          ) : (
                            <Square className="w-3 h-3" />
                          )}
                          {selectedFeedbackIds.size === feedbacks.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {selectedFeedbackIds.size > 0 && (
                          <button
                            onClick={() => deleteFeedback(Array.from(selectedFeedbackIds))}
                            disabled={deletingFeedback}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete ({selectedFeedbackIds.size})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {loadingFeedback ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : feedbacks.length > 0 ? (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className={`flex items-start gap-2 p-3 rounded border transition-colors ${
                          selectedFeedback?.id === fb.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-background border-border hover:border-muted-foreground/50'
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFeedbackSelection(fb.id)
                          }}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {selectedFeedbackIds.has(fb.id) ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          )}
                        </button>

                        {/* Content */}
                        <button
                          onClick={() => setSelectedFeedback(fb)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium truncate flex-1">{fb.user_email}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                              fb.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                              fb.status === 'in_review' ? 'bg-blue-500/20 text-blue-500' :
                              fb.status === 'closed' ? 'bg-gray-500/20 text-gray-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {fb.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{fb.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted capitalize">{fb.category}</span>
                            <span className="text-[10px] text-muted-foreground">{formatDate(fb.created_at)}</span>
                          </div>
                        </button>

                        {/* Delete single */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFeedback([fb.id])
                          }}
                          className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No feedback in this category
                  </p>
                )}
              </div>

              {/* Feedback Details */}
              <div className="bg-card border border-border rounded-lg p-4">
                {selectedFeedback ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm mb-1">From</h3>
                      <p className="text-xs text-muted-foreground">{selectedFeedback.user_email}</p>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm mb-1">Category</h3>
                      <span className="text-xs px-2 py-1 rounded bg-muted capitalize">{selectedFeedback.category}</span>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm mb-1">Message</h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedFeedback.message}</p>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm mb-1">Status</h3>
                      <div className="flex gap-1 flex-wrap">
                        {['pending', 'in_review', 'resolved', 'closed'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateFeedbackStatus(selectedFeedback.id, status)}
                            className={`px-2 py-1 rounded text-[10px] capitalize transition-colors ${
                              selectedFeedback.status === status
                                ? status === 'resolved' ? 'bg-green-500 text-white' :
                                  status === 'in_review' ? 'bg-blue-500 text-white' :
                                  status === 'closed' ? 'bg-gray-500 text-white' :
                                  'bg-yellow-500 text-black'
                                : 'bg-muted hover:bg-muted-foreground/20'
                            }`}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm mb-1">Date</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(selectedFeedback.created_at)}</p>
                    </div>

                    {/* Delete Button */}
                    <div className="pt-2 border-t border-border">
                      <button
                        onClick={() => deleteFeedback([selectedFeedback.id])}
                        disabled={deletingFeedback}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Feedback
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">Select a feedback to view details</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pixels Tab */}
          <TabsContent value="pixels" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Tracking Pixels
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage Facebook Pixel CAPI and Google Tag Manager for all pages
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPixel(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Pixel
                </button>
              </div>

              {/* Add Pixel Form */}
              {showAddPixel && (
                <div className="mb-6 p-4 bg-background rounded-lg border border-border">
                  <h3 className="font-medium mb-4">Add New Pixel</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Type</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNewPixelType('facebook')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                            newPixelType === 'facebook'
                              ? 'bg-blue-500 text-white'
                              : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook CAPI
                        </button>
                        <button
                          onClick={() => setNewPixelType('gtm')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                            newPixelType === 'gtm'
                              ? 'bg-orange-500 text-white'
                              : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                        >
                          <Tag className="w-4 h-4" />
                          Google GTM
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        {newPixelType === 'facebook' ? 'Pixel ID' : 'Tag ID'}
                      </label>
                      <input
                        type="text"
                        value={newPixelId}
                        onChange={(e) => setNewPixelId(e.target.value)}
                        placeholder={newPixelType === 'facebook' ? 'e.g., 123456789012345' : 'e.g., AW-17825080880 ou GTM-XXXXXXX'}
                        className="w-full bg-card border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {newPixelType === 'gtm' && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Aceita: Google Ads (AW-), GA4 (G-), ou GTM (GTM-)
                        </p>
                      )}
                    </div>
                  </div>

                  {newPixelType === 'facebook' && (
                    <div className="mb-4">
                      <label className="text-xs text-muted-foreground block mb-1">
                        Access Token (API CAPI - Graph API v23.0)
                      </label>
                      <input
                        type="password"
                        value={newAccessToken}
                        onChange={(e) => setNewAccessToken(e.target.value)}
                        placeholder="Your Facebook Conversions API access token"
                        className="w-full bg-card border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Required for server-side events. Get it from Facebook Events Manager → Settings → Generate Access Token
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={createPixel}
                      disabled={savingPixel}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingPixel ? 'Saving...' : 'Save Pixel'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddPixel(false)
                        setNewPixelId('')
                        setNewAccessToken('')
                      }}
                      className="px-4 py-2 bg-muted hover:bg-muted-foreground/20 rounded transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Pixels List */}
              {loadingPixels ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pixels.length > 0 ? (
                <div className="space-y-3">
                  {pixels.map((pixel) => (
                    <div
                      key={pixel.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        pixel.is_active
                          ? 'bg-background border-green-500/30'
                          : 'bg-muted/50 border-border opacity-60'
                      }`}
                    >
                      {editingPixel === pixel.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {pixel.type === 'facebook' ? (
                              <Facebook className="w-5 h-5 text-blue-500" />
                            ) : (
                              <Tag className="w-5 h-5 text-orange-500" />
                            )}
                            <input
                              type="text"
                              value={editPixelId}
                              onChange={(e) => setEditPixelId(e.target.value)}
                              className="flex-1 bg-card border border-border rounded px-3 py-1.5 text-sm"
                              placeholder="Pixel ID"
                            />
                          </div>

                          {pixel.type === 'facebook' && (
                            <div>
                              <input
                                type="password"
                                value={editAccessToken}
                                onChange={(e) => setEditAccessToken(e.target.value)}
                                className="w-full bg-card border border-border rounded px-3 py-1.5 text-sm"
                                placeholder="New access token (leave empty to keep current)"
                              />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => updatePixel(pixel.id)}
                              disabled={savingPixel}
                              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 disabled:opacity-50"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditPixel}
                              className="flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted-foreground/20 rounded text-xs"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {pixel.type === 'facebook' ? (
                                <Facebook className="w-5 h-5 text-blue-500" />
                              ) : (
                                <Tag className="w-5 h-5 text-orange-500" />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{pixel.pixel_id}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    pixel.type === 'facebook'
                                      ? 'bg-blue-500/20 text-blue-500'
                                      : 'bg-orange-500/20 text-orange-500'
                                  }`}>
                                    {pixel.type === 'facebook' ? 'Facebook CAPI' : 'Google GTM'}
                                  </span>
                                </div>
                                {pixel.type === 'facebook' && pixel.access_token && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-[10px] text-muted-foreground">Token:</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {showTokens.has(pixel.id) ? pixel.access_token : '••••••••••••'}
                                    </span>
                                    <button
                                      onClick={() => toggleShowToken(pixel.id)}
                                      className="p-0.5 hover:bg-muted rounded"
                                    >
                                      {showTokens.has(pixel.id) ? (
                                        <EyeOff className="w-3 h-3 text-muted-foreground" />
                                      ) : (
                                        <Eye className="w-3 h-3 text-muted-foreground" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Active Toggle */}
                            <button
                              onClick={() => togglePixelActive(pixel.id, pixel.is_active)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                pixel.is_active ? 'bg-green-500' : 'bg-muted'
                              }`}
                              title={pixel.is_active ? 'Active - Click to disable' : 'Inactive - Click to enable'}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  pixel.is_active ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => startEditPixel(pixel)}
                              className="p-1.5 rounded hover:bg-muted transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => deletePixel(pixel.id)}
                              className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No tracking pixels configured</p>
                  <button
                    onClick={() => setShowAddPixel(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Pixel
                  </button>
                </div>
              )}

              {/* Info Section */}
              <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="font-medium text-sm text-blue-500 mb-2">How it works</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>Facebook CAPI:</strong> Server-side events sent via Graph API v23.0 (fbc, fbp cookies included)</li>
                  <li>• <strong>Google GTM:</strong> Standard GTM container injection on all pages</li>
                  <li>• Active pixels are automatically injected into all pages</li>
                  <li>• Purchase, Subscribe, CompleteRegistration events are tracked server-side</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
