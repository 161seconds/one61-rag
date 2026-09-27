import { initializeApp } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging"

const firebaseConfig = {
  apiKey: "AIzaSyAKdXZIK9u52AZArTbCgh68x56womqnuxw",
  authDomain: "fconnect-448512.firebaseapp.com",
  projectId: "fconnect-448512",
  storageBucket: "fconnect-448512.firebasestorage.app",
  messagingSenderId: "658372149388",
  appId: "1:658372149388:web:05683e4e788be63195fba9",
  measurementId: "G-68MYSYF93E",
}

const firebaseApp = initializeApp(firebaseConfig)

export const messaging = getMessaging(firebaseApp)

export const getFcmToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })
    return token
  } catch (error) {
    console.error("Error getting FCM token:", error)
    return null
  }
}
