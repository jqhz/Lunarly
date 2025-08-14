import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getDreams } from '../lib/firestore.js'

const Settings = () => {
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExportData = async () => {
    setExporting(true)
    try {
      const dreams = await getDreams(user.uid)
      
      const exportData = {
        user: {
          displayName: user.displayName,
          email: user.email,
          exportDate: new Date().toISOString()
        },
        dreams: dreams.map(dream => ({
          title: dream.title,
          body: dream.body,
          date: dream.date instanceof Date 
            ? dream.date.toISOString()
            : dream.date.toDate().toISOString(),
          createdAt: dream.createdAt instanceof Date
            ? dream.createdAt.toISOString()
            : dream.createdAt.toDate().toISOString()
        }))
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lunarly-dreams-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert('Data exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your dreams and data.')) {
      if (confirm('This is your final warning. All your data will be permanently deleted. Are you absolutely sure?')) {
        // TODO: Implement account deletion
        alert('Account deletion not yet implemented. Please contact support.')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-dark-400">
          Manage your preferences and account settings
        </p>
      </div>

      {/* Preferences */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Dark Mode</h3>
              <p className="text-sm text-dark-400">Use dark theme (recommended)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Email Notifications</h3>
              <p className="text-sm text-dark-400">Receive reminders and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Data Management</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-2">Export Your Data</h3>
            <p className="text-sm text-dark-400 mb-3">
              Download all your dreams as a JSON file for backup or transfer
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="btn-secondary"
            >
              {exporting ? 'Exporting...' : 'Export Dreams'}
            </button>
          </div>
          
          <div className="border-t border-dark-700 pt-4">
            <h3 className="text-white font-medium mb-2">Delete Account</h3>
            <p className="text-sm text-dark-400 mb-3">
              Permanently delete your account and all associated data
            </p>
            <button
              onClick={handleDeleteAccount}
              className="btn-danger"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <img
              src={user?.photoURL || '/default-avatar.png'}
              alt={user?.displayName || 'User'}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="text-white font-medium">{user?.displayName}</p>
              <p className="text-sm text-dark-400">{user?.email}</p>
            </div>
          </div>
          
          <div className="text-sm text-dark-400">
            <p>Account created: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
            <p>Last sign in: {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Privacy & Security</h2>
        
        <div className="space-y-3 text-sm text-dark-300">
          <p>• Your dreams are private and only accessible to you</p>
          <p>• We use Google's secure authentication</p>
          <p>• Data is encrypted in transit and at rest</p>
          <p>• We never share your personal information</p>
          <p>• You can export or delete your data at any time</p>
        </div>
      </div>
    </div>
  )
}

export default Settings
