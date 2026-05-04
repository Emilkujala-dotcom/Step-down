self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

const ALARM_KEY = 'notif_alarms';

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE') {
    const hours = e.data.hours || [8, 13, 19];
    scheduleAlarms(hours);
  }
});

function scheduleAlarms(hours) {
  const now = new Date();
  const alarms = hours.map(h => {
    const t = new Date();
    t.setHours(h, 0, 0, 0);
    if (t <= now) t.setDate(t.getDate() + 1);
    return t.getTime();
  });
  self.registration.showNotification; // keep SW alive hint
  alarms.forEach(ts => {
    const delay = ts - Date.now();
    setTimeout(() => fireNotification(ts), delay);
  });
}

function fireNotification(ts) {
  self.registration.showNotification('Snus Tracker', {
    body: 'Remember to log your pouches today!',
    icon: 'icon.png',
    badge: 'icon.png',
    tag: 'snus-reminder-' + ts,
    renotify: true,
    data: { ts }
  });
  // reschedule for next day
  setTimeout(() => fireNotification(ts + 86400000), 86400000);
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
