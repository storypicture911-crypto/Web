const APP_VERSION = "4.0.0";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("author-studio-")).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// No fetch cache is used. GitHub Pages should always serve the newest HTML/JS/CSS.
// This service worker exists only to support browser notifications.
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = event.notification.data?.url || "./#journal";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
    const existing = windowClients.find(client => "focus" in client);
    if (existing) {
      if ("navigate" in existing) existing.navigate(target);
      return existing.focus();
    }
    return clients.openWindow(target);
  }));
});
