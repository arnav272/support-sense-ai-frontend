import React from 'react'

function Analytics({ tickets, onBack, darkMode, toggleDarkMode }) {
  const stats = {
    total: tickets.length,
    high: tickets.filter(t => t.priority === 'high').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    low: tickets.filter(t => t.priority === 'low').length,
    new: tickets.filter(t => t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    escalated: tickets.filter(t => t.status === 'escalated').length,
    ratedTickets: tickets.filter(t => t.customer_rating > 0).length,
    averageRating: tickets.filter(t => t.customer_rating > 0).length > 0 
      ? (tickets.reduce((sum, t) => sum + (t.customer_rating || 0), 0) / tickets.filter(t => t.customer_rating > 0).length).toFixed(1)
      : '0.0'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            <span>← Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Analytics</h1>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.total}</div>
            <div className="text-slate-600 dark:text-slate-400">Total Tickets</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.high}</div>
            <div className="text-slate-600 dark:text-slate-400">High Priority</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.medium}</div>
            <div className="text-slate-600 dark:text-slate-400">Medium Priority</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.low}</div>
            <div className="text-slate-600 dark:text-slate-400">Low Priority</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.new}</div>
            <div className="text-slate-600 dark:text-slate-400">New Tickets</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</div>
            <div className="text-slate-600 dark:text-slate-400">In Progress</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div>
            <div className="text-slate-600 dark:text-slate-400">Resolved</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.escalated}</div>
            <div className="text-slate-600 dark:text-slate-400">Escalated</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Performance Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Customer Satisfaction</span>
                <span>{stats.averageRating}/5 ⭐ ({stats.ratedTickets} rated)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{width: `${(parseFloat(stats.averageRating) / 5) * 100}%`}}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Response Time (Avg)</span>
                <span>2.4 hours</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Resolution Rate</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>First Contact Resolution</span>
                <span>65%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics