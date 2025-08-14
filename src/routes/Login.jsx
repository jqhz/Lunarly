import { useAuth } from '../context/AuthContext.jsx'

const Login = () => {
  const { signInWithGoogle } = useAuth()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-400 mb-2">Lunarly</h1>
          <p className="text-dark-300">Sign in to continue your dream journey</p>
        </div>
        
        <div className="card">
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center space-x-3 btn-primary py-3"
          >
            <span>🔐</span>
            <span>Sign in with Google</span>
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-dark-400">
              By signing in, you agree to our privacy policy and terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
