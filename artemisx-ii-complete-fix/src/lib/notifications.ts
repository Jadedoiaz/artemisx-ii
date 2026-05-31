export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'default';
  return Notification.permission;
}

export function sendNotification(options: NotificationOptions | string): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;
  if (typeof options === 'string') {
    new Notification(options);
  } else {
    new Notification(options.title, {
      body: options.body || '',
      icon: options.icon || '/favicon.ico',
    });
  }
}
