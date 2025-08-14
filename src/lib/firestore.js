import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../firebase/firebase.js'

// Dream CRUD operations
export const createDream = async (uid, dreamData) => {
  try {
    const dreamRef = await addDoc(collection(db, 'users', uid, 'dreams'), {
      ...dreamData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      analysisId: null
    })
    
    // Update user stats
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      'stats.totalDreams': increment(1)
    })
    
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
    
    // Update user stats
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      'stats.totalDreams': increment(-1)
    })
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
    
    // Update user stats
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      'stats.analysesUsed': increment(1)
    })
    
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
