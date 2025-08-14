import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const AvatarMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-700 transition-colors"
      >
        <img
          src={user.photoURL || '/default-avatar.png'}
          alt={user.displayName || 'User'}
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            e.target.src = '/default-avatar.png'
          }}
        />
        <span className="hidden md:block text-sm font-medium">
          {user.displayName || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-dark-400 border-b border-dark-700">
              {user.email}
            </div>
            
            <button
              onClick={() => {
                // TODO: Navigate to profile page
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-700 transition-colors"
            >
              Profile
            </button>
            
            <button
              onClick={() => {
                // TODO: Navigate to account settings
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-700 transition-colors"
            >
              Account Settings
            </button>
            
            <div className="border-t border-dark-700">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AvatarMenu
