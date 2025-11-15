import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import TicketDetail from './components/TicketDetail'
import Analytics from './components/Analytics'

// Import config
const config = {
  apiUrl: import.meta.env.PROD 
    ? 'https://support-sense-ai-backend.onrender.com'
    : 'http://localhost:8001'
}

// Create Dark Mode Context
const DarkModeContext = createContext()

// Dark Mode Provider Component
function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const toggleDarkMode = () => {
    console.log('🔄 BEFORE toggle - darkMode:', darkMode)
    const newDarkMode = !darkMode
    console.log('🔄 AFTER toggle calculation - newDarkMode:', newDarkMode)
    
    // Update localStorage
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
    
    // Update class immediately
    if (newDarkMode) {
      console.log('🌙 Adding dark class')
      document.documentElement.classList.add('dark')
    } else {
      console.log('☀️ Removing dark class')  
      document.documentElement.classList.remove('dark')
    }
    
    // Update state
    console.log('🎯 Setting state to:', newDarkMode)
    setDarkMode(newDarkMode)
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

// Hook to use dark mode (only used within this file)
function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

// Dashboard Component
function Dashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode } = useDarkMode()

  // Function to fetch tickets
  const fetchTickets = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/tickets`)
      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Generate demo data
  const generateDemoData = async () => {
    setLoading(true)
    const scenarios = [
      "URGENT! My payment was taken but order didn't go through!",
      "The app keeps freezing when I try to upload photos",
      "Can you help me reset my password? I'm locked out",
      "I love the new feature but found a small bug",
      "Very disappointed with the service quality lately",
      "Need immediate help - my business is stuck!",
      "Feature request: can you add more customization options?",
      "Billing question about my subscription renewal",
      "The website is very slow today",
      "Can I get a refund for my last purchase?"
    ];
    
    // Create 5 random tickets
    for (let i = 0; i < 5; i++) {
      const randomText = scenarios[Math.floor(Math.random() * scenarios.length)];
      try {
        await fetch(`${config.apiUrl}/api/tickets`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ text: randomText, source: 'demo' })
        });
      } catch (error) {
        console.error('Error creating demo ticket:', error)
      }
    }
    
    // Refresh the tickets list
    await fetchTickets()
  }

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'medium': return 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
      case 'low': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
    }
  }

  const getPriorityGradient = (priority) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-rose-500'
      case 'medium': return 'from-amber-500 to-orange-500'
      case 'low': return 'from-emerald-500 to-green-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const handleTicketClick = (ticket) => {
    navigate(`/ticket/${ticket.id}`, { state: { ticket } })
  }

  // Calculate stats for display
  const stats = {
    total: tickets.length,
    high: tickets.filter(t => t.priority === 'high').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    low: tickets.filter(t => t.priority === 'low').length,
    new: tickets.filter(t => t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    escalated: tickets.filter(t => t.status === 'escalated').length,
    unassigned: tickets.filter(t => !t.assigned_to || t.assigned_to === '').length,
    averageRating: tickets.filter(t => t.customer_rating > 0).length > 0 
      ? (tickets.reduce((sum, t) => sum + (t.customer_rating || 0), 0) / tickets.filter(t => t.customer_rating > 0).length).toFixed(1)
      : '0.0'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-lg text-slate-600 dark:text-slate-400 font-medium">Loading support dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header with Navigation */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">SS</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  SupportSense
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Customer Intelligence Platform</p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
              >
                Analytics
              </button>

              {/* Demo Data Generator */}
              <button
                onClick={generateDemoData}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm flex items-center space-x-2 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Demo</span>
              </button>

              {/* Refresh button */}
              <button
                onClick={fetchTickets}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                title="Refresh data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.total}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Tickets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tickets by message or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400"
                />
                <div className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
              
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setPriorityFilter('all')
                  }}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.high}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">Critical</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.medium}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">Important</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.low}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">Normal</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.unassigned}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">Unassigned</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Support Tickets</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {filteredTickets.length} of {tickets.length} tickets
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Avg. Rating: ⭐ {stats.averageRating}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-700/80">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Customer Message</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                {filteredTickets.map(ticket => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors duration-200 group cursor-pointer"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                          <span className="text-white font-semibold text-sm">#{ticket.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed max-w-md truncate">{ticket.text}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPriorityGradient(ticket.priority)}`}></div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getPriorityColor(ticket.priority)} border`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        ticket.status === 'new' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                        ticket.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' :
                        ticket.status === 'resolved' ? 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                        ticket.status === 'escalated' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                        'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      } border`}>
                        {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'New'}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        ticket.assigned_to 
                          ? 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' 
                          : 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
                      } border`}>
                        {ticket.assigned_to || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {ticket.customer_rating > 0 ? (
                          <>
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{ticket.customer_rating}/5</span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400 dark:text-slate-600">Not rated</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 dark:text-slate-600 text-lg">No tickets found</div>
                <div className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                  {searchTerm ? 'Try adjusting your search terms' : 'No tickets match the current filters'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="text-slate-400 dark:text-slate-600 text-sm font-medium">
            SupportSense AI Platform • Built for Rapid Quest Hackathon
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<AnalyticsWrapper />} />
          <Route path="/ticket/:id" element={<TicketDetailWrapper />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  )
}

// Wrapper components for navigation
function AnalyticsWrapper() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const { darkMode, toggleDarkMode } = useDarkMode()

  useEffect(() => {
    fetch(`${config.apiUrl}/api/tickets`)
      .then(response => response.json())
      .then(data => {
        setTickets(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error:', error)
        setLoading(false)
      })
  }, [])

  const handleBack = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-lg text-slate-600 dark:text-slate-400 font-medium">Loading analytics...</div>
        </div>
      </div>
    )
  }

  return <Analytics tickets={tickets} onBack={handleBack} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
}

function TicketDetailWrapper() {
  const navigate = useNavigate()
  const location = useLocation()
  const ticket = location.state?.ticket
  const { darkMode, toggleDarkMode } = useDarkMode()

  const handleBack = () => {
    navigate('/')
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600 dark:text-slate-400">Ticket not found</div>
          <button onClick={handleBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <TicketDetail ticket={ticket} onBack={handleBack} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
}

export default App