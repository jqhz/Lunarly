import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getDreamsByDate, getUserStats } from '../lib/firestore.js'

const Dashboard = () => {
  const { user } = useAuth()
  const [todaysDream, setTodaysDream] = useState(null)
  const [stats, setStats] = useState({ totalDreams: 0, analysesUsed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        const today = new Date()
        const dreams = await getDreamsByDate(user.uid, today)
        const userStats = await getUserStats(user.uid)

        setTodaysDream(dreams.length > 0 ? dreams[0] : null)
        setStats(userStats)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-sm text-dark-400">
          Welcome back, {user?.displayName}
        </div>
      </div>

      {/* Today's Dream Status */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Today's Dream</h2>
        
        {todaysDream ? (
          <div className="space-y-4">
            <div className="flex items-center text-green-400">
              <span className="text-2xl mr-2">✨</span>
              <span className="text-lg font-medium">You remembered your dream today!</span>
            </div>
            
            <div className="bg-dark-700 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{todaysDream.title}</h3>
              <p className="text-dark-300 line-clamp-2">
                {todaysDream.body.substring(0, 150)}
                {todaysDream.body.length > 150 && '...'}
              </p>
            </div>
            
            <Link 
              to={`/entry/${todaysDream.id}`}
              className="btn-primary inline-block"
            >
              View Dream
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center text-dark-400">
              <span className="text-2xl mr-2">🌙</span>
              <span className="text-lg">You haven't logged your dream for the day</span>
            </div>
            
            <Link 
              to="/journal"
              className="btn-primary inline-block"
            >
              Add Dream
            </Link>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/journal"
            className="flex items-center p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <span className="text-2xl mr-3">📝</span>
            <div>
              <p className="font-medium">Add New Dream</p>
              <p className="text-sm text-dark-400">Record today's dream</p>
            </div>
          </Link>
          
          <Link 
            to="/analysis"
            className="flex items-center p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <span className="text-2xl mr-3">🔮</span>
            <div>
              <p className="font-medium">Analyze Dreams</p>
              <p className="text-sm text-dark-400">Get AI insights</p>
            </div>
          </Link>
          
          <Link 
            to="/statistics"
            className="flex items-center p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <span className="text-2xl mr-3">📈</span>
            <div>
              <p className="font-medium">View Statistics</p>
              <p className="text-sm text-dark-400">Track your progress</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
