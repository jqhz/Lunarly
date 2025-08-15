const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

// Model configuration for cost optimization
const GEMINI_MODELS = {
  // Most efficient (lowest cost) - try first
  FLASH_LATEST: 'gemini-1.5-flash-latest',
  // Fallback option
  FLASH: 'gemini-1.5-flash',
  // Alternative lightweight models (if available)
  FLASH_LITE: 'gemini-1.5-flash-lite',
  NANO: 'gemini-1.5-nano'
}

exports.analyzeDream = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { dreamId, uid } = data

  if (!dreamId || !uid) {
    throw new functions.https.HttpsError('invalid-argument', 'dreamId and uid are required')
  }

  // Verify the dream belongs to the user
  if (context.auth.uid !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'User can only analyze their own dreams')
  }

  try {
    // Get the dream data
    const dreamRef = db.collection('users').doc(uid).collection('dreams').doc(dreamId)
    const dreamDoc = await dreamRef.get()

    if (!dreamDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dream not found')
    }

    const dream = dreamDoc.data()

    // Check if dream already has analysis
    if (dream.analysisId) {
      throw new functions.https.HttpsError('already-exists', 'Dream already has analysis')
    }

    // Prepare the prompt for Gemini - optimized for efficiency
    const prompt = `Analyze this dream for personal reflection (not medical advice). Provide JSON only:
{
  "summary": "2-3 sentence summary",
  "themes": [{"symbol":"key symbol", "interpretation":"brief meaning"}],
  "moodTags": ["primary", "secondary", "moods"],
  "takeaway": ["actionable insight 1", "insight 2", "insight 3"]
}

Dream: ${dream.title} - ${dream.body}`

    // Call Google Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      throw new functions.https.HttpsError('internal', 'Analysis service not configured')
    }

    // Try models in order of efficiency (cost)
    let geminiResponse
    let modelUsed = GEMINI_MODELS.FLASH_LATEST
    
    for (const [modelName, modelId] of Object.entries(GEMINI_MODELS)) {
      try {
        console.log(`Trying model: ${modelId}`)
        geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        })
        
        if (geminiResponse.ok) {
          modelUsed = modelId
          console.log(`Successfully used model: ${modelId}`)
          break
        } else {
          console.log(`Model ${modelId} failed with status: ${geminiResponse.status}`)
        }
      } catch (error) {
        console.log(`Model ${modelId} failed with error:`, error.message)
        continue
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      console.error('All Gemini models failed')
      throw new functions.https.HttpsError('internal', 'Failed to analyze dream - all models unavailable')
    }

    const geminiData = await geminiResponse.json()
    const responseText = geminiData.candidates[0].content.parts[0].text

    // Parse the JSON response
    let insights
    try {
      // Extract JSON from the response (handle cases where Gemini might add extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError)
      console.error('Raw response:', responseText)
      throw new functions.https.HttpsError('internal', 'Failed to parse analysis response')
    }

    // Create analysis document
    const analysisData = {
      dreamId: dreamId,
      promptSent: prompt,
      geminiResponse: responseText,
      insights: insights,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      modelVersion: modelUsed
    }

    const analysisRef = await db.collection('users').doc(uid).collection('analyses').add(analysisData)
    const analysisId = analysisRef.id

    // Update dream with analysis ID
    await dreamRef.update({
      analysisId: analysisId
    })

    // Update user stats
    const userRef = db.collection('users').doc(uid)
    await userRef.update({
      'stats.analysesUsed': admin.firestore.FieldValue.increment(1)
    })

    return {
      analysisId: analysisId,
      insights: insights,
      modelUsed: modelUsed
    }

  } catch (error) {
    console.error('Error in analyzeDream function:', error)
    
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to analyze dream')
  }
})
