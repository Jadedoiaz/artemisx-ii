import { useState, useEffect, useCallback } from 'react'
import {
  isNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission,
  sendNotification,
  type NotificationOptions,
} from '../lib/notifications'
import { useSettingsStore } from '../stores/settingsStore'

export function useNotifications() {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const enabled = useSettingsStore((s) => s.notificationsEnabled)
  const setEnabled = useSettingsStore((s) => s.setNotificationsEnabled)

  useEffect(() => {
    setSupported(isNotificationSupported())
    setPermission(getNotificationPermission())
  }, [])

  const enable = useCallback(async () => {
    const granted = await requestNotificationPermission()
    setPermission(getNotificationPermission())
    setEnabled(granted)
    return granted
  }, [setEnabled])

  const notify = useCallback((options: NotificationOptions) => {
    if (enabled) {
      sendNotification(options)
    }
  }, [enabled])

  return { supported, permission, enabled, enable, notify }
}
