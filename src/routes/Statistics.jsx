import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserStats, getDreams } from '../lib/firestore.js'

const Statistics = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalDreams: 0, analysesUsed: 0 })
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        const userStats = await getUserStats(user.uid)
        const userDreams = await getDreams(user.uid)
        
        setStats(userStats)
        setDreams(userDreams)
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  const calculateAverageDreamsPerWeek = () => {
    if (dreams.length === 0) return 0
    
    const firstDream = dreams[dreams.length - 1]
    const lastDream = dreams[0]
    
    if (!firstDream || !lastDream) return 0
    
    const firstDate = firstDream.date instanceof Date 
      ? firstDream.date 
      : firstDream.date.toDate()
    const lastDate = lastDream.date instanceof Date 
      ? lastDream.date 
      : lastDream.date.toDate()
    
    const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24)
    const weeksDiff = daysDiff / 7
    
    return weeksDiff > 0 ? (dreams.length / weeksDiff).toFixed(1) : dreams.length
  }

  const getMostCommonThemes = () => {
    // This would require analysis data to be implemented
    // For now, return placeholder
    return ['Dreams', 'Sleep', 'Reflection']
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Statistics</h1>
        <p className="text-dark-400">
          Track your dream journal progress and insights
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Total Dreams</p>
              <p className="text-3xl font-bold text-white">{stats.totalDreams}</p>
            </div>
            <span className="text-4xl">📝</span>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Analyses Used</p>
              <p className="text-3xl font-bold text-white">{stats.analysesUsed}</p>
            </div>
            <span className="text-4xl">🔮</span>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Avg. Dreams/Week</p>
              <p className="text-3xl font-bold text-white">{calculateAverageDreamsPerWeek()}</p>
            </div>
            <span className="text-4xl">📈</span>
          </div>
        </div>
      </div>

      {/* Dream Timeline */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Dream Timeline</h2>
        {dreams.length > 0 ? (
          <div className="space-y-3">
            {dreams.slice(0, 10).map((dream, index) => (
              <div key={dream.id} className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">{dream.title}</p>
                  <p className="text-sm text-dark-400">
                    {dream.date instanceof Date 
                      ? dream.date.toLocaleDateString()
                      : dream.date.toDate().toLocaleDateString()
                    }
                  </p>
                </div>
                {dream.analysisId && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                    Analyzed
                  </span>
                )}
              </div>
            ))}
            {dreams.length > 10 && (
              <p className="text-center text-dark-400 text-sm">
                And {dreams.length - 10} more dreams...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-dark-400">No dreams recorded yet</p>
          </div>
        )}
      </div>

      {/* Analysis Insights */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Analysis Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Most Common Themes</h3>
            <div className="space-y-2">
              {getMostCommonThemes().map((theme, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-dark-700 rounded">
                  <span className="text-dark-300">{theme}</span>
                  <span className="text-primary-400 font-medium">Coming soon</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Analysis Usage</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-dark-700 rounded">
                <span className="text-dark-300">Analyses this month</span>
                <span className="text-primary-400 font-medium">{stats.analysesUsed}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-dark-700 rounded">
                <span className="text-dark-300">Analysis rate</span>
                <span className="text-primary-400 font-medium">
                  {stats.totalDreams > 0 
                    ? Math.round((stats.analysesUsed / stats.totalDreams) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
