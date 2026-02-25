// src/services/pushNotifications.js

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Replace after setup

export const registerSW = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ SW registered:', reg.scope);
    return reg;
  } catch (err) {
    console.log('❌ SW registration failed:', err);
    return null;
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
};

export const subscribeToPush = async (userId) => {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to backend
    const axios = (await import('axios')).default;
    const hostname = window.location.hostname;
    const API_BASE = (hostname === 'localhost' || hostname === '127.0.0.1')
      ? 'http://localhost:5000/api'
      : `http://${hostname}:5000/api`;

    await axios.post(`${API_BASE}/push/subscribe`, {
      userId, subscription: sub.toJSON()
    });
    console.log('✅ Push subscription saved');
    return true;
  } catch (err) {
    console.log('❌ Push subscribe error:', err);
    return false;
  }
};

// Show local notification (no server needed)
export const showLocalNotification = (title, body, url = '/') => {
  if (Notification.permission !== 'granted') return;
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url },
      vibrate: [200, 100, 200]
    });
  });
};

// Schedule daily challenge reminder
export const scheduleDailyReminder = () => {
  const now = new Date();
  const reminder = new Date();
  reminder.setHours(9, 0, 0, 0); // 9 AM
  if (reminder <= now) reminder.setDate(reminder.getDate() + 1);
  const msUntil = reminder - now;

  setTimeout(() => {
    showLocalNotification(
      '🌟 Daily Challenge Available!',
      'Your daily quiz is ready! Complete it to keep your streak 🔥',
      '/daily'
    );
    // Re-schedule for next day
    setInterval(() => {
      showLocalNotification(
        '🌟 Daily Challenge Available!',
        'Your daily quiz is ready! Complete it to keep your streak 🔥',
        '/daily'
      );
    }, 24 * 60 * 60 * 1000);
  }, msUntil);
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}