const AnalysisView = ({ analysis }) => {
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

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Dream Analysis</h2>
        <div className="text-sm text-dark-400">
          Analyzed on {formatDate(analysis.createdAt)}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
        <p className="text-dark-300 leading-relaxed">
          {analysis.insights?.summary || 'No summary available'}
        </p>
      </div>

      {/* Themes */}
      {analysis.insights?.themes && analysis.insights.themes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Themes & Symbols</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.insights.themes.map((theme, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-4">
                <h4 className="font-medium text-primary-400 mb-2">{theme.symbol}</h4>
                <p className="text-dark-300 text-sm">{theme.interpretation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Tags */}
      {analysis.insights?.moodTags && analysis.insights.moodTags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Mood Indicators</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.insights.moodTags.map((mood, index) => (
              <span
                key={index}
                className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {mood}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Takeaway */}
      {analysis.insights?.takeaway && analysis.insights.takeaway.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Practical Takeaway</h3>
          <ul className="space-y-2">
            {analysis.insights.takeaway.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary-400 mr-2 mt-1">•</span>
                <span className="text-dark-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-dark-700 rounded-lg p-4 border-l-4 border-yellow-500">
        <p className="text-sm text-dark-300">
          <strong className="text-yellow-400">Disclaimer:</strong> This analysis is for reflection and personal insight only. 
          It is not medical or clinical advice. If you have concerns about your mental health, 
          please consult with a qualified healthcare professional.
        </p>
      </div>
    </div>
  )
}

export default AnalysisView
