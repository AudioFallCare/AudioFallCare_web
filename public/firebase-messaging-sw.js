/* public/firebase-messaging-sw.js */

// Firebase v9 compat (Service Worker용)
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

// 백그라운드 푸시 수신
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 백그라운드 메시지 수신:", payload);

  const notificationTitle = payload?.notification?.title || "알림";
  const notificationOptions = {
    body: payload?.notification?.body || "",
    icon: "/vite.svg", // public 폴더 이미지 사용 가능
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
