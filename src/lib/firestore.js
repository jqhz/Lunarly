import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../firebase/firebase.js'
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai'

// Initialize Firebase AI
const ai = getAI()
const model = getGenerativeModel(ai, { model: 'gemini-1.5-flash' })

// Dream CRUD operations
export const createDream = async (uid, dreamData) => {
  try {
    const dreamRef = await addDoc(collection(db, 'users', uid, 'dreams'), {
      ...dreamData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      analysisId: null
    })
    
    // Update user stats - use setDoc with merge to create if doesn't exist
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, {
      stats: {
        totalDreams: increment(1),
        analysesUsed: 0
      }
    }, { merge: true })
    
    return dreamRef.id
  } catch (error) {
    console.error('Error creating dream:', error)
    throw error
  }
}

export const updateDream = async (uid, dreamId, dreamData) => {
  try {
    const dreamRef = doc(db, 'users', uid, 'dreams', dreamId)
    await updateDoc(dreamRef, {
      ...dreamData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating dream:', error)
    throw error
  }
}

export const deleteDream = async (uid, dreamId) => {
  try {
    const dreamRef = doc(db, 'users', uid, 'dreams', dreamId)
    await deleteDoc(dreamRef)
    
    // Update user stats - use setDoc with merge to handle non-existent docs
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, {
      stats: {
        totalDreams: increment(-1),
        analysesUsed: 0
      }
    }, { merge: true })
  } catch (error) {
    console.error('Error deleting dream:', error)
    throw error
  }
}

export const getDream = async (uid, dreamId) => {
  try {
    const dreamRef = doc(db, 'users', uid, 'dreams', dreamId)
    const dreamSnap = await getDoc(dreamRef)
    
    if (dreamSnap.exists()) {
      return { id: dreamSnap.id, ...dreamSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting dream:', error)
    throw error
  }
}

export const getDreams = async (uid) => {
  try {
    const dreamsRef = collection(db, 'users', uid, 'dreams')
    const q = query(dreamsRef, orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting dreams:', error)
    throw error
  }
}

export const getDreamsByDate = async (uid, date) => {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const dreamsRef = collection(db, 'users', uid, 'dreams')
    const q = query(
      dreamsRef,
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting dreams by date:', error)
    throw error
  }
}

// Analysis operations
export const createAnalysis = async (uid, analysisData) => {
  try {
    const analysisRef = await addDoc(collection(db, 'users', uid, 'analyses'), {
      ...analysisData,
      createdAt: serverTimestamp(),
      modelVersion: 'gemini-1.5-flash'
    })
    
    // Update user stats - use setDoc with merge to handle non-existent docs
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, {
      stats: {
        totalDreams: 0,
        analysesUsed: increment(1)
      }
    }, { merge: true })
    
    return analysisRef.id
  } catch (error) {
    console.error('Error creating analysis:', error)
    throw error
  }
}

export const getAnalysis = async (uid, analysisId) => {
  try {
    const analysisRef = doc(db, 'users', uid, 'analyses', analysisId)
    const analysisSnap = await getDoc(analysisRef)
    
    if (analysisSnap.exists()) {
      return { id: analysisSnap.id, ...analysisSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting analysis:', error)
    throw error
  }
}

export const linkAnalysisToDream = async (uid, dreamId, analysisId) => {
  try {
    const dreamRef = doc(db, 'users', uid, 'dreams', dreamId)
    await updateDoc(dreamRef, {
      analysisId: analysisId
    })
  } catch (error) {
    console.error('Error linking analysis to dream:', error)
    throw error
  }
}

// User stats
export const getUserStats = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data().stats || { totalDreams: 0, analysesUsed: 0 }
    }
    return { totalDreams: 0, analysesUsed: 0 }
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw error
  }
}

// AI Analysis function - Using Firebase AI
export const analyzeDreamWithAI = async (uid, dreamId) => {
  try {
    // Get the dream data first
    const dream = await getDream(uid, dreamId)
    if (!dream) {
      throw new Error('Dream not found')
    }

    // Create prompt for dream analysis
    const prompt = `You are a thoughtful, empathetic dream interpreter. The user understands this is for reflection and not medical/clinical advice. 

Analyze this dream for personal insight and provide a JSON response with:
- A 2-3 sentence summary of the dream's meaning
- 3-4 key themes with symbols and their interpretations
- Mood indicators as descriptive tags
- 3 actionable takeaways for reflection

Dream Title: ${dream.title}
Dream Content: ${dream.body}

Respond only with valid JSON in this exact format:
{
  "summary": "brief summary of the dream's meaning",
  "themes": [
    {"symbol": "symbol name", "interpretation": "meaning and significance"},
    {"symbol": "symbol name", "interpretation": "meaning and significance"}
  ],
  "moodTags": ["mood1", "mood2", "mood3"],
  "takeaway": [
    "actionable insight 1",
    "actionable insight 2", 
    "actionable insight 3"
  ]
}`

    // Use Firebase AI to generate analysis
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()
    
    // Parse the JSON response
    let analysis
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Raw response:', analysisText)
      // Fallback to structured analysis
      analysis = generateFallbackAnalysis(dream.title, dream.body)
    }

    // Create analysis document in Firestore
    const analysisData = {
      dreamId: dreamId,
      promptSent: prompt,
      geminiResponse: analysisText,
      insights: analysis,
      createdAt: serverTimestamp(),
      modelVersion: 'gemini-1.5-flash'
    }

    const analysisRef = await addDoc(collection(db, 'users', uid, 'analyses'), analysisData)
    const analysisId = analysisRef.id

    // Update dream with analysis ID
    const dreamRef = doc(db, 'users', uid, 'dreams', dreamId)
    await updateDoc(dreamRef, {
      analysisId: analysisId
    })

    // Update user stats
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, {
      stats: {
        totalDreams: 0,
        analysesUsed: increment(1)
      }
    }, { merge: true })

    console.log('Analysis completed:', analysis)
    return {
      analysisId: analysisId,
      insights: analysis,
      modelUsed: 'gemini-1.5-flash'
    }
  } catch (error) {
    console.error('Error analyzing dream:', error)
    throw error
  }
}

