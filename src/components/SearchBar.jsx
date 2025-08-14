import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({ onFocus, onBlur, isFocused }) => {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const debounceRef = useRef(null)

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        setIsSearching(true)
        // TODO: Implement search functionality
        // For now, just navigate to journal with search query
        navigate(`/journal?search=${encodeURIComponent(query)}`)
        setIsSearching(false)
      }, 300)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, navigate])

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search dreams..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full input-field pl-10 pr-4"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-dark-400">🔍</span>
        </div>
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar
