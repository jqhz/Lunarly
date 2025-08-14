import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Home = () => {
  const { user, signInWithGoogle } = useAuth()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-400">Lunarly</div>
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <button onClick={handleSignIn} className="btn-primary">
              Sign In with Google
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Record your dreams.
            <br />
            <span className="text-primary-400">Reflect with gentle AI insight.</span>
          </h1>
          
          <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
            Lunarly helps you capture and understand your dreams through thoughtful AI analysis. 
            Build a meaningful dream journal and discover patterns in your subconscious mind.
          </p>

          {!user && (
            <button 
              onClick={handleSignIn}
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started with Google
            </button>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-dark-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Lunarly?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-3">Easy Dream Recording</h3>
              <p className="text-dark-300">
                Quickly capture your dreams with a clean, distraction-free interface designed for reflection.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Insights</h3>
              <p className="text-dark-300">
                Get thoughtful analysis of your dreams using Google's Gemini AI, helping you understand themes and patterns.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-3">Track Your Journey</h3>
              <p className="text-dark-300">
                Monitor your dream patterns over time with detailed statistics and progress tracking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Your Privacy Matters
          </h2>
          <p className="text-lg text-dark-300 mb-8">
            Your dreams are deeply personal. We use enterprise-grade security and never share your data. 
            You can export or delete your data at any time.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-dark-400">
            <span>🔒 End-to-end encryption</span>
            <span>📊 Full data control</span>
            <span>🚫 No data sharing</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-800 border-t border-dark-700 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-dark-400">
            © 2024 Lunarly. Built with care for dreamers everywhere.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
