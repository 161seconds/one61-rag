importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"
)
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"
)

firebase.initializeApp({
  apiKey: "AIzaSyAKdXZIK9u52AZArTbCgh68x56womqnuxw",
  authDomain: "fconnect-448512.firebaseapp.com",
  projectId: "fconnect-448512",
  messagingSenderId: "658372149388",
  appId: "1:658372149388:web:05683e4e788be63195fba9",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload?.data?.title || "New Notification"
  const notificationOptions = {
    body: payload?.data?.body || "Background Message body.",
    icon: "../src/assets/logo.png",
    data: {
      link: payload?.data?.link || "",
    },
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
