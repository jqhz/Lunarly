import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { deleteDream } from '../lib/firestore.js'
import DreamCard from './DreamCard.jsx'

const DreamList = ({ dreams, onEditDream }) => {
  const { user } = useAuth()
  const [deletingId, setDeletingId] = useState(null)

  const handleDeleteDream = async (dreamId) => {
    if (!confirm('Are you sure you want to delete this dream? This action cannot be undone.')) {
      return
    }

    setDeletingId(dreamId)
    try {
      await deleteDream(user.uid, dreamId)
      // Reload the page to refresh the list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting dream:', error)
      alert('Failed to delete dream. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // Handle Firestore timestamp
    if (date && date.toDate) {
      return date.toDate().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    return 'Unknown date'
  }

  return (
    <div className="space-y-4">
      {dreams.map((dream) => (
        <DreamCard
          key={dream.id}
          dream={dream}
          formattedDate={formatDate(dream.date)}
          onEdit={() => onEditDream(dream)}
          onDelete={() => handleDeleteDream(dream.id)}
          isDeleting={deletingId === dream.id}
        />
      ))}
    </div>
  )
}

export default DreamList
