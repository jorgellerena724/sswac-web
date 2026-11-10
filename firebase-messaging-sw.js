// Avisos de SSWAC en el navegador con la pestana cerrada o en segundo plano.
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js');

// La configuración pública de Firebase llega en la query de la URL con la que
// la app registra este archivo (ver lib/src/core/push_notifications.dart), así
// no hay claves en git ni hay que generarlo en el CI. Sin config no hace nada.
const params = new URL(self.location).searchParams;
if (params.get('projectId')) {
  firebase.initializeApp({
    apiKey: params.get('apiKey'),
    appId: params.get('appId'),
    messagingSenderId: params.get('messagingSenderId'),
    projectId: params.get('projectId'),
  });
  firebase.messaging();
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = (event.notification.data && event.notification.data.FCM_MSG &&
    event.notification.data.FCM_MSG.data) || {};
  const id = data.reservation_id;
  let route = '#/avisos';
  if (id) {
    route = data.kind === 'reservation_new' ? `#/reservas/${id}` : `#/operaciones/${id}`;
  }
  // Relativa a donde está publicada la web (p. ej. .../sswac-web/), no a la raíz.
  route = new URL(route, self.registration.scope).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const w of windows) {
        if ('focus' in w) {
          w.navigate(route);
          return w.focus();
        }
      }
      return clients.openWindow(route);
    }),
  );
});
