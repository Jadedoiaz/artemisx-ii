import { useState, useCallback, useEffect } from 'react';
import {
  requestNotificationPermission,
  sendNotification,
  isNotificationSupported,
  getNotificationPermission,
  NotificationOptions,
} from '../lib/notifications';
import { useSettingsStore } from '../stores/settingsStore';

export function useNotifications() {
  const { notificationsEnabled, setNotificationsEnabled } = useSettingsStore();
  const [permission, setPermission] = useState<NotificationPermission | null>(
    getNotificationPermission()
  );
  const [supported, setSupported] = useState(isNotificationSupported());

  useEffect(() => {
    setPermission(getNotificationPermission());
    setSupported(isNotificationSupported());
  }, []);

  const enable = useCallback(async () => {
    if (!supported) return false;
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
      setPermission('granted');
      sendNotification({
        title: 'Artemis X-II',
        body: 'Push notifications enabled successfully',
      });
    } else {
      setPermission('denied');
    }
    return granted;
  }, [supported, setNotificationsEnabled]);

  const disable = useCallback(() => {
    setNotificationsEnabled(false);
  }, [setNotificationsEnabled]);

  const notify = useCallback(
    (options: NotificationOptions) => {
      if (notificationsEnabled && permission === 'granted') {
        sendNotification(options);
      }
    },
    [notificationsEnabled, permission]
  );

  return {
    supported,
    permission,
    enabled: notificationsEnabled,
    enable,
    disable,
    notify,
  };
}
