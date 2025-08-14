import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getDreams } from '../lib/firestore.js'
import DreamList from '../components/DreamList.jsx'
import DreamEditor from '../components/DreamEditor.jsx'

const Journal = () => {
  const { user } = useAuth()
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingDream, setEditingDream] = useState(null)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')

  useEffect(() => {
    const loadDreams = async () => {
      if (!user) return

      try {
        const userDreams = await getDreams(user.uid)
        
        // Filter by search query if present
        let filteredDreams = userDreams
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filteredDreams = userDreams.filter(dream => 
            dream.title.toLowerCase().includes(query) ||
            dream.body.toLowerCase().includes(query)
          )
        }
        
        setDreams(filteredDreams)
      } catch (error) {
        console.error('Error loading dreams:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDreams()
  }, [user, searchQuery])

  const handleAddDream = () => {
    setEditingDream(null)
    setShowEditor(true)
  }

  const handleEditDream = (dream) => {
    setEditingDream(dream)
    setShowEditor(true)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingDream(null)
  }

  const handleDreamSaved = () => {
    // Reload dreams after saving
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dreams...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dream Journal</h1>
          {searchQuery && (
            <p className="text-dark-400 mt-1">
              Search results for "{searchQuery}"
            </p>
          )}
        </div>
        <button onClick={handleAddDream} className="btn-primary">
          Add Dream
        </button>
      </div>

      {/* Dreams List */}
      {dreams.length > 0 ? (
        <DreamList 
          dreams={dreams} 
          onEditDream={handleEditDream}
        />
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🌙</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No dreams found' : 'No dreams yet'}
          </h3>
          <p className="text-dark-400 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Start your dream journal by adding your first dream'
            }
          </p>
          {!searchQuery && (
            <button onClick={handleAddDream} className="btn-primary">
              Add Your First Dream
            </button>
          )}
        </div>
      )}

      {/* Dream Editor Modal */}
      {showEditor && (
        <DreamEditor
          dream={editingDream}
          onClose={handleCloseEditor}
          onSave={handleDreamSaved}
        />
      )}
    </div>
  )
}

export default Journal
