const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

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

    // Prepare the prompt for Gemini
    const prompt = `You are a thoughtful, empathetic dream interpreter. The user understands this is for reflection and not medical/clinical advice. 
Given the dream below, provide:
- A short 2–3 sentence plain-language summary.
- 4–6 likely themes or symbols and concise interpretations (each 1–2 sentences).
- Mood indicators (e.g., anxious, joyful, confused) with confidence levels.
- Practical takeaway: 3 bullet points with actionable reflections the user can try.

Dream:
TITLE: ${dream.title}
DATE: ${dream.date.toDate().toLocaleDateString()}
BODY:
${dream.body}

Constraints:
- Keep the response friendly and non-judgmental.
- Use plain language, no jargon.
- Keep output JSON-serializable in the following structure:
{
  "summary": "...",
  "themes": [{"symbol":"", "interpretation":""}, ...],
  "moodTags": [ "anxious", "hopeful" ],
  "takeaway": [ "..." ],
  "disclaimer": "This analysis is for reflection and personal insight only. It is not medical or clinical advice." 
}`

    // Call Google Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      throw new functions.https.HttpsError('internal', 'Analysis service not configured')
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text())
      throw new functions.https.HttpsError('internal', 'Failed to analyze dream')
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
      modelVersion: 'gemini-1.5-flash'
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
      insights: insights
    }

  } catch (error) {
    console.error('Error in analyzeDream function:', error)
    
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to analyze dream')
  }
})
