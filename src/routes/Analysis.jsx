import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getDreams, getDream } from '../lib/firestore.js'

const Analysis = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [dreams, setDreams] = useState([])
  const [selectedDreams, setSelectedDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  
  const preSelectedDreamId = searchParams.get('dreamId')

  useEffect(() => {
    const loadDreams = async () => {
      if (!user) return

      try {
        const userDreams = await getDreams(user.uid)
        // Filter out dreams that already have analysis
        const unanalyzedDreams = userDreams.filter(dream => !dream.analysisId)
        setDreams(unanalyzedDreams)

        // Pre-select dream if specified in URL
        if (preSelectedDreamId) {
          const dream = unanalyzedDreams.find(d => d.id === preSelectedDreamId)
          if (dream) {
            setSelectedDreams([dream])
          }
        }
      } catch (error) {
        console.error('Error loading dreams:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDreams()
  }, [user, preSelectedDreamId])

  const handleDreamToggle = (dream) => {
    setSelectedDreams(prev => {
      const isSelected = prev.find(d => d.id === dream.id)
      if (isSelected) {
        return prev.filter(d => d.id !== dream.id)
      } else {
        return [...prev, dream]
      }
    })
  }

  const handleAnalyze = async () => {
    if (selectedDreams.length === 0) {
      alert('Please select at least one dream to analyze')
      return
    }

    if (!confirm('Analysis may incur API usage cost. Proceed?')) {
      return
    }

    setAnalyzing(true)
    try {
      // For now, we'll just navigate to the first selected dream
      // In a full implementation, this would call the Cloud Function
      const firstDream = selectedDreams[0]
      navigate(`/entry/${firstDream.id}`)
    } catch (error) {
      console.error('Error starting analysis:', error)
      alert('Failed to start analysis. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    if (date && date.toDate) {
      return date.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    return 'Unknown date'
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dream Analysis</h1>
        <p className="text-dark-400">
          Select dreams to analyze with AI and gain insights into their meanings
        </p>
      </div>

      {/* Selection Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Select Dreams to Analyze
          </h2>
          <div className="text-sm text-dark-400">
            {selectedDreams.length} selected
          </div>
        </div>

        {dreams.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Dreams Available for Analysis
            </h3>
            <p className="text-dark-400 mb-4">
              All your dreams have already been analyzed, or you haven't added any dreams yet.
            </p>
            <button
              onClick={() => navigate('/journal')}
              className="btn-primary"
            >
              Add New Dream
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dreams.map((dream) => (
              <div
                key={dream.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedDreams.find(d => d.id === dream.id)
                    ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                    : 'border-dark-600 bg-dark-700 hover:border-dark-500'
                }`}
                onClick={() => handleDreamToggle(dream)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedDreams.find(d => d.id === dream.id) !== undefined}
                        onChange={() => handleDreamToggle(dream)}
                        className="rounded border-dark-500 text-primary-600 focus:ring-primary-500"
                      />
                      <h3 className="font-semibold text-white">{dream.title}</h3>
                    </div>
                    <p className="text-sm text-dark-400 mb-2">
                      {formatDate(dream.date)}
                    </p>
                    <p className="text-dark-300 text-sm line-clamp-2">
                      {dream.body.substring(0, 150)}
                      {dream.body.length > 150 && '...'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedDreams.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Ready to Analyze
              </h3>
              <p className="text-sm text-dark-400">
                {selectedDreams.length} dream{selectedDreams.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn-primary"
            >
              {analyzing ? 'Analyzing...' : 'Analyze with Gemini'}
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-dark-700 rounded-lg p-4 border-l-4 border-yellow-500">
        <p className="text-sm text-dark-300">
          <strong className="text-yellow-400">Important:</strong> Dream analysis is for reflection and personal insight only. 
          It is not medical or clinical advice. Analysis may incur API usage costs.
        </p>
      </div>
    </div>
  )
}

export default Analysis
