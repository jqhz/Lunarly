import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { createDream, updateDream } from '../lib/firestore.js'

const DreamEditor = ({ dream, onClose, onSave }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dream) {
      // Editing existing dream
      const dreamDate = dream.date instanceof Date 
        ? dream.date.toISOString().split('T')[0]
        : dream.date.toDate ? dream.date.toDate().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      setFormData({
        title: dream.title || '',
        body: dream.body || '',
        date: dreamDate
      })
    }
  }, [dream])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.body.trim()) {
      alert('Please fill in both title and body')
      return
    }

    setLoading(true)
    try {
      const dreamData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        date: new Date(formData.date)
      }

      if (dream) {
        // Update existing dream
        await updateDream(user.uid, dream.id, dreamData)
      } else {
        // Create new dream
        await createDream(user.uid, dreamData)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving dream:', error)
      alert('Failed to save dream. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {dream ? 'Edit Dream' : 'Add New Dream'}
            </h2>
            <button
              onClick={onClose}
              className="text-dark-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Enter dream title..."
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-white mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-white mb-2">
                Dream Content *
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleChange}
                className="input-field w-full h-64 resize-none"
                placeholder="Describe your dream in detail..."
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (dream ? 'Update Dream' : 'Save Dream')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DreamEditor
