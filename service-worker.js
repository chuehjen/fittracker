// Self-destruct: unregister and clear all caches
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const regs = await self.registration.getRegistrations();
      for (const reg of regs) await reg.unregister();
      if ('caches' in self) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const regs = await self.registration.getRegistrations();
      for (const reg of regs) await reg.unregister();
      if ('caches' in self) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    })()
  );
  return self.clients.claim();
});
