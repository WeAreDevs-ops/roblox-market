// src/useNotification.js
export function useNotification() {
  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error('Notification permission error:', e);
      }
    }
  };

  const showNotification = (options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon
      });
    }
  };

  return { requestPermission, showNotification };
}
