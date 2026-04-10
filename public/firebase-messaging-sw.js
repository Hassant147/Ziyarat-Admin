
importScripts(
  "https://www.gstatic.com/firebasejs/9.3.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.3.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBIxqhIgRIP2VIDtRuwka3t009g7RccdDg",
  authDomain: "ziyarat-admin.firebaseapp.com",
  projectId: "ziyarat-admin",
  storageBucket: "ziyarat-admin.appspot.com",
  messagingSenderId: "193056801857",
  appId: "1:193056801857:web:f178787de37c0d09fd32c0",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
