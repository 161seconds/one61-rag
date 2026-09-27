import { useState, useEffect, useCallback, useMemo } from "react"
import {
  checkBrowserSubscription,
  enableBrowserSubscription,
} from "../features"
import { useCustomToast } from "@/shared/hooks"
import { getBrowser } from "@/shared/utils"
import { getFcmToken } from "@/libs"

export const useBrowserNotification = () => {
  const [isChecking, setIsChecking] = useState(true)
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showErrorToast } = useCustomToast()

  const browser = useMemo(() => getBrowser(), [])

  const requestNotificationPermission = useCallback(async () => {
    if (Notification.permission === "granted") {
      console.log("permission granted")
      return
    }
    setLoading(true)

    const permission = await window.Notification.requestPermission()
    if (permission !== "granted") {
      showErrorToast({
        title: "Permission not granted for Notification",
        description: "Please grant permission to receive notifications",
      })
      return
    }
  }, [])

  const checkBrowserNotification = useCallback(async () => {
    setIsChecking(true)
    try {
      if (Notification.permission !== "granted") {
        setIsEnabled(false)
        return
      }

      const token = await getFcmToken()
      if (!token) {
        setIsEnabled(false)
        return
      }
      await checkBrowserSubscription(browser, token)
      setIsEnabled(true)
    } finally {
      setIsChecking(false)
    }
  }, [])

  const enableBrowserNotification = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        showErrorToast({
          title: "Push Notification is not supported in this browser",
          description: "Please use a browser that supports Push Notification",
        })
        return
      }

      await requestNotificationPermission()

      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" }
        )
      }

      const fcmToken = await getFcmToken()
      if (!fcmToken) {
        throw new Error("Failed to get FCM token")
      }

      await enableBrowserSubscription(browser, fcmToken)

      setIsEnabled(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkBrowserNotification()
  }, [checkBrowserNotification])

  return {
    loading,
    isChecking,
    isEnabled,
    enableBrowserNotification,
  }
}
