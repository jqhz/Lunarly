import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getDream, getAnalysis, analyzeDreamWithAI } from '../lib/firestore.js'
import DreamEditor from '../components/DreamEditor.jsx'
import AnalysisView from '../components/AnalysisView.jsx'

const Entry = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [dream, setDream] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    const loadDream = async () => {
      if (!user || !id) return

      try {
        const dreamData = await getDream(user.uid, id)
        setDream(dreamData)

        if (dreamData?.analysisId) {
          const analysisData = await getAnalysis(user.uid, dreamData.analysisId)
          setAnalysis(analysisData)
        }
      } catch (error) {
        console.error('Error loading dream:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDream()
  }, [user, id])

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    if (date && date.toDate) {
      return date.toDate().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return 'Unknown date'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dream...</div>
      </div>
    )
  }

  if (!dream) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Dream Not Found</h2>
        <p className="text-dark-400 mb-6">The dream you're looking for doesn't exist or has been deleted.</p>
        <Link to="/journal" className="btn-primary">
          Back to Journal
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/journal" className="text-primary-400 hover:text-primary-300 mb-2 inline-block">
            ← Back to Journal
          </Link>
          <h1 className="text-3xl font-bold text-white">{dream.title}</h1>
          <p className="text-dark-400 mt-1">{formatDate(dream.date)}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowEditor(true)}
            className="btn-secondary"
          >
            Edit Dream
          </button>
          
          {!dream.analysisId && (
            <button
              onClick={async () => {
                setAnalyzing(true)
                try {
                  await analyzeDreamWithAI(user.uid, dream.id)
                  // Reload the dream data to get the new analysis
                  window.location.reload()
                } catch (error) {
                  console.error('Error analyzing dream:', error)
                  alert('Failed to analyze dream. Please try again.')
                } finally {
                  setAnalyzing(false)
                }
              }}
              disabled={analyzing}
              className="btn-primary"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Dream'}
            </button>
          )}
        </div>
      </div>

      {/* Dream Content */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Dream Content</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">
            {dream.body}
          </p>
        </div>
      </div>

      {/* Analysis Section */}
      {analysis ? (
        <div id="analysis">
          <AnalysisView analysis={analysis} />
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-4xl mb-4">🔮</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Analysis Yet
          </h3>
          <p className="text-dark-400 mb-4">
            Get AI insights into your dream to understand its themes and meanings.
          </p>
          <Link
            to={`/analysis?dreamId=${dream.id}`}
            className="btn-primary"
          >
            Analyze This Dream
          </Link>
        </div>
      )}

      {/* Dream Editor Modal */}
      {showEditor && (
        <DreamEditor
          dream={dream}
          onClose={() => setShowEditor(false)}
          onSave={() => {
            setShowEditor(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default Entry
