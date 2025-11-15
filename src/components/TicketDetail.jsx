import React, { useState } from 'react'
import Modal from './Modal'

// Import config
const config = {
  apiUrl: import.meta.env.PROD 
    ? 'https://support-sense-ai-backend.onrender.com'
    : 'http://localhost:8001'
}

function TicketDetail({ ticket, onBack, darkMode, toggleDarkMode }) {
  const [response, setResponse] = useState('')
  const [status, setStatus] = useState(ticket.status)
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || '')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Function to update ticket in backend
  const updateTicketInBackend = async (updates) => {
    try {
      console.log('Updating ticket with:', updates)
      const response = await fetch(`${config.apiUrl}/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update ticket')
      }
      
      const result = await response.json()
      console.log('Update successful:', result)
      return result
    } catch (error) {
      console.error('Error updating ticket:', error)
      throw error
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (response.trim()) {
      showSuccess(`Response sent to customer: "${response}"`)
      setResponse('')
    }
  }

  const handleAiSuggestion = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`${config.apiUrl}/api/ai/suggest-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: ticket.text })
      })
      const data = await response.json()
      setAiSuggestion(data.suggestion)
      setResponse(data.suggestion)
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
      const fallbacks = [
        "Thank you for bringing this to our attention. We're looking into it.",
        "I understand your concern. Let me help you resolve this issue.",
        "Thanks for reaching out. Our team will address this promptly."
      ]
      const randomSuggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)]
      setAiSuggestion(randomSuggestion)
      setResponse(randomSuggestion)
    }
    setIsGenerating(false)
  }

  const handleStatusChange = async (newStatus) => {
    console.log('Updating status to:', newStatus)
    try {
      const result = await updateTicketInBackend({ status: newStatus })
      console.log('Status update result:', result)
      setStatus(newStatus)
      showSuccess(`Status updated to: ${newStatus}`)
      
      // Show rating modal if resolved
      if (newStatus === 'resolved') {
        setTimeout(() => {
          setShowRatingModal(true)
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleAssignToTeam = async (member) => {
    console.log('Assigning ticket to:', member)
    try {
      const result = await updateTicketInBackend({ assigned_to: member, status: 'in-progress' })
      console.log('Assign result:', result)
      setAssignedTo(member)
      setStatus('in-progress')
      setShowAssignModal(false)
      showSuccess(`Ticket assigned to: ${member} and status updated to In Progress`)
    } catch (error) {
      console.error('Failed to assign ticket:', error)
      setShowAssignModal(false)
    }
  }

  const handleAddNotes = (notes) => {
    setShowNotesModal(false)
    showSuccess(`Internal note added: "${notes}"`)
  }

  const handleEscalate = async () => {
    console.log('Escalating ticket')
    try {
      const result = await updateTicketInBackend({ status: 'escalated' })
      console.log('Escalate result:', result)
      setStatus('escalated')
      setShowEscalateModal(false)
      showSuccess('Ticket escalated to senior support team!')
    } catch (error) {
      console.error('Failed to escalate ticket:', error)
      setShowEscalateModal(false)
    }
  }

  const handleRequestInfo = () => {
    setShowInfoModal(false)
    showSuccess('Information request sent to customer!')
  }

  const handleRating = async (rating) => {
    try {
      await updateTicketInBackend({ customer_rating: rating })
      setShowRatingModal(false)
      showSuccess(`Thank you! Customer rated: ${rating}/5 stars`)
    } catch (error) {
      console.error('Failed to save rating:', error)
      setShowRatingModal(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'medium': return 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
      case 'low': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            <span>← Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">Ticket #{ticket.id}</div>
            
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ticket Info & Response */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Customer Inquiry</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(ticket.priority)} border`}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                </span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-4">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{ticket.text}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Status</div>
                  <select 
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="mt-1 text-slate-700 dark:text-slate-300 font-medium border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 bg-white dark:bg-slate-700"
                  >
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Assigned To</div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    {assignedTo || 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>

            {/* Response Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Agent Response</h3>
              <form onSubmit={handleSubmit}>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="w-full h-32 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400"
                  required
                />
                
                {aiSuggestion && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">AI Suggestion:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-400 mt-1">{aiSuggestion}</div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={handleAiSuggestion}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/30 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    {isGenerating ? 'Generating...' : 'AI Suggest Response'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-colors"
                  >
                    Send Response
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - AI Suggestions & Actions */}
          <div className="space-y-6">
            {/* AI Analysis */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">AI Analysis</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="text-sm font-medium text-green-800 dark:text-green-300">Detected Issue Type</div>
                  <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                    {ticket.text.toLowerCase().includes('crash') ? 'Technical Bug' : 
                     ticket.text.toLowerCase().includes('password') ? 'Access Issue' : 
                     ticket.text.toLowerCase().includes('refund') ? 'Billing' : 'General Support'}
                  </div>
                </div>
                <button 
                  onClick={() => setShowEscalateModal(true)}
                  className="w-full text-left p-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl hover:border-red-300 dark:hover:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div className="text-sm font-medium text-red-700 dark:text-red-300">Escalate to Senior Team</div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">For complex or urgent issues</div>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowAssignModal(true)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                >
                  Assign to Team Member
                </button>
                <button 
                  onClick={() => setShowNotesModal(true)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                >
                  Add Internal Notes
                </button>
                <button 
                  onClick={() => setShowInfoModal(true)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                >
                  Request More Info
                </button>
              </div>
            </div>

            {/* Customer Rating */}
            {ticket.customer_rating > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Customer Rating</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`text-xl ${star <= ticket.customer_rating ? 'text-yellow-500' : 'text-slate-300 dark:text-slate-600'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {ticket.customer_rating}/5
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Beautiful Modals */}
      
      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign to Team" darkMode={darkMode}>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">Choose a team member to assign this ticket:</p>
          <div className="space-y-2">
            {['Sarah (Technical Expert)', 'Mike (Billing Specialist)', 'Jessica (General Support)', 'David (Urgent Issues)'].map(member => (
              <button
                key={member}
                onClick={() => handleAssignToTeam(member)}
                className="w-full text-left p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-slate-700 dark:text-slate-300"
              >
                {member}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Notes Modal */}
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} title="Add Internal Notes" darkMode={darkMode}>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">Add notes for your team:</p>
          <textarea
            placeholder="Type your internal notes here..."
            className="w-full h-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg resize-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400"
            id="notesInput"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowNotesModal(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const notes = document.getElementById('notesInput').value;
                handleAddNotes(notes || 'No notes provided');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Notes
            </button>
          </div>
        </div>
      </Modal>

      {/* Request Info Modal */}
      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Request More Information" darkMode={darkMode}>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">What information do you need from the customer?</p>
          <div className="space-y-2">
            {['Device and OS details', 'Error screenshots', 'Account information', 'Steps to reproduce'].map(info => (
              <button
                key={info}
                onClick={handleRequestInfo}
                className="w-full text-left p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-slate-700 dark:text-slate-300"
              >
                {info}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Escalate Modal */}
      <Modal isOpen={showEscalateModal} onClose={() => setShowEscalateModal(false)} title="Escalate Ticket" darkMode={darkMode}>
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">Are you sure you want to escalate this ticket to the senior support team?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowEscalateModal(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleEscalate}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Escalate
            </button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} title="Customer Satisfaction" darkMode={darkMode}>
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-center">How would you rate the customer's satisfaction with the resolution?</p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => handleRating(rating)}
                className="text-3xl hover:scale-110 transition-transform"
                title={`${rating} stars`}
              >
                {rating === 1 ? '😠' : rating === 2 ? '😕' : rating === 3 ? '😐' : rating === 4 ? '😊' : '😍'}
              </button>
            ))}
          </div>
          <div className="flex justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
            <span>1 - Poor</span>
            <span>5 - Excellent</span>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Success" darkMode={darkMode}>
        <div className="space-y-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-center text-slate-700 dark:text-slate-300">{successMessage}</p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Continue
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default TicketDetail