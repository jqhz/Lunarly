import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import SearchBar from './SearchBar.jsx'
import AvatarMenu from './AvatarMenu.jsx'

const Navbar = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <nav className="bg-dark-800 border-b border-dark-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Lunarly branding */}
        <div className="flex items-center">
          <Link 
            to="/home" 
            className="text-2xl font-bold text-primary-400 hover:text-primary-300 transition-colors"
          >
            Lunarly
          </Link>
        </div>

        {/* Center: Search bar */}
        <div className="flex-1 max-w-md mx-8">
          <SearchBar 
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            isFocused={isSearchFocused}
          />
        </div>

        {/* Right: User avatar and menu */}
        <div className="flex items-center">
          {user && (
            <AvatarMenu user={user} />
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