// Fallback analysis generator
function generateFallbackAnalysis(title, body) {
  const dreamContent = body.toLowerCase()
  
  // Analyze content for themes
  const themes = []
  const moodTags = []
  
  // Common dream themes detection
  if (dreamContent.includes('water') || dreamContent.includes('ocean') || dreamContent.includes('river')) {
    themes.push({
      symbol: 'Water',
      interpretation: 'Water often represents emotions and the flow of life. Your dream may reflect your emotional state or need for emotional cleansing.'
    })
    moodTags.push('emotional', 'flowing')
  }
  
  if (dreamContent.includes('flying') || dreamContent.includes('falling')) {
    themes.push({
      symbol: 'Flight/Falling',
      interpretation: 'Flying can represent freedom and transcendence, while falling may indicate fears or loss of control in your waking life.'
    })
    moodTags.push('adventurous', 'anxious')
  }
  
  if (dreamContent.includes('house') || dreamContent.includes('home') || dreamContent.includes('room')) {
    themes.push({
      symbol: 'Home/House',
      interpretation: 'Houses in dreams often represent your inner self or psyche. Different rooms can symbolize different aspects of your personality.'
    })
    moodTags.push('introspective', 'secure')
  }
  
  if (dreamContent.includes('chase') || dreamContent.includes('running')) {
    themes.push({
      symbol: 'Pursuit',
      interpretation: 'Being chased often represents avoiding something in your waking life, while chasing can indicate pursuing goals or desires.'
    })
    moodTags.push('urgent', 'determined')
  }
  
  // Default themes if no specific patterns detected
  if (themes.length === 0) {
    themes.push(
      {
        symbol: 'Dream Narrative',
        interpretation: 'The story of your dream reflects your subconscious processing of recent experiences and emotions.'
      },
      {
        symbol: 'Symbolic Elements',
        interpretation: 'Objects and people in your dream often represent aspects of yourself or your life.'
      }
    )
    moodTags.push('reflective', 'contemplative')
  }
  
  // Ensure we have at least 3 themes
  while (themes.length < 3) {
    themes.push({
      symbol: 'Personal Reflection',
      interpretation: 'This dream invites you to reflect on your current life circumstances and emotional state.'
    })
  }
  
  // Generate summary based on content
  const summary = `Your dream about "${title}" appears to be a reflection of your inner thoughts and experiences. Dreams often serve as a way for your mind to process daily events, emotions, and subconscious concerns. This dream may be highlighting aspects of your life that deserve attention or reflection.`
  
  // Generate actionable takeaways
  const takeaway = [
    'Consider what emotions this dream evoked in you and explore their connection to your current life situation',
    'Reflect on any symbols or themes that stood out and what they might represent in your waking life',
    'Use this dream as a starting point for deeper self-reflection and understanding of your inner world'
  ]
  
  return {
    summary,
    themes,
    moodTags: [...new Set(moodTags)], // Remove duplicates
    takeaway,
    disclaimer: 'This analysis is for reflection and personal insight only. It is not medical or clinical advice.'
  }
}
