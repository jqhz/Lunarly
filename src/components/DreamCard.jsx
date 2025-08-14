import { Link } from 'react-router-dom'

const DreamCard = ({ dream, formattedDate, onEdit, onDelete, isDeleting }) => {
  const previewText = dream.body.length > 200 
    ? dream.body.substring(0, 200) + '...'
    : dream.body

  return (
    <div className="card hover:bg-dark-750 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {dream.title}
            </h3>
            {dream.analysisId && (
              <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                Analyzed
              </span>
            )}
          </div>
          
          <p className="text-sm text-dark-400 mb-3">
            {formattedDate}
          </p>
          
          <p className="text-dark-300 mb-4 leading-relaxed">
            {previewText}
          </p>
          
          <div className="flex items-center space-x-3">
            <Link
              to={`/entry/${dream.id}`}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              View Full Dream →
            </Link>
            
            {dream.analysisId && (
              <Link
                to={`/entry/${dream.id}#analysis`}
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                View Analysis →
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Edit dream"
          >
            ✏️
          </button>
          
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
            title="Delete dream"
          >
            {isDeleting ? '🗑️' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DreamCard
